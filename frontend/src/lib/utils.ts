import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'LKR'): string {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(1)}K`
  }
  return `${currency} ${amount.toLocaleString()}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(date)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'Just now'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-pending',
    verified: 'badge-verified',
    rejected: 'badge-rejected',
    active: 'badge-verified',
    applied: 'badge-info',
    screening: 'badge-pending',
    interview: 'badge-pending',
    offer: 'badge-verified',
    hired: 'badge-verified',
    withdrawn: 'badge-rejected',
    draft: 'badge-info',
    paused: 'badge-pending',
    closed: 'badge-rejected',
  }
  return map[status?.toLowerCase()] || 'badge-info'
}
