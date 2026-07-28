'use client'

import { useState } from 'react'
import { X, Building2, MapPin, Globe, Save } from 'lucide-react'

interface EditCompanyProfileModalProps {
  isOpen: boolean
  onClose: () => void
  companyProfile?: {
    companyName: string
    industry: string
    city: string
    website: string
    bio: string
  }
  onSaveProfile: (profile: any) => void
}

export default function EditCompanyProfileModal({
  isOpen,
  onClose,
  companyProfile = {
    companyName: 'WSO2 Lanka (Pvt) Ltd',
    industry: 'Software / Technology',
    city: 'Colombo, Sri Lanka',
    website: 'https://wso2.com',
    bio: 'WSO2 is an open source software provider offering integration, API management, and identity and access management technologies.',
  },
  onSaveProfile,
}: EditCompanyProfileModalProps) {
  const [formData, setFormData] = useState(companyProfile)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile(formData)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-scale-in p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Edit Company Profile</h2>
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
            <label className="block text-xs font-bold text-foreground mb-1.5">Public Company Name</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Industry Sector</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Headquarters City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Website URL</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Company Bio / Description</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
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
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              id="save-company-profile-btn"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
