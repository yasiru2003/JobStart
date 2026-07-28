'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, Search, Filter, Video, MapPin, CheckCircle, AlertCircle, XCircle, MessageSquare, Send, CheckCheck } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'

const INITIAL_INTERVIEWS = [
  { id: '1', candidate: 'Sunil Rathnayake', phone: '+94 77 123 4567', job: 'Senior React / Next.js Developer', employer: 'WSO2', date: '24 Jul 2026', time: '10:00 AM – 11:00 AM', mode: 'Google Meet', status: 'confirmed', interviewer: 'Nalaka Bandara', wahaSent: true },
  { id: '2', candidate: 'Priyanka Jayasuriya', phone: '+94 71 987 6543', job: 'Lead UI/UX Designer', employer: 'Sysco LABS', date: '24 Jul 2026', time: '02:00 PM – 03:00 PM', mode: 'WhatsApp Call', status: 'awaiting', interviewer: 'Chaminda Silva', wahaSent: false },
  { id: '3', candidate: 'Chamara Wickramasinghe', phone: '+94 75 456 7890', job: 'DevOps Engineer', employer: 'Dialog Axiata', date: '26 Jul 2026', time: '11:00 AM – 12:00 PM', mode: 'On-site (Colombo 02)', status: 'declined', interviewer: 'Dilshan Perera', wahaSent: false },
  { id: '4', candidate: 'Kasun Perera', phone: '+94 77 555 1212', job: 'Associate Software Engineer', employer: 'Brandix Tech', date: '28 Jul 2026', time: '09:30 AM – 10:30 AM', mode: 'Google Meet', status: 'confirmed', interviewer: 'Nadeeka Dias', wahaSent: true },
]

const STATUS_BADGES: Record<string, { label: string; cls: string; icon: any }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
  awaiting:  { label: 'Awaiting Confirmation', cls: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: AlertCircle },
  declined:  { label: 'Declined', cls: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: XCircle },
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sendingWahaId, setSendingWahaId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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

  const filtered = interviews.filter((iv) => {
    const matchesSearch =
      iv.candidate.toLowerCase().includes(search.toLowerCase()) ||
      iv.job.toLowerCase().includes(search.toLowerCase()) ||
      iv.employer.toLowerCase().includes(search.toLowerCase()) ||
      iv.phone.includes(search)
    const matchesStatus = statusFilter === 'all' || iv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Interviews Schedule
            </h1>
            <span className="badge-info text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold flex items-center gap-1.5 px-2.5 py-0.5">
              <MessageSquare className="w-3.5 h-3.5" />
              WAHA API Active
            </span>
          </div>
          <p className="text-sm text-muted mt-0.5">Track, schedule, and send automated WhatsApp interview invitations via WAHA API.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Interview</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by candidate, phone, job, or employer..."
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

      {/* Interviews Table */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[2fr_1.8fr_1fr_1.3fr_1.2fr_1fr] px-5 py-3 bg-surface-2 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">
          <span>Candidate</span>
          <span>Job & Employer</span>
          <span>Date</span>
          <span>Time & Mode</span>
          <span>Status</span>
          <span className="text-right">WAHA Action</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((iv) => {
            const badge = STATUS_BADGES[iv.status] || STATUS_BADGES.confirmed
            const StatusIcon = badge.icon
            const isSending = sendingWahaId === iv.id

            return (
              <div
                key={iv.id}
                className="grid grid-cols-[2fr_1.8fr_1fr_1.3fr_1.2fr_1fr] px-5 py-4 items-center hover:bg-surface-2/60 transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {iv.candidate.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-foreground leading-tight">{iv.candidate}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{iv.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground text-xs leading-tight">{iv.job}</p>
                  <p className="text-[11px] text-muted">{iv.employer}</p>
                </div>

                <div className="text-xs text-muted font-medium">{iv.date}</div>

                <div className="text-xs">
                  <p className="font-semibold text-foreground">{iv.time}</p>
                  <p className="text-muted text-[11px] flex items-center gap-1 mt-0.5">
                    {iv.mode.includes('Site') ? <MapPin className="w-3 h-3 text-rose-500" /> : <Video className="w-3 h-3 text-blue-500" />}
                    {iv.mode}
                  </p>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.cls}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                </div>

                <div className="text-right">
                  {iv.wahaSent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <CheckCheck className="w-3.5 h-3.5" />
                      WAHA Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendWaha(iv.id, iv.candidate, iv.phone)}
                      disabled={isSending}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSending ? 'Sending...' : 'WAHA Invite'}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-10 h-10 text-muted opacity-30 mb-2" />
              <p className="text-sm text-muted">No interviews found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScheduleSubmit={handleScheduleSubmit}
      />
    </div>
  )
}
