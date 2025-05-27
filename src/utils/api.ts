import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// Типы для API
export interface User {
  id: number
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
}

export interface Job {
  id: number
  title: string
  description: string
  salary: string
  salary_amount?: number
  location: string
  phone: string
  date?: string
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`
      }
    } catch (e) {
      console.error('Error parsing user token:', e)
    }
  }
  return config
})

// Обработка ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем неверный токен и перенаправляем на логин
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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
  }) {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  // Логин
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  // Google авторизация
  async googleAuth(credential: string, userType = 'worker') {
    const response = await api.post('/auth/google/verify', {
      credential,
      userType
    })
    return response.data
  },

  // Получение профиля
  async getProfile() {
    const response = await api.get('/users/me')
    return response.data
  },

  // Обновление профиля
  async updateProfile(profileData: any) {
    const response = await api.put('/users/me', profileData)
    return response.data
  }
}

export default api