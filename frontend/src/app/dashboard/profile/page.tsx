'use client'

import { useState } from 'react'
import { UserCircle, Mail, Phone, MapPin, Save, CheckCircle2, Building2 } from 'lucide-react'
import { useAuthStore } from '@/lib/stores'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [fullName, setFullName] = useState(user?.fullName || 'Nadeeka Dias')
  const [email, setEmail] = useState(user?.email || 'nadeeka.dias@hirepth.lk')
  const [phone, setPhone] = useState('+94 77 123 4567')
  const [location, setLocation] = useState('Colombo, Sri Lanka')
  const [agency, setAgency] = useState('HirePth Recruitment LK')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            My Profile & Credentials
          </h1>
          <p className="text-sm text-muted">Manage personal details, contact information, and agency credentials.</p>
        </div>
        {savedSuccess && (
          <span className="badge-verified text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Profile Updated!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary text-white text-2xl font-bold flex items-center justify-center shadow-md">
            {fullName.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted capitalize font-medium">{user?.role || 'Admin'} Account · {agency}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Location / City</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1.5">Agency / Company Name</label>
            <input
              type="text"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="badge-verified">Verified Portal User</span>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  )
}
