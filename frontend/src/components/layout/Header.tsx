'use client'

import { useAuthStore, useUIStore } from '@/lib/stores'
import { Moon, Sun, Bell, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import NotificationsDropdown from '@/components/layout/NotificationsDropdown'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, viewingAs, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()

  const displayName = user?.fullName || 'Nadeeka Dias'
  const displayRole = viewingAs || user?.role || 'admin'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = () => {
    logout()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobstart-auth-v2')
      localStorage.removeItem('jobstart-auth')
    }
    router.push('/login')
  }

  const roleLabel = (displayRole === 'admin' ? 'Platform Admin' : displayRole).charAt(0).toUpperCase() + (displayRole === 'admin' ? 'Platform Admin' : displayRole).slice(1)
  const roleSubtext = displayRole === 'admin' ? 'Platform Admin (JobStart Team)' : displayRole

  // Generate dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') {
      return [{ label: roleLabel }, { label: 'Overview' }]
    }
    const segment = pathname.split('/').pop() || ''
    const formatted = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return [{ label: roleLabel }, { label: formatted }]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted font-normal">/</span>}
            <span
              className={cn(
                i === breadcrumbs.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-muted hover:text-foreground transition-colors'
              )}
            >
              {b.label}
            </span>
          </span>
        ))}
      </div>

      {/* Action items */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-foreground transition-colors focus-ring"
          title="Toggle theme"
          id="header-theme-toggle"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* User Profile Pill */}
        <button
          onClick={() => router.push('/dashboard/profile')}
          className="flex items-center gap-2.5 pl-2 p-1.5 rounded-xl hover:bg-surface-2 transition-all cursor-pointer group text-left focus-ring"
          title="View My Profile"
          id="header-user-profile-btn"
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors">{displayName}</p>
            <p className="text-[11px] font-medium text-muted capitalize leading-tight">{roleSubtext}</p>
          </div>
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="ml-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-200 rounded-lg transition-all focus-ring flex items-center gap-1.5 cursor-pointer"
          id="header-signout"
          title="Sign out of JobStart"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
