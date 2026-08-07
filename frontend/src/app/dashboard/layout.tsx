'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/layout/Header'
import Providers from '@/app/providers'
import { useAuthStore, useUIStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const { darkMode } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [darkMode])

  useEffect(() => {
    if (mounted && (!token || !user)) {
      router.push('/login')
    }
  }, [mounted, token, user, router])

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg animate-bounce">
            J
          </div>
          <p className="text-xs text-muted font-medium">Loading HirePth...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return null
  }

  return (
    <Providers>
      <div className={cn('flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200', darkMode && 'dark')}>
        <div className="flex h-full w-full bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background text-foreground">
              {children}
            </main>
          </div>
        </div>
      </div>
    </Providers>
  )
}
