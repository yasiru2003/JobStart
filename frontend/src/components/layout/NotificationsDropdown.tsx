'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, Clock, ShieldCheck, Calendar, Briefcase, Trash2, X } from 'lucide-react'
import { notificationsApi } from '@/lib/api'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'interview' | 'verification' | 'application' | 'system'
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Interview Confirmed',
    message: 'Sunil Rathnayake accepted the interview invitation for Senior React Developer.',
    time: '10 mins ago',
    read: false,
    type: 'interview',
  },
  {
    id: '2',
    title: 'Verification Passed',
    message: 'Kasun Perera’s NVQ Level 6 certificate has been verified via TVEC registry.',
    time: '1 hour ago',
    read: false,
    type: 'verification',
  },
  {
    id: '3',
    title: 'New Candidate Submission',
    message: 'Sanduni Jayawardena submitted an application for Lead UI/UX Designer.',
    time: '3 hours ago',
    read: true,
    type: 'application',
  },
  {
    id: '4',
    title: 'WhatsApp Reminder Queued',
    message: 'Automated 24h WhatsApp join reminder scheduled for Priyanka Jayasuriya.',
    time: '5 hours ago',
    read: true,
    type: 'system',
  },
]

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    async function syncNotifications() {
      try {
        const res = await notificationsApi.getAll()
        if (res.data && Array.isArray(res.data)) {
          const mapped: NotificationItem[] = res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: n.created_at || 'Just now',
            read: Boolean(n.is_read),
            type: n.type || 'system',
          }))
          setNotifications(mapped)
        }
      } catch (_) {}
    }
    syncNotifications()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-emerald-500" />
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-primary" />
      case 'application':
        return <Briefcase className="w-4 h-4 text-accent" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-foreground relative transition-colors focus-ring cursor-pointer"
        title="Notifications"
        id="header-notifications-btn"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-surface animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
          {/* Dropdown Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-2/60">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                    n.read ? 'hover:bg-surface-2/40 opacity-75' : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-surface border border-border/60 shrink-0 shadow-sm">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${n.read ? 'text-foreground/80' : 'text-foreground'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                  </div>

                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="p-1 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Delete notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-muted opacity-30 mx-auto" />
                <p className="text-xs font-medium text-muted">No notifications right now.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
