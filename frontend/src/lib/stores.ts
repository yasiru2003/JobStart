import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'employer' | 'recruiter' | 'candidate'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  tenantId?: string
  tenantDomain?: string
}

const defaultAdminUser: User = {
  id: 'usr_admin_1',
  email: 'nadeeka.dias@hirepth.lk',
  fullName: 'Nadeeka Dias',
  role: 'admin',
}

interface AuthState {
  user: User | null
  token: string | null
  viewingAs: UserRole
  isLoading: boolean
  login: (token: string, user: User) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setViewingAs: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: defaultAdminUser,
      token: 'demo-jwt-token',
      viewingAs: 'admin',
      isLoading: false,
      login: (token: string, user: User) =>
        set({
          token,
          user,
          viewingAs: user.role || 'admin',
          isLoading: false,
        }),
      setUser: (user) => set({ user, viewingAs: user?.role || 'admin' }),
      setToken: (token) => set({ token }),
      setViewingAs: (role) => set({ viewingAs: role }),
      logout: () => set({ user: null, token: null, viewingAs: 'admin' }),
    }),
    {
      name: 'hirepth-auth-v2',
      partialize: (state) => ({ user: state.user, token: state.token, viewingAs: state.viewingAs }),
    }
  )
)

interface UIState {
  sidebarCollapsed: boolean
  darkMode: boolean
  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'hirepth-ui-v2' }
  )
)
