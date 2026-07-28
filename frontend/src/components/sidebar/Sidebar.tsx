'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, UserCircle, Shield,
  Briefcase, FileText, CreditCard, BarChart3, Settings,
  ChevronDown, ChevronRight, CheckSquare, PanelLeftClose,
  PanelLeftOpen, Building2, Bot, Sparkles, LogOut, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, useUIStore, UserRole } from '@/lib/stores'
import { useState } from 'react'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string | number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navByRole: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      label: 'PEOPLE',
      items: [
        { label: 'Employers', href: '/dashboard/employers', icon: Building2 },
        { label: 'Recruiters', href: '/dashboard/recruiters', icon: Users },
        { label: 'Candidates', href: '/dashboard/candidates', icon: UserCircle },
        { label: 'Verification Queue', href: '/dashboard/verification', icon: Shield },
      ],
    },
    {
      label: 'JOBS & INTERVIEWS',
      items: [
        { label: 'Job Postings', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { label: 'AI Assistant', href: '/dashboard/ai-agent', icon: Sparkles },
        { label: 'Payments & Billing', href: '/dashboard/billing', icon: CreditCard },
        { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
  employer: [
    {
      label: 'HIRING',
      items: [
        { label: 'Job Postings', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Candidates', href: '/dashboard/candidates', icon: UserCircle },
        { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
      ],
    },
    {
      label: 'TOOLS & ACCOUNT',
      items: [
        { label: 'AI Assistant', href: '/dashboard/ai-agent', icon: Sparkles },
        { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
  recruiter: [
    {
      label: 'WORK',
      items: [
        { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'Candidates', href: '/dashboard/candidates', icon: UserCircle },
        { label: 'Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
      ],
    },
    {
      label: 'TOOLS & ACCOUNT',
      items: [
        { label: 'AI Assistant', href: '/dashboard/ai-agent', icon: Sparkles },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
  candidate: [
    {
      label: 'MY JOURNEY',
      items: [
        { label: 'Find Jobs', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'My Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
        { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
      ],
    },
    {
      label: 'TOOLS & ACCOUNT',
      items: [
        { label: 'AI Assistant', href: '/dashboard/ai-agent', icon: Sparkles },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, viewingAs, setViewingAs, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])
  const [isAiAgentOpen, setIsAiAgentOpen] = useState(false)

  const activeRole = viewingAs || user?.role || 'admin'
  const groups = navByRole[activeRole] || []

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  return (
    <>
      <aside
        className={cn(
          'flex flex-col h-screen bg-[hsl(var(--sidebar-bg))] border-r border-border',
          'transition-all duration-300 ease-in-out overflow-hidden shrink-0 relative z-20',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Logo Header */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-border shrink-0 transition-all',
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                  <CheckSquare className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-lg text-foreground tracking-tight animate-fade-in">
                  JobStart
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors focus-ring"
                aria-label="Collapse sidebar"
                id="sidebar-toggle-btn"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-all focus-ring"
              title="Expand sidebar"
              aria-label="Expand sidebar"
              id="sidebar-toggle-btn"
            >
              <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Role Switcher (Admin view) */}
        {!sidebarCollapsed && user?.role === 'admin' && (
          <div className="px-3 pt-3 pb-1 border-b border-border/50 shrink-0">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5 px-1">
              VIEWING AS
            </p>
            <div className="flex gap-1 p-1 rounded-lg bg-surface-2">
              {(['employer', 'recruiter', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setViewingAs(role)}
                  className={cn(
                    'flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-all focus-ring',
                    viewingAs === role
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted hover:text-foreground'
                  )}
                  id={`role-switcher-${role}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Overview Link */}
        <div className={cn('px-3 pt-3 shrink-0', sidebarCollapsed && 'px-2 flex justify-center')}>
          <Link
            href="/dashboard"
            className={cn(
              'nav-item',
              sidebarCollapsed && 'justify-center w-10 h-10 p-0 rounded-xl',
              pathname === '/dashboard' && 'active'
            )}
            id="nav-overview"
            title={sidebarCollapsed ? 'Overview' : undefined}
          >
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Overview</span>}
          </Link>
        </div>

        {/* Nav Groups (Scrollable) */}
        <nav className={cn('flex-1 overflow-y-auto px-3 py-2 space-y-4', sidebarCollapsed && 'px-2 flex flex-col items-center')}>
          {groups.map((group) => {
            const isGroupCollapsed = collapsedGroups.includes(group.label)
            return (
              <div key={group.label} className={cn(sidebarCollapsed && 'w-full flex flex-col items-center')}>
                {!sidebarCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-between w-full px-1 mb-1.5 group"
                  >
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest group-hover:text-foreground transition-colors">
                      {group.label}
                    </span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-muted" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-muted" />
                    )}
                  </button>
                )}

                {!isGroupCollapsed && (
                  <div className={cn('space-y-1', sidebarCollapsed && 'w-full flex flex-col items-center')}>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'nav-item',
                            sidebarCollapsed && 'justify-center w-10 h-10 p-0 rounded-xl',
                            isActive && 'active'
                          )}
                          id={`nav-${item.href.split('/').pop()}`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className="w-4.5 h-4.5 shrink-0" />
                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge !== undefined && (
                                <span className="badge-pending text-xs px-1.5 py-0.5">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

      </aside>

      {/* AI Agent Drawer */}
      <AiAgentDrawer
        isOpen={isAiAgentOpen}
        onClose={() => setIsAiAgentOpen(false)}
      />
    </>
  )
}
