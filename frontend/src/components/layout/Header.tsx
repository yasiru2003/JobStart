'use client'

import { useAuthStore, useUIStore } from '@/lib/stores'
import { Moon, Sun, Bell } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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

  // Generate dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    const roleLabel = displayRole.charAt(0).toUpperCase() + displayRole.slice(1)
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
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
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

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-foreground relative transition-colors focus-ring"
          title="Notifications"
          id="header-notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold leading-tight text-foreground">{displayName}</p>
            <p className="text-[11px] font-medium text-muted capitalize leading-tight">{displayRole}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="ml-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-rose-600 border border-border rounded-lg hover:bg-rose-500/10 hover:border-rose-200 transition-all focus-ring"
          id="header-signout"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
