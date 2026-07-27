'use client'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/layout/Header'
import Providers from '@/app/providers'
import { useUIStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUIStore()

  return (
    <Providers>
      <div className={cn('flex h-screen overflow-hidden bg-background relative', darkMode && 'dark')}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background text-foreground relative">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
