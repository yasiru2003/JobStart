'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string | null
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  }

  const bgClasses = {
    success: 'bg-slate-900 text-white border-emerald-500/40 shadow-emerald-950/20',
    error: 'bg-slate-900 text-white border-rose-500/40 shadow-rose-950/20',
    info: 'bg-slate-900 text-white border-amber-500/40 shadow-amber-950/20',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold max-w-md ${bgClasses[type]}`}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
