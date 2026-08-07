'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Video, MessageSquare, CheckCircle, AlertCircle, XCircle, Send, Phone } from 'lucide-react'
import { wahaApi } from '@/lib/api'
import WhatsappConversationModal from '@/components/modals/WhatsappConversationModal'

interface InterviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  interview: {
    id: string
    candidate: string
    job: string
    date: string
    time: string
    mode: string
    status: string
    phone?: string
    interviewer?: string
  } | null
}

export default function InterviewDetailModal({
  isOpen,
  onClose,
  interview,
}: InterviewDetailModalProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [resentToast, setResentToast] = useState(false)

  if (!isOpen || !interview) return null

  const phone = interview.phone || '+94 77 123 4567'

  const handleResend = async () => {
    const cleanPhone = (interview.phone || '94765225044').replace(/\D/g, '')
    try {
      await wahaApi.sendInvite({
        phone: cleanPhone,
        candidate_name: interview.candidate,
        job_title: interview.job,
        employer_name: (interview as any).employer || 'WSO2 Lanka',
        date: interview.date,
        time_slot: interview.time,
        mode: interview.mode,
      })
    } catch (_) {}
    setResentToast(true)
    setTimeout(() => setResentToast(false), 3500)
  }

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
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{interview.candidate}</h2>
                <p className="text-xs text-muted mt-0.5">{interview.job}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toast Alert */}
            {resentToast && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 animate-bounce">
                <Send className="w-4 h-4" />
                <span>WhatsApp reminder dispatched via WhatsApp Gateway!</span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="mt-6 space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Position</span>
                <span className="font-semibold text-foreground">{interview.job}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Employer</span>
                <span className="font-semibold text-foreground">{(interview as any).employer || 'WSO2 Lanka'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Interviewer</span>
                <span className="font-semibold text-foreground">{interview.interviewer}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">WhatsApp Phone</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {interview.phone}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Interview Date</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> {interview.date}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Time Slot</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> {interview.time}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Interview Mode</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Video className="w-3 h-3 text-primary" /> {interview.mode}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-2 pt-4 border-t border-border">
            <button
              onClick={handleResend}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Resend WhatsApp Reminder</span>
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full py-2.5 border border-border bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Show WhatsApp Conversation</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 border border-border bg-surface hover:bg-surface-2 text-rose-600 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel Interview
            </button>
          </div>
        </div>
      </div>

      <WhatsappConversationModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        candidateName={interview.candidate}
        phone={phone}
        jobTitle={interview.job}
      />
    </>
  )
}
