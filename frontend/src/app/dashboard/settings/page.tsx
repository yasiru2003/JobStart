'use client'

import { Settings as SettingsIcon, Bell, Lock, Globe, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Platform Settings
        </h1>
        <p className="text-sm text-muted">Configure portal notifications, security policies, and localization defaults.</p>
      </div>

      <div className="card divide-y divide-border">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-base">Email & Verification Alerts</h3>
              <p className="text-xs text-muted mt-1">Receive real-time notifications when candidates submit NIC or Police Reports.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
        </div>

        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-base">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-muted mt-1">Enforce 2FA for all Admin and Recruiter accounts.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
        </div>

        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-base">Default Currency</h3>
              <p className="text-xs text-muted mt-1">Default billing and salary currency displayed across Sri Lanka platform.</p>
            </div>
          </div>
          <select className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-sm font-semibold">
            <option>LKR (Sri Lankan Rupee)</option>
            <option>USD ($)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
