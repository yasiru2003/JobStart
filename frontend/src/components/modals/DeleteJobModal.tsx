'use client'

import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteJobModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle?: string
  onConfirmDelete: () => void
}

export default function DeleteJobModal({
  isOpen,
  onClose,
  jobTitle = 'Senior React / Next.js Developer',
  onConfirmDelete,
}: DeleteJobModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8 animate-scale-in p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground">Delete Job Posting?</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-foreground">"{jobTitle}"</span>? This will permanently remove the job listing and its candidate pipeline data.
          </p>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete()
              onClose()
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            id="confirm-delete-job-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Job</span>
          </button>
        </div>
      </div>
    </div>
  )
}
