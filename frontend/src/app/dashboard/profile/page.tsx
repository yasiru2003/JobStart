'use client'

import { UserCircle, Mail, Phone, MapPin, FileCheck } from 'lucide-react'
import { useAuthStore } from '@/lib/stores'

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-primary" />
          My Profile & Verification Credentials
        </h1>
        <p className="text-sm text-muted">Manage personal information, contact details, and uploaded identity documents.</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary text-white text-2xl font-bold flex items-center justify-center shadow-md">
            {user?.fullName?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.fullName || 'Nadeeka Dias'}</h2>
            <p className="text-sm text-muted capitalize font-medium">{user?.role || 'Admin'} Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
          <div>
            <label className="text-xs font-semibold text-muted">Email Address</label>
            <p className="font-medium text-foreground mt-0.5">{user?.email || 'nadeeka.dias@jobstart.lk'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Phone Number</label>
            <p className="font-medium text-foreground mt-0.5">+94 77 123 4567</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Location</label>
            <p className="font-medium text-foreground mt-0.5">Colombo, Sri Lanka</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Verification Status</label>
            <p className="mt-0.5"><span className="badge-verified">Verified Portal User</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
