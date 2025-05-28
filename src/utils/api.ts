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

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 секунд таймаут
})

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
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
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    })

    // Если API недоступен, автоматически переключаемся в оффлайн режим
    if ((error as any).code === 'NETWORK_ERROR' || error.message.includes('Network Error') || 
        error.message.includes('404') || error.response?.status === 404) {
      console.warn('API unavailable, switching to offline mode');
      setOfflineMode(true);
      (error as any).isNetworkError = true;
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
      // Ошибки сервера
      console.error('Server error:', error.response.status)
    } else if ((error as any).code === 'ECONNABORTED') {
      // Таймаут
      { console.warn('Request timeout'); }
      (error as any).isTimeout = true
    }

    return Promise.reject(error)
  }
)

// Функция для проверки доступности API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 })
    setOfflineMode(false); // Если API доступен, выходим из оффлайн режима
    return response.status === 200
  } catch (error) {
    console.warn('API health check failed:', error)
    setOfflineMode(true); // Если API недоступен, переходим в оффлайн режим
    return false
  }
}

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
    // В демо-режиме создаем фиктивного пользователя Google
    if (isOfflineMode()) {
      const googleUser: User = {
        id: 'google_demo_' + Date.now(),
        name: 'Google User',
        email: 'google_user@example.com',
        phone: '',
        userType: userType as 'worker' | 'employer',
        photo: 'https://via.placeholder.com/150',
        age: 0,
        skills: [],
        experience: '',
        hasOtherJobs: false,
        authProvider: 'google',
        token: 'google_demo_token_' + Date.now()
      };
      
      return {
        data: {
          user: googleUser,
          token: googleUser.token!
        },
        success: true,
        message: 'Демо Google авторизация успешна'
      };
    }
    
    try {
      const response = await api.post('/auth/google/verify', {
        credential,
        userType
      })
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error // Позволяем GoogleSignIn обработать это как сетевую ошибку
      }
      throw error
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
        console.warn('Неизвестный формат ответа API:', response.data)
        // Возвращаем демо-данные, если формат ответа неизвестен
        console.log('Используем демо-данные из-за неизвестного формата ответа')
        return this.getDemoJobs()
      }
    } catch (error: any) {
      console.error('Ошибка при получении вакансий:', error)
      if (error.isNetworkError) {
        console.log('Используем демо-данные из-за сетевой ошибки')
        return this.getDemoJobs()
      }
      // В любом случае возвращаем демо-данные при ошибке
      console.log('Используем демо-данные из-за ошибки')
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
      return response.data.data || response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        const demoJobs = generateDemoJobs()
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
    try {
      const response = await api.post('/jobs', jobData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
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
        
        return {
          data: newJob,
          success: true,
          message: 'Вакансия создана в демо-режиме'
        }
      }
      throw error
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
    try {
      const response = await api.post('/applications', { job_id: jobId })
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Проверяем, не подавал ли уже заявку пользователь
        const applications = JSON.parse(localStorage.getItem('demoApplications') || '[]')
        const userStr = localStorage.getItem('user')
        
        if (userStr) {
          const user = JSON.parse(userStr)
          const existingApplication = applications.find((app: any) => 
            app.job_id.toString() === jobId.toString() && app.user_id === user.id
          )
          
          if (existingApplication) {
            throw new Error('Вы уже откликнулись на эту вакансию')
          }
          
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
          const savedJobs = JSON.parse(localStorage.getItem('demoJobs') || '[]')
          const jobIndex = savedJobs.findIndex((job: Job) => job.id.toString() === jobId.toString())
          
          if (jobIndex !== -1) {
            const currentCount = savedJobs[jobIndex].applications_count || 0
            savedJobs[jobIndex].applications_count = currentCount + 1
            localStorage.setItem('demoJobs', JSON.stringify(savedJobs))
          }
          
          return {
            data: newApplication,
            success: true,
            message: 'Отклик отправлен в демо-режиме'
          }
        }
      }
      throw error
    }
  }
}

export default api