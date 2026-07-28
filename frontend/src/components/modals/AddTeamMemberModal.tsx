'use client'

import { useState } from 'react'
import { X, UserPlus, Mail, User, Shield } from 'lucide-react'

interface AddTeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSubmit: (memberData: any) => void
}

export default function AddTeamMemberModal({ isOpen, onClose, onAddSubmit }: AddTeamMemberModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('recruiter')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddSubmit({ name, email, role })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8 animate-scale-in p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Add Team Member</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kavinda Fernando"
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kavinda@company.lk"
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Role Permission</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            >
              <option value="recruiter">Recruiter (Post jobs, manage candidates)</option>
              <option value="manager">Hiring Manager (Review candidates, approve offers)</option>
              <option value="viewer">Viewer (Read-only pipeline access)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              id="submit-add-team-btn"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
