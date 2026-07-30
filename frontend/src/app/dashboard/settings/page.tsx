'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Lock, Globe, Shield, Users, Building2, CreditCard, Plus, Edit3, Trash2 } from 'lucide-react'
import AddTeamMemberModal from '@/components/modals/AddTeamMemberModal'
import EditCompanyProfileModal from '@/components/modals/EditCompanyProfileModal'
import ChangePlanModal from '@/components/modals/ChangePlanModal'
import Toast from '@/components/ui/Toast'
import WAHASettingsCard from '@/components/modals/WAHASettingsCard'

const INITIAL_TEAM = [
  { id: '1', name: 'Nadeeka Dias', email: 'nadeeka.dias@jobstart.lk', role: 'Admin', initials: 'ND' },
  { id: '2', name: 'Kavinda Fernando', email: 'kavinda@jobstart.lk', role: 'Recruiter', initials: 'KF' },
  { id: '3', name: 'Sahan Gunawardena', email: 'sahan@wso2.com', role: 'Hiring Manager', initials: 'SG' },
]

export default function SettingsPage() {
  const [team, setTeam] = useState(INITIAL_TEAM)
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [companyProfile, setCompanyProfile] = useState({
    companyName: 'WSO2 Lanka (Pvt) Ltd',
    industry: 'Software / Technology',
    city: 'Colombo, Sri Lanka',
    website: 'https://wso2.com',
    bio: 'WSO2 is an open source software provider offering integration, API management, and identity and access management technologies.',
  })

  const [plan, setPlan] = useState('Growth Plan (LKR 95,000 / mo)')

  const handleAddMember = (m: any) => {
    const initials = m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    setTeam([...team, { id: String(Date.now()), initials, ...m }])
    setToast(`Invitation sent to ${m.name} (${m.email})!`)
  }

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id))
    setToast('Team member removed.')
  }

  const handleSaveProfile = (p: any) => {
    setCompanyProfile(p)
    setToast('Company profile updated successfully!')
  }

  const handleSelectPlan = (planId: string) => {
    const label = planId === 'starter' ? 'Starter Plan (LKR 45,000 / mo)' : planId === 'enterprise' ? 'Enterprise Plan (LKR 250,000 / mo)' : 'Growth Plan (LKR 95,000 / mo)'
    setPlan(label)
    setToast(`Subscription updated to ${label}!`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in relative">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            Company & Account Settings
          </h1>
          <p className="text-sm text-muted">Manage company profile, recruiter team members, billing plan, and security policies.</p>
        </div>
      </div>

      {/* 1. Company Profile Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{companyProfile.companyName}</h2>
              <p className="text-xs text-muted">{companyProfile.industry} · {companyProfile.city}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-3.5 py-1.5 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span>Edit Profile</span>
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed pt-2 border-t border-border">{companyProfile.bio}</p>
      </div>

      {/* 2. Team Members Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Recruiter Team Members</h2>
              <p className="text-xs text-muted">Manage team members with access to your job pipelines</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddTeamOpen(true)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Team Member</span>
          </button>
        </div>

        <div className="divide-y divide-border pt-2">
          {team.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  {m.initials}
                </div>
                <div>
                  <p className="font-bold text-foreground">{m.name}</p>
                  <p className="text-muted text-[11px]">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge-info text-[10px] capitalize font-bold">{m.role}</span>
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. WhatsApp Cloud Integration */}
      <WAHASettingsCard onToast={(msg) => setToast(msg)} />

      {/* 4. Subscription & Billing Plan Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Current Subscription Tier</h2>
              <p className="text-xs text-primary font-bold mt-0.5">{plan}</p>
            </div>
          </div>

          <button
            onClick={() => setIsChangePlanOpen(true)}
            className="px-3.5 py-1.5 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
          >
            Change Plan
          </button>
        </div>
      </div>

      {/* 4. Notification & Security Preferences */}
      <div className="card divide-y divide-border">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-sm">Email & Verification Alerts</h3>
              <p className="text-xs text-muted mt-0.5">Receive real-time alerts when candidates submit NIC or Police Clearance Reports.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
        </div>

        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-sm">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-muted mt-0.5">Enforce 2FA for all Admin and Recruiter accounts.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
        </div>
      </div>

      {/* Modals */}
      <AddTeamMemberModal
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        onAddSubmit={handleAddMember}
      />

      <EditCompanyProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        companyProfile={companyProfile}
        onSaveProfile={handleSaveProfile}
      />

      <ChangePlanModal
        isOpen={isChangePlanOpen}
        onClose={() => setIsChangePlanOpen(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
