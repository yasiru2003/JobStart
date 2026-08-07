import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token & tenant headers automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('hirepath-auth-v2')
    if (auth) {
      try {
        const { state } = JSON.parse(auth)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
        if (state?.user?.tenantId) {
          config.headers['X-Tenant-ID'] = state.user.tenantId
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

// ── AI Agent (HirePath AI & Gemini 3.6 Flash Engine) ──

export const aiApi = {
  analyzeCandidate: (data: { candidate_name: string; job_title: string; skills?: string[]; experience_years?: number; documents_verified?: string[] }) =>
    api.post('/ai/analyze-candidate', data),
  draftJob: (data: { role_title: string; department?: string; location?: string; key_requirements?: string[] }) =>
    api.post('/ai/draft-job', data),
  chat: (data: { prompt: string; context_tags?: string[] }) =>
    api.post('/ai/chat', data),
  sinhalaChat: (data: { message: string; history?: { role: string; content: string }[] }) =>
    api.post('/ai/sinhala-chat', data),
  generateQuestions: (data: { candidate_name: string; job_title: string; skills?: string[]; experience_years?: number }) =>
    api.post('/ai/interview-questions', data),
}


// ── Notifications Engine ──
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
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
  create: (data: { title: string; company?: string; location?: string; salary_min?: number; salary_max?: number; description?: string; job_type?: string }) =>
    api.post('/jobs', data),
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

// ── WAHA (WhatsApp HTTP API & Recruiter Agent) ──
export const wahaApi = {
  /** Get current session status */
  status: () => api.get('/whatsapp/status'),
  /** Get QR code as base64 data URI for scanning */
  getQR: () => api.get('/whatsapp/qr'),
  /** Ping the WAHA host to check network connectivity */
  health: () => api.get('/whatsapp/health'),
  /** Start / create the WhatsApp session */
  startSession: () => api.post('/whatsapp/session/start'),
  /** Stop and remove the WhatsApp session */
  stopSession: () => api.post('/whatsapp/session/stop'),
  /** Send a test WhatsApp message to a phone number */
  test: (phone: string) => api.post('/whatsapp/test', { phone }),
  /** Update WAHA host + API key at runtime */
  updateConfig: (host: string, api_key: string, session?: string) =>
    api.put('/whatsapp/config', { host, api_key, session }),
  /** Get AI Agent status & stats */
  agentStatus: () => api.get('/whatsapp/agent/status'),
  /** Get all tracked WhatsApp conversations for recruiters/admins */
  conversations: () => api.get('/whatsapp/agent/conversations'),
  /** Send recruiter interview invitation */
  sendInvite: (data: { phone: string; candidate_name: string; job_title: string; employer_name?: string; date: string; time_slot: string; mode?: string }) =>
    api.post('/whatsapp/agent/send-invite', data),
  /** Send pre-allocated recruiter interview time slots */
  sendSlots: (data: { phone: string; candidate_name: string; job_title: string; employer_name?: string; slots: string[] }) =>
    api.post('/whatsapp/agent/slots/send', data),
  /** Send job match notification */
  notifyMatch: (data: { phone: string; candidate_name: string; matched_jobs: Array<{ job_title: string; score: number }> }) =>
    api.post('/whatsapp/agent/notify-match', data),
  /** Toggle auto-reply AI agent */
  toggleAgent: (enabled: boolean) => api.put('/whatsapp/agent/toggle', { enabled }),
  /** Get candidate screening response time & quality analytics */
  screeningResults: (phone: string) => api.get(`/whatsapp/agent/screening-results?phone=${phone}`),
  /** Send job offer notification */
  sendOffer: (data: { phone: string; candidate_name: string; job_title: string; employer_name?: string }) =>
    api.post('/whatsapp/agent/send-offer', data),
}

