'use client'

import { X, FileText, CheckCircle2, MapPin, Briefcase, GraduationCap, Award, ShieldCheck } from 'lucide-react'
import { CANDIDATE_CVS } from '@/lib/candidateCvData'

interface ResumePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName?: string
  initials?: string
  location?: string
}

// CANDIDATE_CVS is imported from @/lib/candidateCvData — single source of truth

export default function ResumePreviewModal({
  isOpen,
  onClose,
  candidateName = 'Kasun Perera',
  initials = 'KP',
  location = 'Colombo',
}: ResumePreviewModalProps) {
  if (!isOpen) return null

  const cv = CANDIDATE_CVS[candidateName] || CANDIDATE_CVS['Kasun Perera']

  return (
    <div className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="bg-surface border border-border/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{candidateName}_CV.pdf</h2>
              <p className="text-[11px] text-muted flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified CV Document · PDF 2 pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resume Preview Paper */}
        <div className="p-6 bg-surface-2/60">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">{candidateName}</h3>
                <p className="text-xs font-semibold text-primary">{cv.role}</p>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary" /> {location}, Sri Lanka
                </p>
              </div>
            </div>

            {/* Summary */}
            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Professional Summary
              </p>
              <p className="text-xs text-foreground leading-relaxed">{cv.summary}</p>
            </div>

            {/* Work Experience */}
            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Verified Work History
              </p>
              <div className="space-y-2.5">
                {cv.experience.map((exp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface-2/60 border border-border/60">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-foreground">{exp.role}</strong>
                      <span className="text-[10px] text-muted font-mono">{exp.period}</span>
                    </div>
                    <p className="text-[11px] text-primary font-medium">{exp.company}</p>
                    <p className="text-[11px] text-muted mt-1">{exp.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Education & Academic Credentials
              </p>
              <p className="text-xs text-foreground font-medium">{cv.education}</p>
            </div>

            {/* Skills */}
            <div>
              <p className="text-[11px] font-extrabold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Technical Skills & Frameworks
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* National Registry Verification */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> National Database Audit & Verification
              </p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">{cv.verification}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
