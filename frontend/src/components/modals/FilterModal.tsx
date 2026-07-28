'use client'

import { useState } from 'react'
import { X, Filter, Check } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: any) => void
}

export default function FilterModal({ isOpen, onClose, onApplyFilters }: FilterModalProps) {
  const [verification, setVerification] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [experience, setExperience] = useState('all')

  if (!isOpen) return null

  const toggleVerification = (opt: string) => {
    setVerification((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  const toggleLocation = (loc: string) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    )
  }

  const handleApply = () => {
    onApplyFilters({ verification, locations, experience })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8 animate-scale-in p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Filter Candidates & Applications</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Section: Verification Status */}
        <div>
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
            Verification Status
          </label>
          <div className="space-y-1.5">
            {['NIC Verified', 'Police Clearance Verified', 'Pending Verification', 'Unverified'].map((opt) => {
              const checked = verification.includes(opt)
              return (
                <div
                  key={opt}
                  onClick={() => toggleVerification(opt)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-medium transition-all ${
                    checked
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-surface-2 text-foreground hover:border-primary/30'
                  }`}
                >
                  <span>{opt}</span>
                  {checked && <Check className="w-3.5 h-3.5" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter Section: Location */}
        <div>
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
            Region / Location
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Negombo', 'Remote'].map((loc) => {
              const checked = locations.includes(loc)
              return (
                <div
                  key={loc}
                  onClick={() => toggleLocation(loc)}
                  className={`p-2 rounded-xl border cursor-pointer text-center text-xs font-medium transition-all ${
                    checked
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-surface-2 text-foreground'
                  }`}
                >
                  {loc}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => {
              setVerification([])
              setLocations([])
              setExperience('all')
            }}
            className="text-xs font-semibold text-muted hover:text-foreground"
          >
            Reset Filters
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              id="apply-filters-btn"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
