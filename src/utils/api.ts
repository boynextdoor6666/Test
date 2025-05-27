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

class ApiService {
  private api: AxiosInstance

  constructor() {
    // Определяем базовый URL для API
    const baseURL = import.meta.env.VITE_API_URL || 
                   (import.meta.env.DEV ? 'http://localhost:4000' : '/api')

    this.api = axios.create({
      baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor для добавления токена авторизации
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor для обработки ответов
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Если получили 401, очищаем токен и перенаправляем на логин
        if (error.response?.status === 401) {
          this.clearToken()
          // Перенаправляем на страницу логина только если не находимся уже там
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Методы для работы с токеном
  private getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token)
  }

  private clearToken(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Методы аутентификации
  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
    userType?: 'worker' | 'employer'
    photo?: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/users/register', userData)
    
    if (response.data.token) {
      this.setToken(response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/users/login', credentials)
    
    if (response.data.token) {
      this.setToken(response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  async googleAuth(credential: string, userType?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/auth/google/verify', { 
      credential, 
      userType 
    })
    
    if (response.data.token) {
      this.setToken(response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  logout(): void {
    this.clearToken()
  }

  // Методы для работы с пользователями
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/users/me')
    return response.data
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put('/users/me', userData)
    
    // Обновляем пользователя в localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<{}>> {
    const response = await this.api.put('/users/change-password', data)
    return response.data
  }

  async deleteAccount(password: string): Promise<ApiResponse<{}>> {
    const response = await this.api.delete('/users/me', { data: { password } })
    this.clearToken()
    return response.data
  }

  // Методы для работы с вакансиями
  async getJobs(params?: {
    page?: number
    limit?: number
    category?: string
    location?: string
    search?: string
    salary_min?: number
    salary_max?: number
    employment_type?: string
    urgency?: string
    sort_by?: string
    sort_order?: string
  }): Promise<{ jobs: Job[]; pagination: any }> {
    const response = await this.api.get('/jobs', { params })
    return response.data
  }

  async getJob(id: number): Promise<Job> {
    const response = await this.api.get(`/jobs/${id}`)
    return response.data
  }

  async createJob(jobData: {
    title: string
    description: string
    salary?: string
    location?: string
    phone?: string
    date?: string
    category?: string
    requirements?: string[]
    employer?: string
    urgency?: string
    employment_type?: string
  }): Promise<ApiResponse<{ job: Job }>> {
    const response = await this.api.post('/jobs', jobData)
    return response.data
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<ApiResponse<{}>> {
    const response = await this.api.put(`/jobs/${id}`, jobData)
    return response.data
  }

  async deleteJob(id: number): Promise<ApiResponse<{}>> {
    const response = await this.api.delete(`/jobs/${id}`)
    return response.data
  }

  async getMyJobs(params?: { page?: number; limit?: number }): Promise<{ jobs: Job[]; pagination: any }> {
    const response = await this.api.get('/jobs/my/jobs', { params })
    return response.data
  }

  // Методы для работы с откликами
  async applyToJob(jobId: number, coverLetter?: string): Promise<ApiResponse<{ application: Application }>> {
    const response = await this.api.post('/applications', { 
      job_id: jobId, 
      cover_letter: coverLetter 
    })
    return response.data
  }

  async getUserApplications(userId: number, params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ applications: Application[]; pagination: any }> {
    const response = await this.api.get(`/applications/user/${userId}`, { params })
    return response.data
  }

  async getJobApplications(jobId: number, params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ applications: Application[]; pagination: any }> {
    const response = await this.api.get(`/applications/job/${jobId}`, { params })
    return response.data
  }

  async updateApplicationStatus(
    applicationId: number, 
    status: string, 
    employerComment?: string
  ): Promise<ApiResponse<{}>> {
    const response = await this.api.put(`/applications/${applicationId}`, {
      status,
      employer_comment: employerComment
    })
    return response.data
  }

  async withdrawApplication(applicationId: number): Promise<ApiResponse<{}>> {
    const response = await this.api.delete(`/applications/${applicationId}`)
    return response.data
  }

  // Методы для работы с профилем
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/profile')
    return response.data
  }

  async updateProfileExtended(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put('/profile', profileData)
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  async uploadPhoto(photo: string): Promise<ApiResponse<{ photo: string }>> {
    const response = await this.api.post('/profile/photo', { photo })
    return response.data
  }

  async deletePhoto(): Promise<ApiResponse<{}>> {
    const response = await this.api.delete('/profile/photo')
    return response.data
  }

  async getPublicProfile(userId: number): Promise<ApiResponse<{ profile: any }>> {
    const response = await this.api.get(`/profile/public/${userId}`)
    return response.data
  }

  // Методы для получения статистики
  async getJobsStats(): Promise<any> {
    const response = await this.api.get('/jobs/stats/overview')
    return response.data
  }

  async getEmployerStats(): Promise<any> {
    const response = await this.api.get('/applications/stats/employer')
    return response.data
  }

  async getWorkerStats(): Promise<any> {
    const response = await this.api.get('/applications/stats/worker')
    return response.data
  }

  // Метод для проверки здоровья API
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health')
    return response.data
  }

  // Утилитарные методы
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}

// Экспортируем единственный экземпляр
export const apiService = new ApiService()
export default apiService