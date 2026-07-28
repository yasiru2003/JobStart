'use client'

import { useState } from 'react'
import { X, CreditCard, CheckCircle2 } from 'lucide-react'

interface ChangePlanModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  onSelectPlan: (planId: string) => void
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: 'LKR 45,000 / mo', desc: 'Up to 5 active jobs, basic candidate screening, 10 WAHA WhatsApp invites' },
  { id: 'growth', name: 'Growth (Popular)', price: 'LKR 95,000 / mo', desc: 'Up to 20 active jobs, AI screening agent, unlimited WAHA WhatsApp invitations' },
  { id: 'enterprise', name: 'Enterprise Scale', price: 'LKR 250,000 / mo', desc: 'Unlimited jobs, dedicated WAHA instance, custom ATS integrations & SLA' },
]

export default function ChangePlanModal({
  isOpen,
  onClose,
  currentPlan = 'growth',
  onSelectPlan,
}: ChangePlanModalProps) {
  const [selected, setSelected] = useState(currentPlan)

  if (!isOpen) return null

  const handleConfirm = () => {
    onSelectPlan(selected)
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
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Change Subscription Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {PLANS.map((p) => {
            const isSel = selected === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`p-4 rounded-xl border cursor-pointer flex items-start justify-between gap-3 transition-all ${
                  isSel
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-surface-2 hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">{p.name}</p>
                    <span className="text-xs font-bold text-primary">{p.price}</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{p.desc}</p>
                </div>

                {isSel && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
              </div>
            )
          })}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            id="confirm-change-plan-btn"
          >
            Update Subscription Plan
          </button>
        </div>
      </div>
    </div>
  )
}
