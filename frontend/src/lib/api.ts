import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('jobstart-auth')
    if (auth) {
      try {
        const { state } = JSON.parse(auth)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (_) {}
    }
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('jobstart-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; role: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
}

// ── Dashboard ──
export const dashboardApi = {
  adminOverview: () => api.get('/dashboard/admin'),
  employerOverview: () => api.get('/dashboard/employer'),
  recruiterOverview: () => api.get('/dashboard/recruiter'),
  candidateOverview: () => api.get('/dashboard/candidate'),
  applicationsTrend: (weeks: number = 8) =>
    api.get(`/dashboard/applications-trend?weeks=${weeks}`),
}

// ── Jobs ──
export const jobsApi = {
  list: (params?: Record<string, unknown>) => api.get('/jobs', { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/jobs', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
}

// ── Applications ──
export const applicationsApi = {
  list: (params?: Record<string, unknown>) => api.get('/applications', { params }),
  get: (id: string) => api.get(`/applications/${id}`),
  apply: (jobId: string, data: Record<string, unknown>) =>
    api.post(`/jobs/${jobId}/apply`, data),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/applications/${id}/status`, { status, recruiter_notes: notes }),
}

// ── Verification ──
export const verificationApi = {
  queue: (params?: Record<string, unknown>) => api.get('/verification/queue', { params }),
  approve: (candidateId: string, notes?: string) =>
    api.post(`/verification/${candidateId}/approve`, { notes }),
  reject: (candidateId: string, reason: string) =>
    api.post(`/verification/${candidateId}/reject`, { reason }),
  uploadDocument: (formData: FormData) =>
    api.post('/verification/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// ── Employers ──
export const employersApi = {
  list: (params?: Record<string, unknown>) => api.get('/employers', { params }),
  get: (id: string) => api.get(`/employers/${id}`),
  update: (data: Record<string, unknown>) => api.patch('/employers/me', data),
}

// ── Candidates ──
export const candidatesApi = {
  list: (params?: Record<string, unknown>) => api.get('/candidates', { params }),
  get: (id: string) => api.get(`/candidates/${id}`),
  updateProfile: (data: Record<string, unknown>) => api.patch('/candidates/me', data),
}

// ── Billing ──
export const billingApi = {
  plans: () => api.get('/billing/plans'),
  currentSubscription: () => api.get('/billing/subscription'),
  createCheckout: (planId: string) => api.post('/billing/checkout', { plan_id: planId }),
  cancelSubscription: () => api.delete('/billing/subscription'),
  invoices: () => api.get('/billing/invoices'),
}

// ── Reports ──
export const reportsApi = {
  revenue: (period: string = 'month') => api.get(`/reports/revenue?period=${period}`),
  applications: (period: string = 'month') => api.get(`/reports/applications?period=${period}`),
  placements: (period: string = 'month') => api.get(`/reports/placements?period=${period}`),
}
