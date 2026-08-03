'use client'

import { useState } from 'react'
import { X, ShieldCheck, Star, MapPin, Phone, Briefcase, FileText, MessageSquare, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import ResumePreviewModal from '@/components/modals/ResumePreviewModal'
import WhatsappConversationModal from '@/components/modals/WhatsappConversationModal'

interface CandidateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: {
    id: string
    name: string
    initials: string
    location: string
    verified: boolean
    rating: string
    matchScore: number
    phone?: string
    experience?: string
    jobTitle?: string
  } | null
  onMoveStage?: () => void
}

export default function CandidateDetailModal({
  isOpen,
  onClose,
  candidate,
  onMoveStage,
}: CandidateDetailModalProps) {
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  if (!isOpen || !candidate) return null

  const phone = candidate.phone || '+94 77 123 4567'
  const experience = candidate.experience || (candidate as any).exp || '6 years'
  const jobTitle = candidate.jobTitle || (candidate as any).title || 'Senior Full Stack Engineer'

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex justify-end animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-surface w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between border-l border-border/80 relative animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shadow-sm">
                  {candidate.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{candidate.name}</h2>
                    {candidate.verified && (
                      <span className="badge-verified text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-primary" /> {candidate.location}, Sri Lanka
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score & Rating Bar */}
            <div className="grid grid-cols-2 gap-3 mt-6 p-4 rounded-xl bg-surface-2/60 border border-border">
              <div>
                <p className="text-[11px] text-muted font-medium uppercase tracking-wider">AI Match Score</p>
                <p className="text-lg font-extrabold text-primary">{candidate.matchScore}% Match</p>
              </div>
              <div>
                <p className="text-[11px] text-muted font-medium uppercase tracking-wider">Candidate Rating</p>
                <p className="text-lg font-extrabold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" /> {candidate.rating} / 5.0
                </p>
              </div>
            </div>

            {/* AI Evaluation Analysis Card */}
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>LangChain AI Agent Analysis Summary</span>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">
                Candidate exhibits high technical alignment ({candidate.matchScore}% match). Qualifications (NIC & NVQ Level 6) verified against national databases. Recommended for technical interview stage.
              </p>
            </div>

            {/* Profile Info Fields */}
            <div className="mt-6 space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Applied for</span>
                <span className="font-semibold text-foreground">{jobTitle}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">WhatsApp Phone</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {phone}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Verified Experience</span>
                <span className="font-semibold text-foreground">{experience}</span>
              </div>
            </div>

            {/* Resume CV Section */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-bold text-foreground mb-2.5">Resume / CV Document</p>
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">{candidate.name}_CV.pdf</p>
                    <p className="text-[10px] text-muted">PDF · Verified Document</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResumeOpen(true)}
                  className="px-3 py-1.5 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-lg transition-colors shrink-0"
                >
                  Preview
                </button>
              </div>
            </div>

            {/* WhatsApp AI Agent Badge */}
            <div className="mt-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">WhatsApp Agent Screened</p>
                  <p className="text-[10px] text-muted">Screened via JobLink Connect Agent</p>
                </div>
              </div>
              <span className="badge-info text-[10px] bg-emerald-500/20 text-emerald-700 font-bold">Bot Verified</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-2 pt-4 border-t border-border">
            <button
              onClick={() => {
                if (onMoveStage) onMoveStage()
                onClose()
              }}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Move to Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full py-2.5 border border-border bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Show WhatsApp Conversation</span>
            </button>
          </div>
        </div>
      </div>

      <ResumePreviewModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        candidateName={candidate.name}
        initials={candidate.initials}
        location={candidate.location}
      />

      <WhatsappConversationModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        candidateName={candidate.name}
        phone={phone}
        jobTitle={jobTitle}
      />
    </>
  )
}
