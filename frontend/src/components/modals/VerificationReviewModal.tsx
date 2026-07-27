'use client'

import { useState } from 'react'
import { X, ShieldCheck, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react'

interface VerificationReviewModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: {
    id: string
    name: string
    docType: string
    nic: string
    submitted: string
  } | null
  onDecision: (candidateId: string, status: 'Verified' | 'Rejected', notes: string) => void
}

export default function VerificationReviewModal({
  isOpen,
  onClose,
  candidate,
  onDecision,
}: VerificationReviewModalProps) {
  const [notes, setNotes] = useState('')

  if (!isOpen || !candidate) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Review Identity Documents</h2>
              <p className="text-xs text-muted">Verify NIC barcode and Sri Lanka Police Clearance Certificate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Candidate Details summary */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-surface-2 border border-border rounded-xl text-xs">
            <div>
              <span className="text-muted font-semibold">Candidate Name:</span>
              <p className="font-bold text-foreground text-sm mt-0.5">{candidate.name}</p>
            </div>
            <div>
              <span className="text-muted font-semibold">NIC / Reg Number:</span>
              <p className="font-mono font-bold text-primary text-sm mt-0.5">{candidate.nic}</p>
            </div>
            <div>
              <span className="text-muted font-semibold">Documents Submitted:</span>
              <p className="font-medium text-foreground mt-0.5">{candidate.docType}</p>
            </div>
            <div>
              <span className="text-muted font-semibold">Submission Date:</span>
              <p className="font-medium text-foreground mt-0.5">{candidate.submitted}</p>
            </div>
          </div>

          {/* Document Preview Placeholder */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-3 bg-surface-2/30">
            <FileText className="w-10 h-10 text-primary mx-auto opacity-80" />
            <div>
              <p className="text-sm font-bold text-foreground">National Identity Card & Police Clearance Document</p>
              <p className="text-xs text-muted mt-0.5">Scanned resolution: 300 DPI · Verified Digital Stamp</p>
            </div>
            <button className="px-3.5 py-1.5 bg-surface border border-border hover:bg-surface-2 text-foreground font-semibold text-xs rounded-lg transition-colors">
              Open High-Res Document Scanner
            </button>
          </div>

          {/* Auditor Notes Input */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Verification Auditor Notes / Reason</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. NIC verified against Department of Registration of Persons database..."
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Decision Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDecision(candidate.id, 'Rejected', notes)
                  onClose()
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                id="modal-reject-btn"
              >
                <XCircle className="w-4 h-4" /> Reject Document
              </button>
              <button
                onClick={() => {
                  onDecision(candidate.id, 'Verified', notes)
                  onClose()
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                id="modal-verify-btn"
              >
                <CheckCircle className="w-4 h-4" /> Approve & Mark Verified
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
