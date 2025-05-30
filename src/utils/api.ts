/**
 * API Service Module
 * 
 * This module provides API communication for the application.
 * 
 * IMPORTANT: To configure the API URL, create a .env file with:
 * VITE_API_URL=http://your-api-server-url
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
  rating?: number // Рейтинг для работодателей (от 1 до 5)
  reviewCount?: number // Количество отзывов
  token?: string
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
  employer_id: number
  employer_photo?: string
  employer_rating?: number
  employer_review_count?: number
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

// Добавляем интерфейс для отзыва
export interface Review {
  id: number
  user_id: number
  employer_id?: number  // Optional for worker reviews
  worker_id?: number    // Optional for employer reviews
  rating: number
  content: string
  created_at: string
  job_id?: number       // ID of the job for which the review is created
  user: {
    id: number
    name: string
    avatar?: string
  }
}

// Добавляем интерфейс для ответа с отзывами
export interface ReviewsResponse {
  reviews: Review[]
  total: number
  average_rating: number
}

// Проверка, работаем ли мы в демо-режиме
export const isOfflineMode = (): boolean => {
  return import.meta.env.VITE_API_URL ? false : true;
}

// Установка демо-режима
export const setOfflineMode = (offline: boolean): void => {
  if (offline) {
    console.log('Warning: Offline mode is deprecated, please provide VITE_API_URL in .env file');
  }
  // Не сохраняем в localStorage для избежания демо-режима
}

// Получаем API URL с fallback
const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Log API base URL for debugging
console.log('API URL configured as:', API_BASE);

// НЕ форсируем оффлайн-режим
// setOfflineMode(true);
// console.log('Forcing offline mode initially due to server issues');

// Ensure the base URL is properly formatted
const getFormattedApiUrl = () => {
  return API_BASE;
}

const api = axios.create({
  baseURL: getFormattedApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  // Модифицируем validateStatus чтобы обрабатывать 404 как ошибку
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Считаем только 2xx коды успешными
  }
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
    console.error('API request error:', error)
    return Promise.reject(error)
  }
)

// Обработка ответов с сервера
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('API request error - no response received:', error.request)
    } else {
      console.error('Error setting up API request:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Аутентификация
export const authAPI = {
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
    try {
      const response = await api.post('/auth/register', userData)
      
      // Сохраняем данные пользователя и токен
      if (response.data.user && response.data.token) {
        const user = {
          ...response.data.user,
          token: response.data.token,
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/auth/login', credentials)
      
      // Сохраняем данные пользователя и токен
      if (response.data.user && response.data.token) {
        const user = {
          ...response.data.user,
          token: response.data.token,
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  // Для телеграм-авторизации
  async telegramAuth(telegramData: any, userType = 'worker'): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/auth/telegram', { 
        ...telegramData, 
        userType 
      })
      
      // Сохраняем данные пользователя и токен
      if (response.data.user && response.data.token) {
        const user = {
          ...response.data.user,
          token: response.data.token,
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  logout() {
    localStorage.removeItem('user')
    return { success: true, message: 'Logged out successfully' }
  },
  
  // Проверка авторизации
  isAuthenticated() {
    const user = localStorage.getItem('user')
    if (!user) return false
    
    try {
      const userData = JSON.parse(user)
      return !!userData.token
    } catch (e) {
      return false
    }
  },
  
  // Получение данных текущего пользователя
  getCurrentUser() {
    const user = localStorage.getItem('user')
    if (!user) return null
    
    try {
      return JSON.parse(user)
    } catch (e) {
      return null
    }
  },
  
  // Декодирование JWT токена
  parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  },
  
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      // Обновляем локальные данные пользователя
      if (response.data.data) {
        const currentUser = this.getCurrentUser()
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...response.data.data,
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
      
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  }
}

// API для работы с вакансиями
export const jobsAPI = {
  async getJobs(params?: any): Promise<PaginatedResponse<Job>> {
    try {
      const response = await api.get('/jobs', { params })
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async getJob(id: number | string): Promise<Job> {
    try {
      const response = await api.get(`/jobs/${id}`)
      return response.data.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await api.post('/jobs', jobData)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async updateJob(id: number | string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await api.put(`/jobs/${id}`, jobData)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async deleteJob(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/jobs/${id}`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async apply(jobId: number | string): Promise<ApiResponse<Application>> {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async getMyApplications(): Promise<PaginatedResponse<Application>> {
    try {
      const response = await api.get('/applications/my')
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async getJobApplications(jobId: number | string): Promise<PaginatedResponse<Application>> {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async updateApplicationStatus(
    jobId: number | string,
    applicationId: number | string,
    status: 'accepted' | 'rejected'
  ): Promise<ApiResponse<Application>> {
    try {
      const response = await api.put(`/jobs/${jobId}/applications/${applicationId}`, { status })
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async cancelApplication(jobId: number | string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/jobs/${jobId}/apply`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async completeJob(jobId: number | string): Promise<ApiResponse<Job>> {
    try {
      const response = await api.put(`/jobs/${jobId}/complete`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  }
}

// Добавляем API для работы с отзывами
export const reviewsAPI = {
  async getEmployerReviews(employerId: number): Promise<ReviewsResponse> {
    try {
      const response = await api.get(`/employers/${employerId}/reviews`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async getWorkerReviews(workerId: number): Promise<ReviewsResponse> {
    try {
      const response = await api.get(`/workers/${workerId}/reviews`)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async createReview(reviewData: {
    employer_id?: number
    worker_id?: number
    job_id?: number
    rating: number
    content: string
  }): Promise<ApiResponse<Review>> {
    try {
      const response = await api.post('/reviews', reviewData)
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async canReviewWorker(workerId: number, jobId?: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get(`/workers/${workerId}/can-review`, {
        params: { job_id: jobId }
      })
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  },
  
  async canReviewEmployer(employerId: number, jobId?: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get(`/employers/${employerId}/can-review`, {
        params: { job_id: jobId }
      })
      return response.data
    } catch (error: any) {
      throw error.response ? error.response.data : error
    }
  }
}

export default api