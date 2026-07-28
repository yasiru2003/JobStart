'use client'

import { X, FileText, CheckCircle2, MapPin } from 'lucide-react'

interface ResumePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName?: string
  initials?: string
  location?: string
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  candidateName = 'Kasun Perera',
  initials = 'KP',
  location = 'Colombo',
}: ResumePreviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{candidateName}_CV.pdf</h2>
              <p className="text-[11px] text-muted">Verified Document · PDF 2 pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resume Preview Paper */}
        <div className="p-6 bg-surface-2/60">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5 min-h-[380px]">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">{candidateName}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary" /> {location}, Sri Lanka
                </p>
              </div>
            </div>

            {/* Simulated CV Content Sections */}
            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">Verified Work Experience</p>
              <div className="space-y-1.5">
                <div className="h-2 bg-surface-2 rounded-full w-[92%]" />
                <div className="h-2 bg-surface-2 rounded-full w-[78%]" />
                <div className="h-2 bg-surface-2 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">Technical Skills & NVQ Certification</p>
              <div className="space-y-1.5">
                <div className="h-2 bg-surface-2 rounded-full w-[68%]" />
                <div className="h-2 bg-surface-2 rounded-full w-[75%]" />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2">References & Verification</p>
              <div className="h-2 bg-surface-2 rounded-full w-[55%]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
