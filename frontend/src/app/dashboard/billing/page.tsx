'use client'

import { useState } from 'react'
import { CreditCard, Check } from 'lucide-react'
import ChangePlanModal from '@/components/modals/ChangePlanModal'
import Toast from '@/components/ui/Toast'
import { billingApi } from '@/lib/api'

export default function BillingPage() {
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const [activePlanId, setActivePlanId] = useState('growth')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    setActivePlanId(planId)
    try {
      await billingApi.createCheckout(planId)
    } catch (_) {}
    setToastMsg(`🎉 Subscription checkout initiated for ${planId.toUpperCase()} Plan!`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payments & Subscription Billing
        </h1>
        <p className="text-sm text-muted">Manage employer subscription plans, recurring invoices, and payment gateways.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-2 border-border flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Starter Plan</h3>
            <p className="text-xs text-muted mt-1">Ideal for small teams hiring occasionally</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">LKR 45,000</span>
              <span className="text-xs text-muted"> / month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 5 Active Job Postings</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Basic Candidate Verification</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Email Support</li>
            </ul>
          </div>
          <button
            onClick={() => setIsChangeModalOpen(true)}
            className="mt-8 w-full py-2.5 bg-surface-2 hover:bg-border font-semibold text-xs text-foreground rounded-xl transition-colors cursor-pointer"
          >
            {activePlanId === 'starter' ? 'Current Active Plan' : 'Select Starter Plan'}
          </button>
        </div>

        <div className="card p-6 border-2 border-[#0F766E] relative flex flex-col justify-between shadow-md">
          <span className="absolute -top-3 right-6 bg-[#0F766E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Most Popular
          </span>
          <div>
            <h3 className="text-xl font-bold text-foreground">Growth Plan</h3>
            <p className="text-xs text-muted mt-1">For growing companies hiring tech & ops roles</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">LKR 95,000</span>
              <span className="text-xs text-muted"> / month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 20 Active Job Postings</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Priority NIC + Police Check</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated Recruiter Match</li>
            </ul>
          </div>
          <button
            onClick={() => setIsChangeModalOpen(true)}
            className="mt-8 w-full py-2.5 bg-[#0F766E] hover:bg-[#0d9488] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {activePlanId === 'growth' ? 'Current Active Plan' : 'Select Growth Plan'}
          </button>
        </div>

        <div className="card p-6 border-2 border-[#F59E0B] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Scale / Enterprise</h3>
            <p className="text-xs text-muted mt-1">Unlimited hiring for large enterprises & BPOs</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">LKR 250,000</span>
              <span className="text-xs text-muted"> / month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited Job Listings</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Instant Document OCR Verification</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom API & ATS Integration</li>
            </ul>
          </div>
          <button
            onClick={() => setIsChangeModalOpen(true)}
            className="mt-8 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {activePlanId === 'enterprise' ? 'Current Active Plan' : 'Select Enterprise Plan'}
          </button>
        </div>
      </div>

      <ChangePlanModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        currentPlan={activePlanId}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
