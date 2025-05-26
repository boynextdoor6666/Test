const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  // --- Auth ---
  async register(data: any) {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async login(data: any) {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  // --- Jobs ---
  async getJobs() {
    const res = await fetch(`${API_URL}/jobs`)
    return res.json()
  },
  async getJob(id: number) {
    const res = await fetch(`${API_URL}/jobs/${id}`)
    return res.json()
  },
  async createJob(data: any) {
    const res = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async updateJob(id: number, data: any) {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    })
    return res.json()
  },
  async deleteJob(id: number) {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return res.json()
  },

  // --- Applications ---
  async apply(job_id: number) {
    const res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ job_id }),
    })
    return res.json()
  },
  async getUserApplications(user_id: number) {
    const res = await fetch(`${API_URL}/applications/user/${user_id}`)
    return res.json()
  },
  async getJobApplications(job_id: number) {
    const res = await fetch(`${API_URL}/applications/job/${job_id}`)
    return res.json()
  },
  async updateApplicationStatus(id: number, status: string) {
    const res = await fetch(`${API_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    })
    return res.json()
  },
} 