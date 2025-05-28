/**
 * API Service Module
 * 
 * This module provides API communication for the application with offline fallback support.
 * 
 * IMPORTANT: To configure the API URL, create a .env file with:
 * VITE_API_URL=http://your-api-server-url
 * 
 * Without this configuration, the application will run in offline/demo mode.
 */

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Типы для API
export interface User {
  id: number | string
  name: string
  email: string
  phone: string
  userType: 'worker' | 'employer'
  photo: string
  age: number
  skills: string[]
  experience: string
  hasOtherJobs: boolean
  authProvider: string
  token?: string
  password?: string // Only used in demo mode, not in production
}

export interface Job {
  id: number
  title: string
  description: string
  salary: string
  salary_amount?: number
  location: string
  phone: string
  date: string
  category: string
  requirements: string[]
  employer: string
  employer_photo?: string
  urgency: 'low' | 'medium' | 'high'
  employment_type: 'full-time' | 'part-time' | 'freelance' | 'contract'
  user_id: number
  applications_count?: number
  created_at: string
  updated_at: string
  applications?: any[]
}

export interface Application {
  id: number
  job_id: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  cover_letter: string
  applied_at: string
  updated_at: string
  job?: Partial<Job>
  applicant?: Partial<User>
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
}

// Проверка, работаем ли мы в демо-режиме
export const isOfflineMode = (): boolean => {
  return localStorage.getItem('offlineMode') === 'true';
}

// Установка демо-режима
export const setOfflineMode = (offline: boolean): void => {
  localStorage.setItem('offlineMode', offline ? 'true' : 'false');
  console.log(`App mode set to: ${offline ? 'offline/demo' : 'online'}`);
}

// Инициализация демо-пользователей, если их еще нет
const initDemoUsers = (): void => {
  if (!localStorage.getItem('demoUsers')) {
    const demoUsers = [
      {
        id: 'demo_worker_1',
        name: 'Демо Работник',
        email: 'worker@example.com',
        password: 'password123',
        phone: '+996 555 123456',
        userType: 'worker',
        photo: '',
        age: 25,
        skills: ['Уборка', 'Готовка'],
        experience: '2 года опыта работы',
        hasOtherJobs: true,
        authProvider: 'local',
        token: 'demo_token_worker'
      },
      {
        id: 'demo_employer_1',
        name: 'Демо Работодатель',
        email: 'employer@example.com',
        password: 'password123',
        phone: '+996 555 789012',
        userType: 'employer',
        photo: '',
        age: 35,
        skills: [],
        experience: '',
        hasOtherJobs: false,
        authProvider: 'local',
        token: 'demo_token_employer'
      }
    ];
    localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
  }
}

// Инициализируем демо-пользователей при загрузке
initDemoUsers();

// Получаем API URL с fallback
const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Log API base URL for debugging
console.log('API URL configured as:', API_BASE);

// Ensure the base URL is properly formatted
const getFormattedApiUrl = () => {
  // For development mode, don't force offline mode
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    console.log('Development mode with default API URL');
    return '/api';
  }
  
  return API_BASE;
}

const api = axios.create({
  baseURL: getFormattedApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000, // Уменьшаем таймаут до 5 секунд для предотвращения зависания запросов
  // Добавляем настройки для лучшей обработки ошибок сети
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Обрабатываем только ошибки клиента вручную
  }
})

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    // Устанавливаем таймаут для каждого запроса, если он не был установлен ранее
    if (!config.timeout) {
      config.timeout = 5000;
    }
    
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
      } catch (e) {
        console.error('Error parsing user token:', e)
        // Удаляем поврежденные данные пользователя
        localStorage.removeItem('user')
      }
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Улучшенная обработка ошибок
api.interceptors.response.use(
  (response) => {
    // Check if the response contains HTML instead of JSON data
    if (typeof response.data === 'string' && 
        (response.data.includes('<!doctype html>') || 
         response.data.includes('<html'))) {
      console.warn('Received HTML instead of JSON in response from:', response.config.url);
      
      // Only switch to offline mode in production
      if (!import.meta.env.DEV) {
        console.log('Switching to offline/demo mode automatically');
        setOfflineMode(true);
      } else {
        console.log('Received HTML in development mode - staying in online mode');
      }
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    })

    // Если API недоступен, автоматически переключаемся в оффлайн режим
    if ((error as any).code === 'NETWORK_ERROR' || 
        error.message.includes('Network Error') || 
        error.message.includes('404') || 
        error.response?.status === 404 ||
        (error as any).code === 'ECONNABORTED' || 
        error.message.includes('timeout')) {
      console.warn('API unavailable or timeout, switching to offline mode');
      setOfflineMode(true);
      (error as any).isNetworkError = true;
      
      // Для таймаутов добавляем специальное свойство
      if ((error as any).code === 'ECONNABORTED' || error.message.includes('timeout')) {
        (error as any).isTimeout = true;
      }
    }

    // Обработка различных типов ошибок
    if (error.response?.status === 401) {
      // Неавторизованный доступ - удаляем токен и перенаправляем
      console.warn('Unauthorized access, clearing user data')
      localStorage.removeItem('user')
      
      // Перенаправляем только если не находимся уже на странице логина
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Запрещенный доступ
      console.warn('Forbidden access')
    } else if (error.response && error.response.status !== undefined && error.response.status >= 500) {
      // Ошибки сервера - переключаемся в оффлайн режим
      console.error('Server error:', error.response.status);
      setOfflineMode(true);
      (error as any).isNetworkError = true;
    } else if ((error as any).code === 'ECONNABORTED') {
      // Таймаут
      console.warn('Request timeout');
      (error as any).isTimeout = true;
      setOfflineMode(true);
    }

    return Promise.reject(error)
  }
)

// Force online mode if needed (for development)
export const forceOnlineMode = (): void => {
  setOfflineMode(false);
  console.log('Forced ONLINE mode');
}

// Функция для проверки доступности API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // In development mode, don't do health checks - just stay online
    if (import.meta.env.DEV) {
      console.log('Development mode: skipping health check, assuming API is available');
      setOfflineMode(false);
      return true;
    }
    
    // Log that we're checking health
    console.log('Checking API health at:', `${getFormattedApiUrl()}/health`);
    
    const response = await axios.get(`${getFormattedApiUrl()}/health`, { 
      timeout: 3000,
      // Avoid caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // Check if the response is HTML instead of a valid health check response
    if (typeof response.data === 'string' && 
        (response.data.includes('<!doctype html>') || 
         response.data.includes('<html'))) {
      console.warn('Received HTML in health check. API server not running correctly.');
      setOfflineMode(true);
      return false;
    }
    
    console.log('API health check successful:', response.data);
    setOfflineMode(false); // Если API доступен, выходим из оффлайн режима
    return response.status === 200;
  } catch (error) {
    console.warn('API health check failed:', error);
    setOfflineMode(true); // Если API недоступен, переходим в оффлайн режим
    return false;
  }
}

// Automatically check API health when the module is loaded
// Use setTimeout to allow the app to initialize first
setTimeout(() => {
  // Force online mode in development
  if (import.meta.env.DEV) {
    forceOnlineMode();
    console.log('Application running in ONLINE mode (development)');
  } else {
    // Only do health checks in production
    checkApiHealth().then(isHealthy => {
      console.log(`API health check complete. API is ${isHealthy ? 'available' : 'unavailable'}.`);
      console.log(`Application running in ${isOfflineMode() ? 'OFFLINE/DEMO' : 'ONLINE'} mode.`);
    });
  }
}, 1000);

export const authAPI = {
  // Регистрация
  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
    userType: string
    photo?: string
    age?: number
    skills?: string[]
    experience?: string
    hasOtherJobs?: boolean
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    // Если мы в оффлайн режиме, сразу используем демо-регистрацию
    if (isOfflineMode()) {
      return this.demoRegister(userData);
    }
    
    try {
      const response = await api.post('/users/register', userData)
      return response.data
    } catch (error: any) {
      // Если ошибка сети или API недоступен, используем демо-режим
      if (error.isNetworkError || error.response?.status === 404) {
        return this.demoRegister(userData);
      }
      throw error
    }
  },

  // Демо-регистрация для оффлайн режима
  demoRegister(userData: any): ApiResponse<{ user: User; token: string }> {
    // Проверяем, существует ли пользователь с таким email
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    const existingUser = demoUsers.find((u: any) => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Создаем нового пользователя с паролем для демо-режима
    const demoUser = {
          id: 'demo_' + Date.now(),
          name: userData.name,
          email: userData.email,
      password: userData.password, // Сохраняем пароль только для демо-пользователей
          phone: userData.phone || '',
          userType: userData.userType as 'worker' | 'employer',
          photo: userData.photo || '',
          age: userData.age || 0,
          skills: userData.skills || [],
          experience: userData.experience || '',
          hasOtherJobs: userData.hasOtherJobs || false,
          authProvider: 'local',
          token: 'demo_token_' + Date.now()
    };
    
    // Добавляем пользователя в демо-базу
    demoUsers.push(demoUser);
    localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
    
    console.log('Demo user registered:', demoUser);
    
    // Убираем пароль из возвращаемого объекта
    const { password, ...newUser } = demoUser;
    
    // Возвращаем пользователя и токен
        return {
          data: {
        user: newUser as User,
        token: demoUser.token
          },
          success: true,
      message: 'Регистрация выполнена в демо-режиме'
    };
  },

  // Логин
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    // Если мы в оффлайн режиме, сразу используем демо-логин
    if (isOfflineMode()) {
      return this.demoLogin(credentials);
    }
    
    try {
      const response = await api.post('/users/login', credentials)
      return response.data
    } catch (error: any) {
      // Если ошибка сети или API недоступен, используем демо-режим
      if (error.isNetworkError || error.response?.status === 404) {
        return this.demoLogin(credentials);
      }
      throw error
    }
  },

  // Демо-логин для оффлайн режима
  demoLogin(credentials: { email: string; password: string }): ApiResponse<{ user: User; token: string }> {
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    const user = demoUsers.find(
      (u: any) => u.email === credentials.email && u.password === credentials.password
    );
        
        if (user) {
      // Удаляем пароль из объекта пользователя перед возвратом
      const { password, ...userWithoutPassword } = user;
      
          return {
            data: {
          user: userWithoutPassword,
              token: user.token || 'demo_token_' + Date.now()
            },
            success: true,
            message: 'Демо-вход успешен'
      };
        } else {
      throw new Error('Неверный email или пароль');
    }
  },

  // Google авторизация
  async googleAuth(credential: string, userType = 'worker'): Promise<ApiResponse<{ user: User; token: string }>> {
    // В демо-режиме создаем пользователя на основе JWT данных
    if (isOfflineMode()) {
      try {
        // Декодируем JWT токен для получения данных пользователя
        const tokenData = this.parseJwt(credential);
        console.log('Декодированные данные JWT:', tokenData);
        
        if (!tokenData) {
          throw new Error('Не удалось декодировать данные пользователя из токена');
        }
        
        // Создаем пользователя на основе реальных данных из JWT
        const googleUser: User = {
          id: 'google_' + Date.now(),
          name: tokenData.name || 'Google User',
          email: tokenData.email || 'google_user@example.com',
          phone: '',
          userType: userType as 'worker' | 'employer',
          photo: tokenData.picture || 'https://via.placeholder.com/150',
          age: 0,
          skills: [],
          experience: '',
          hasOtherJobs: false,
          authProvider: 'google',
          token: 'google_token_' + Date.now()
        };
        
        // Сохраняем пользователя в демо-базу
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
        
        // Проверяем, существует ли пользователь с таким email
        const existingUser = demoUsers.find((u: any) => u.email === googleUser.email);
        
        if (existingUser) {
          // Обновляем существующего пользователя и используем его
          Object.assign(existingUser, { 
            ...googleUser,
            id: existingUser.id, // Сохраняем ID
            token: 'google_token_' + Date.now() // Обновляем токен
          });
          localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
          
          return {
            data: {
              user: existingUser,
              token: existingUser.token!
            },
            success: true,
            message: 'Вход через Google выполнен успешно (демо-режим)'
          };
        } else {
          // Добавляем нового пользователя
          demoUsers.push(googleUser);
          localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
          
          return {
            data: {
              user: googleUser,
              token: googleUser.token!
            },
            success: true,
            message: 'Регистрация через Google выполнена успешно (демо-режим)'
          };
        }
      } catch (error) {
        console.error('Ошибка при обработке Google Auth в демо-режиме:', error);
        throw error;
      }
    }
    
    try {
      const response = await api.post('/auth/google/verify', {
        credential,
        userType
      })
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Если сетевая ошибка, переключаемся в демо-режим и повторяем запрос
        setOfflineMode(true);
        return this.googleAuth(credential, userType);
      }
      throw error
    }
  },

  // Вспомогательный метод для декодирования JWT
  parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return null;
    }
  },

  // Получение профиля
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Возвращаем данные из localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          return {
            data: user,
            success: true,
            message: 'Профиль загружен из кэша'
          }
        }
      }
      throw error
    }
  },

  // Обновление профиля
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put('/users/me', profileData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Обновляем данные локально
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          const updatedUser = { ...user, ...profileData }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          
          return {
            data: updatedUser,
            success: true,
            message: 'Профиль обновлен локально'
          }
        }
      }
      throw error
    }
  }
}

// Демо-данные для оффлайн режима
const generateDemoJobs = (): Job[] => [
  {
    id: 1,
    title: 'Курьер на день',
    description: 'Доставка документов по городу на 1 день. Требуется ответственный человек с транспортом.',
    salary: '1000 сом',
    salary_amount: 1000,
    location: 'Бишкек',
    phone: '+996 555 123456',
    date: new Date().toISOString(),
    category: 'Доставка',
    requirements: ['Наличие транспорта', 'Ответственность'],
    employer: 'ОсОО "Быстрая доставка"',
    urgency: 'medium' as const,
    employment_type: 'part-time' as const,
    user_id: 1,
    applications_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Помощник на мероприятие',
    description: 'Требуется помощник для организации свадебного мероприятия. Работа на выходных.',
    salary: '1500 сом',
    salary_amount: 1500,
    location: 'Бишкек',
    phone: '+996 555 789012',
    date: new Date().toISOString(),
    category: 'Мероприятия',
    requirements: ['Коммуникабельность', 'Опрятный внешний вид'],
    employer: 'Event Agency "Праздник"',
    urgency: 'high' as const,
    employment_type: 'freelance' as const,
    user_id: 2,
    applications_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Уборка помещения',
    description: 'Уборка офиса после ремонта. Необходимо убрать строительный мусор и провести влажную уборку.',
    salary: '2000 сом',
    salary_amount: 2000,
    location: 'Бишкек',
    phone: '+996 555 345678',
    date: new Date().toISOString(),
    category: 'Уборка',
    requirements: ['Опыт уборки', 'Наличие инвентаря'],
    employer: 'Строительная компания "Ремонт+"',
    urgency: 'low' as const,
    employment_type: 'contract' as const,
    user_id: 3,
    applications_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const jobsAPI = {
  async getJobs(): Promise<Job[]> {
    try {
      const response = await api.get('/jobs')
      
      // Check if response contains HTML instead of JSON
      if (typeof response.data === 'string' && 
          (response.data.includes('<!doctype html>') || 
           response.data.includes('<html'))) {
        console.warn('Received HTML instead of JSON. API server may not be running correctly.');
        
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          console.log('Switching to offline/demo mode');
          setOfflineMode(true);
        } else {
          console.log('Development mode: using demo jobs but staying in online mode');
          forceOnlineMode();
        }
        return this.getDemoJobs();
      }
      
      // Проверяем разные форматы ответа
      if (response.data && response.data.jobs) {
        console.log('Получены вакансии из API:', response.data.jobs.length)
        return response.data.jobs
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('Получены вакансии из data:', response.data.data.length)
        return response.data.data
      } else if (Array.isArray(response.data)) {
        console.log('Получены вакансии напрямую:', response.data.length)
        return response.data
      } else {
        console.warn('Неизвестный формат ответа API:', 
          typeof response.data === 'string' 
            ? response.data.substring(0, 100) + '...' 
            : JSON.stringify(response.data).substring(0, 100) + '...');
        // Возвращаем демо-данные, если формат ответа неизвестен
        console.log('Используем демо-данные из-за неизвестного формата ответа')
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          setOfflineMode(true);
        } else {
          forceOnlineMode();
        }
        return this.getDemoJobs()
      }
    } catch (error: any) {
      console.error('Ошибка при получении вакансий:', error)
      if (error.isNetworkError) {
        console.log('Используем демо-данные из-за сетевой ошибки')
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          setOfflineMode(true);
        } else {
          forceOnlineMode();
        }
        return this.getDemoJobs()
      }
      // В любом случае возвращаем демо-данные при ошибке
      console.log('Используем демо-данные из-за ошибки')
      // Only switch to offline mode in production
      if (!import.meta.env.DEV) {
        setOfflineMode(true);
      } else {
        forceOnlineMode();
      }
      return this.getDemoJobs()
    }
  },

  // Helper method to get demo jobs from localStorage or generate defaults
  getDemoJobs(): Job[] {
    // First try to get saved jobs from localStorage
    const savedJobs = localStorage.getItem('demoJobs')
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs)
        if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
          console.log(`Loaded ${parsedJobs.length} jobs from localStorage`)
          return parsedJobs
        }
      } catch (e) {
        console.error('Error parsing saved jobs:', e)
      }
    }
    
    // If no saved jobs or error, return generated demo jobs
    const demoJobs = generateDemoJobs()
    localStorage.setItem('demoJobs', JSON.stringify(demoJobs))
    return demoJobs
  },

  async getJob(id: number | string): Promise<Job> {
    try {
      const response = await api.get(`/jobs/${id}`)
      
      // Check if response contains HTML instead of JSON
      if (typeof response.data === 'string' && 
          (response.data.includes('<!doctype html>') || 
           response.data.includes('<html'))) {
        console.warn('Received HTML instead of JSON. API server may not be running correctly.');
        
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          console.log('Switching to offline/demo mode');
          setOfflineMode(true);
        } else {
          console.log('Development mode: using demo job but staying in online mode');
          forceOnlineMode();
        }
        
        // Fallback to demo jobs
        const demoJobs = this.getDemoJobs();
        const job = demoJobs.find(j => j.id.toString() === id.toString());
        if (job) {
          return job;
        }
        throw new Error('Вакансия не найдена');
      }
      
      return response.data.data || response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          setOfflineMode(true);
        } else {
          forceOnlineMode();
        }
        
        const demoJobs = this.getDemoJobs();
        const job = demoJobs.find(j => j.id.toString() === id.toString())
        if (job) {
          return job
        }
        throw new Error('Вакансия не найдена')
      }
      throw error
    }
  },

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    // Сразу проверяем, если мы в оффлайн режиме
    if (isOfflineMode() && !import.meta.env.DEV) {
      return this.createDemoJob(jobData);
    }
    
    try {
      const response = await api.post('/jobs', jobData)
      
      // Check if response contains HTML instead of JSON
      if (typeof response.data === 'string' && 
          (response.data.includes('<!doctype html>') || 
           response.data.includes('<html'))) {
        console.warn('Received HTML instead of JSON. API server may not be running correctly.');
        
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          console.log('Switching to offline/demo mode and creating job locally');
          setOfflineMode(true);
        } else {
          console.log('Development mode: creating demo job but staying in online mode');
          forceOnlineMode();
        }
        
        return this.createDemoJob(jobData);
      }
      
      return response.data
    } catch (error: any) {
      console.log('Ошибка при создании вакансии через API:', error);
      
      // Проверяем на сетевую ошибку или 404 (Not Found)
      if (error.isNetworkError || error.response?.status === 404) {
        console.log('Переключаемся в режим демо из-за недоступности API');
        
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          setOfflineMode(true);
        } else {
          forceOnlineMode();
        }
        
        return this.createDemoJob(jobData);
      }
      throw error
    }
  },
  
  // Выделяем создание демо-вакансии в отдельную функцию для переиспользования
  createDemoJob(jobData: Partial<Job>): ApiResponse<Job> {
    // Get current user
    const userData = localStorage.getItem('user')
    let employerName = 'Демо работодатель'
    let userId = 1

    if (userData) {
      try {
        const user = JSON.parse(userData)
        employerName = user.name || 'Демо работодатель'
        userId = user.id || 1
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

        const newJob: Job = {
          id: Date.now(),
          title: jobData.title || '',
          description: jobData.description || '',
          salary: jobData.salary || '',
          location: jobData.location || '',
          phone: jobData.phone || '',
          category: jobData.category || '',
          date: jobData.date || new Date().toISOString(),
          requirements: [],
      employer: employerName,
          urgency: 'medium' as const,
          employment_type: 'part-time' as const,
      user_id: userId,
          created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      applications_count: 0
        }
    
    // Save to localStorage for demo mode
    const savedJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]')
    savedJobs.unshift(newJob) // Add at beginning of array
    localStorage.setItem('demoJobs', JSON.stringify(savedJobs))
    
    console.log('Вакансия создана в демо-режиме:', newJob)
        
        return {
          data: newJob,
          success: true,
          message: 'Вакансия создана в демо-режиме'
    }
  },

  async updateJob(id: number | string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await api.put(`/jobs/${id}`, jobData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Update job in localStorage
        const savedJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]')
        const jobIndex = savedJobs.findIndex((job: Job) => job.id.toString() === id.toString())
        
        if (jobIndex !== -1) {
          // Update existing job with new data
          const updatedJob = { ...savedJobs[jobIndex], ...jobData, updated_at: new Date().toISOString() }
          savedJobs[jobIndex] = updatedJob
          localStorage.setItem('demoJobs', JSON.stringify(savedJobs))
          
          return {
            data: updatedJob as Job,
            success: true,
            message: 'Вакансия обновлена в демо-режиме'
          }
        }
        
        return {
          data: { ...jobData, id: Number(id) } as Job,
          success: true,
          message: 'Вакансия обновлена в демо-режиме'
        }
      }
      throw error
    }
  },

  async deleteJob(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/jobs/${id}`)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Delete job from localStorage
        const savedJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]')
        const filteredJobs = savedJobs.filter((job: Job) => job.id.toString() !== id.toString())
        localStorage.setItem('demoJobs', JSON.stringify(filteredJobs))
        
        return {
          data: undefined,
          success: true,
          message: 'Вакансия удалена в демо-режиме'
        }
      }
      throw error
    }
  },

  async apply(jobId: number | string): Promise<ApiResponse<Application>> {
    // Ensure we have a valid user
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      throw new Error('Необходимо авторизоваться для отклика на вакансию')
    }
    
    const user = JSON.parse(userStr)
    
    // Always check if the user has already applied, regardless of mode
    // This prevents duplicate applications even in online mode
    const applications = JSON.parse(localStorage.getItem('demoApplications') || '[]')
    const existingApplication = applications.find((app: any) => 
      app.job_id.toString() === jobId.toString() && app.user_id === user.id
    )
    
    if (existingApplication) {
      throw new Error('Вы уже откликнулись на эту вакансию')
    }
    
    // Check for offline mode first to avoid unnecessary API calls
    // In development mode, don't skip API calls
    if (isOfflineMode() && !import.meta.env.DEV) {
      return this.demoApply(jobId, user, applications);
    }
    
    try {
      // Try to use the actual API with a shorter timeout
      const response = await api.post('/applications', { job_id: jobId }, { 
        timeout: 3000 // Reduce timeout to 3 seconds to prevent long-hanging requests
      })
      
      // Check if response contains HTML instead of JSON
      if (typeof response.data === 'string' && 
          (response.data.includes('<!doctype html>') || 
           response.data.includes('<html'))) {
        console.warn('Received HTML instead of JSON. API server may not be running correctly.');
        
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          console.log('Switching to offline/demo mode');
          setOfflineMode(true);
        } else {
          console.log('Development mode: using demo application but staying in online mode');
          forceOnlineMode();
        }
        
        return this.demoApply(jobId, user, applications);
      }
      
      // If successful, also save to localStorage for consistency
      const newApplication: Application = {
        id: response.data.data?.id || Date.now(),
        job_id: Number(jobId),
        status: 'pending',
        cover_letter: '',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Store in local storage for persistent state
      const applicationWithUser = { ...newApplication, user_id: user.id }
      applications.push(applicationWithUser)
      localStorage.setItem('demoApplications', JSON.stringify(applications))
      
      // Update local job count for UI consistency
      this.updateLocalJobApplicationCount(jobId)
      
      console.log('Application sent successfully in online mode')
      
      return {
        data: response.data.data || newApplication,
        success: true,
        message: response.data.message || 'Отклик успешно отправлен'
      }
    } catch (error: any) {
      console.error('Error applying for job:', error)
      
      // If network error or API unavailable, fall back to demo mode
      if (error.isNetworkError || error.response?.status === 404 || error.code === 'ECONNABORTED') {
        // Only switch to offline mode in production
        if (!import.meta.env.DEV) {
          console.log('Falling back to demo mode for job application');
          setOfflineMode(true);
        } else {
          console.log('Development mode: using demo application but staying in online mode');
          forceOnlineMode();
        }
        
        return this.demoApply(jobId, user, applications);
      }
      
      // Rethrow other errors
      throw error
    }
  },
  
  // Helper method for demo mode application to reduce code duplication
  demoApply(jobId: number | string, user: any, applications: any[]): ApiResponse<Application> {
    console.log('Using demo mode for job application')
    
    const newApplication: Application = {
      id: Date.now(),
      job_id: Number(jobId),
      status: 'pending',
      cover_letter: '',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Add application to localStorage
    const applicationWithUser = { ...newApplication, user_id: user.id }
    applications.push(applicationWithUser)
    localStorage.setItem('demoApplications', JSON.stringify(applications))
    
    // Update job's application count in localStorage
    this.updateLocalJobApplicationCount(jobId)
    
    return {
      data: newApplication,
      success: true,
      message: 'Отклик отправлен (демо-режим)'
    }
  },
  
  // Helper method to update job application count in local storage
  updateLocalJobApplicationCount(jobId: number | string): void {
    const savedJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]')
    const jobIndex = savedJobs.findIndex((job: Job) => job.id.toString() === jobId.toString())
    
    if (jobIndex !== -1) {
      const currentCount = savedJobs[jobIndex].applications_count || 0
      savedJobs[jobIndex].applications_count = currentCount + 1
      
      // Also add an application to the job's applications array if it exists
      if (!savedJobs[jobIndex].applications) {
        savedJobs[jobIndex].applications = []
      }
      
      // Get user data for the application
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        savedJobs[jobIndex].applications.push({
          applicantId: Date.now(),
          applicantName: user.name || user.fullName || 'Соискатель',
          appliedAt: new Date().toISOString(),
          status: 'new'
        })
      }
      
      localStorage.setItem('demoJobs', JSON.stringify(savedJobs))
    }
  }
}

// Utility functions for development mode
export const devUtils = {
  // Toggle between online and offline modes
  toggleMode: (): void => {
    if (import.meta.env.DEV) {
      const newMode = !isOfflineMode();
      setOfflineMode(newMode);
      console.log(`[DEV] Manually toggled to ${newMode ? 'OFFLINE/DEMO' : 'ONLINE'} mode`);
    } else {
      console.warn('toggleMode is only available in development mode');
    }
  },
  
  // Force online mode
  forceOnline: (): void => {
    if (import.meta.env.DEV) {
      setOfflineMode(false);
      console.log('[DEV] Forced ONLINE mode');
    } else {
      console.warn('forceOnline is only available in development mode');
    }
  },
  
  // Force offline mode
  forceOffline: (): void => {
    if (import.meta.env.DEV) {
      setOfflineMode(true);
      console.log('[DEV] Forced OFFLINE/DEMO mode');
    } else {
      console.warn('forceOffline is only available in development mode');
    }
  },
  
  // Get current mode
  getCurrentMode: (): string => {
    return isOfflineMode() ? 'OFFLINE/DEMO' : 'ONLINE';
  }
};

export default api