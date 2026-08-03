'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, Search, Filter, Video, MapPin, CheckCircle, AlertCircle, XCircle, CheckCheck, Building2 } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import InterviewDetailModal from '@/components/modals/InterviewDetailModal'
import { useAuthStore } from '@/lib/stores'

const INITIAL_INTERVIEWS = [
  { id: '1', candidate: 'Janith Alwis', phone: '+94 71 222 3344', job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', date: '25 Jul 2026', time: '10:00 AM – 11:00 AM', mode: 'Google Meet', status: 'confirmed', interviewer: 'Kavinda Fernando', wahaSent: true },
  { id: '2', candidate: 'Kasun Perera', phone: '+94 77 123 4567', job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', date: '26 Jul 2026', time: '02:00 PM – 03:00 PM', mode: 'WhatsApp Call', status: 'awaiting', interviewer: 'Kavinda Fernando', wahaSent: false },
  { id: '5', candidate: 'Kasun Perera', phone: '+94 77 123 4567', job: 'Full Stack Engineer', employer: 'Zone24x7', date: '30 Jul 2026', time: '10:30 AM – 11:30 AM', mode: 'Google Meet', status: 'confirmed', interviewer: 'Chamara Wickramasinghe', wahaSent: true },
  { id: '3', candidate: 'Sanduni Jayawardena', phone: '+94 71 987 6543', job: 'Lead UI/UX Designer', employer: 'WSO2 Lanka', date: '27 Jul 2026', time: '11:00 AM – 12:00 PM', mode: 'Google Meet', status: 'confirmed', interviewer: 'Nalaka Bandara', wahaSent: true },
  { id: '4', candidate: 'Priyanka Jayasuriya', phone: '+94 75 456 7890', job: 'DevOps & Cloud Architect', employer: 'WSO2 Lanka', date: '28 Jul 2026', time: '09:30 AM – 10:30 AM', mode: 'On-site (Colombo 03)', status: 'confirmed', interviewer: 'Nadeeka Dias', wahaSent: true },
]

const STATUS_BADGES: Record<string, { label: string; cls: string; icon: any }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  awaiting:  { label: 'Awaiting',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',   icon: AlertCircle },
  declined:  { label: 'Declined',  cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',       icon: XCircle },
}

export default function InterviewsPage() {
  const { user, viewingAs } = useAuthStore()
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null)
  const [sendingWahaId, setSendingWahaId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const effectiveRole = viewingAs || user?.role || 'admin'
  const isCandidate = effectiveRole === 'candidate'
  const isEmployerOrRecruiter = effectiveRole === 'employer' || effectiveRole === 'recruiter'
  const candidateName = user?.fullName || ''
  const userCompany = user?.tenantDomain || (isEmployerOrRecruiter ? 'WSO2' : null)

  const handleScheduleSubmit = (data: any) => {
    const newIv = {
      id: String(Date.now()),
      candidate: data.candidateSearch || 'New Candidate',
      phone: data.candidatePhone || '+94 77 000 0000',
      job: data.jobTitle || 'Software Engineer',
      employer: 'JobStart Employer',
      date: data.date || '2026-07-29',
      time: `${data.startTime} – ${data.endTime}`,
      mode: data.locationType === 'virtual' ? 'Google Meet' : 'On-site',
      status: 'awaiting',
      interviewer: data.interviewers || 'Recruitment Team',
      wahaSent: Boolean(data.sendWahaWhatsApp),
    }
    setInterviews([newIv, ...interviews])
    setIsModalOpen(false)
    if (data.sendWahaWhatsApp) {
      triggerWahaToast(`WhatsApp invitation queued via WAHA API for ${newIv.candidate} (${newIv.phone})!`)
    }
  }

  const triggerWahaToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleSendWaha = (id: string, candidate: string, phone: string) => {
    setSendingWahaId(id)
    setTimeout(() => {
      setInterviews((prev) =>
        prev.map((iv) => (iv.id === id ? { ...iv, wahaSent: true, status: 'awaiting' } : iv))
      )
      setSendingWahaId(null)
      triggerWahaToast(`WhatsApp invitation dispatched via WAHA API to ${candidate} (${phone})!`)
    }, 800)
  }

  // --- Role-scoped interview list ---
  const scopedInterviews = interviews.filter((iv) => {
    if (isCandidate) {
      return iv.candidate.toLowerCase() === candidateName.toLowerCase()
    }
    if (isEmployerOrRecruiter && userCompany) {
      const cLow = userCompany.toLowerCase()
      return iv.employer.toLowerCase().includes(cLow) || cLow.includes(iv.employer.toLowerCase())
    }
    return true // admin sees all
  })

  const filtered = scopedInterviews.filter((iv) => {
    const matchesSearch =
      iv.candidate.toLowerCase().includes(search.toLowerCase()) ||
      iv.job.toLowerCase().includes(search.toLowerCase()) ||
      iv.employer.toLowerCase().includes(search.toLowerCase()) ||
      iv.phone.includes(search)
    const matchesStatus = statusFilter === 'all' || iv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Columns differ by role
  const showCandidateCol = !isCandidate
  const showWahaCol = !isCandidate
  const gridCols = isCandidate
    ? 'grid-cols-[1.8fr_1fr_1.2fr_1fr]'
    : 'grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1fr_0.8fr]'

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            {isCandidate ? 'My Interviews' : 'Interviews Schedule'}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {isCandidate
              ? 'View your upcoming and past interview appointments.'
              : 'Track and schedule candidate interview invitations.'}
          </p>
        </div>

        {/* Only recruiters / admins can schedule interviews */}
        {!isCandidate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Interview</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={isCandidate ? 'Search by job or employer...' : 'Search by candidate, phone, job, or employer...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="awaiting">Awaiting</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Header row */}
        <div className={`grid ${gridCols} px-5 py-3.5 bg-surface-2 text-xs font-bold text-muted uppercase tracking-wider border-b border-border gap-2`}>
          {showCandidateCol && <span>Candidate</span>}
          <span>Job &amp; Employer</span>
          <span>Date</span>
          <span>Time &amp; Mode</span>
          <span>Status</span>
          {showWahaCol && <span className="text-right">WhatsApp Bot</span>}
        </div>

        <div className="divide-y divide-border">
          {filtered.map((iv) => {
            const badge = STATUS_BADGES[iv.status] || STATUS_BADGES.confirmed
            const StatusIcon = badge.icon

            return (
              <div
                key={iv.id}
                onClick={() => setSelectedInterview(iv)}
                className={`grid ${gridCols} px-5 py-3.5 items-center hover:bg-surface-2/60 transition-colors text-sm cursor-pointer gap-2`}
              >
                {/* Candidate (hidden for candidate role) */}
                {showCandidateCol && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {iv.candidate.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground leading-tight truncate">{iv.candidate}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">{iv.phone}</p>
                    </div>
                  </div>
                )}

                {/* Job & Employer */}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-xs leading-tight truncate">{iv.job}</p>
                  <p className="text-[11px] text-muted truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {iv.employer}
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs text-muted font-medium whitespace-nowrap">{iv.date}</div>

                {/* Time & Mode */}
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-foreground truncate">{iv.time}</p>
                  <p className="text-muted text-[11px] flex items-center gap-1 mt-0.5 truncate">
                    {iv.mode.toLowerCase().includes('site')
                      ? <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      : <Video className="w-3 h-3 text-blue-500 shrink-0" />}
                    <span className="truncate">{iv.mode}</span>
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${badge.cls}`}>
                    <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* WhatsApp Bot (hidden for candidate) */}
                {showWahaCol && (
                  <div className="text-right" onClick={(e) => e.stopPropagation()}>
                    {iv.wahaSent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Sent</span>
                      </span>
                    ) : sendingWahaId === iv.id ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending…</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendWaha(iv.id, iv.candidate, iv.phone)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Bot Queued</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
              <Calendar className="w-10 h-10 text-muted opacity-30" />
              <p className="text-sm text-muted font-medium">
                {isCandidate ? "You don't have any interviews scheduled yet." : 'No interviews found matching your filters.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScheduleSubmit={handleScheduleSubmit}
      />

      <InterviewDetailModal
        isOpen={Boolean(selectedInterview)}
        onClose={() => setSelectedInterview(null)}
        interview={selectedInterview}
      />
    </div>
  )
}
