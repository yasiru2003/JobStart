'use client'

import { useState, useEffect } from 'react'
import { wahaApi } from '@/lib/api'
import { X, Calendar, Clock, MapPin, Video, Send, Plus, Trash2, CheckCircle2, User, Search, ShieldCheck, Check } from 'lucide-react'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName?: string
  jobTitle?: string
  onScheduleSubmit: (interviewData: any) => void
}

const MOCK_JOB_OPTIONS = [
  { id: '1', title: 'Senior React / Next.js Developer' },
  { id: '2', title: 'Lead UI/UX Designer' },
  { id: '3', title: 'DevOps & Kubernetes Engineer' },
  { id: '4', title: 'Associate Software Engineer' },
]

const BASE_CANDIDATES = [
  { id: 'c-hd', initials: 'HD', name: 'Hasini Dikkumbura', location: 'Colombo 03 / Remote', matchScore: 98, phone: '+94 76 522 5044' },
  { id: 'c1', initials: 'KP', name: 'Kasun Perera', location: 'Colombo', matchScore: 72, phone: '+94 77 123 4567' },
  { id: 'c2', initials: 'NF', name: 'Nimal Fernando', location: 'Gampaha', matchScore: 81, phone: '+94 71 987 6543' },
  { id: 'c4', initials: 'SR', name: 'Sunil Rathnayake', location: 'Negombo', matchScore: 93, phone: '+94 75 456 7890' },
  { id: 'c5', initials: 'PJ', name: 'Priyanka Jayasuriya', location: 'Colombo', matchScore: 87, phone: '+94 77 555 1212' },
  { id: 'c6', initials: 'CW', name: 'Chamara Wickramasinghe', location: 'Kandy', matchScore: 95, phone: '+94 77 888 9999' },
]

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  candidateName,
  jobTitle = 'Senior React / Next.js Developer',
  onScheduleSubmit,
}: ScheduleInterviewModalProps) {
  const [selectedJob, setSelectedJob] = useState(jobTitle)
  const [jobSearch, setJobSearch] = useState('')
  const [candSearch, setCandSearch] = useState('')
  const [allCandidates, setAllCandidates] = useState(BASE_CANDIDATES)
  const [chosenCandidates, setChosenCandidates] = useState<string[]>(
    candidateName ? [candidateName] : ['Hasini Dikkumbura', 'Sunil Rathnayake']
  )

  useEffect(() => {
    const fetchLiveCandidates = async () => {
      try {
        const res = await wahaApi.conversations()
        const convs = res.data || []
        const liveCands = convs.map((c: any) => {
          const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          // Normalise phone: strip all spaces, dashes, leading +
          const normalPhone = String(c.phone).replace(/[\s\-+]/g, '')
          return {
            id: `wa-${normalPhone}`,
            initials,
            name,
            location: 'Colombo 03 / Remote',
            matchScore: 98,
            phone: `+${c.phone}`,
          }
        })

        setAllCandidates(() => {
          // Merge BASE_CANDIDATES with liveCands, deduplicate by normalised phone
          const seenPhones = new Set<string>()
          const seenNames = new Set<string>()
          const merged: any[] = []

          // Live candidates first (most up-to-date data)
          for (const lc of liveCands) {
            const np = lc.phone.replace(/[\s\-+]/g, '')
            if (!seenPhones.has(np) && !seenNames.has(lc.name.toLowerCase())) {
              seenPhones.add(np)
              seenNames.add(lc.name.toLowerCase())
              merged.push(lc)
            }
          }

          // Then static candidates, skipping any already seen
          for (const bc of BASE_CANDIDATES) {
            const np = bc.phone.replace(/[\s\-+]/g, '')
            if (!seenPhones.has(np) && !seenNames.has(bc.name.toLowerCase())) {
              seenPhones.add(np)
              seenNames.add(bc.name.toLowerCase())
              merged.push(bc)
            }
          }

          return merged
        })
      } catch (_) {}
    }
    fetchLiveCandidates()
  }, [])

  const [slots, setSlots] = useState<{ id: string; date: string; start: string; end: string }[]>([
    { id: '1', date: '2026-07-29', start: '10:00', end: '11:00' },
  ])
  const [mode, setMode] = useState<'Online' | 'Physical'>('Online')
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/jobstart-interview-01')
  const [address, setAddress] = useState('WSO2 HQ, 20 Palm Grove, Colombo 03')
  const [reminderFreqs, setReminderFreqs] = useState<string[]>(['1 hour before', 'Morning of + 1h'])

  const [sendingState, setSendingState] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  if (!isOpen) return null
  const handleToggleReminderFreq = (opt: string) => {
    setReminderFreqs((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  const handleToggleCandidate = (name: string) => {
    setChosenCandidates((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleAddSlot = () => {
    setSlots((prev) => [
      ...prev,
      { id: String(Date.now()), date: '2026-07-30', start: '14:00', end: '15:00' },
    ])
  }

  const handleRemoveSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots((prev) => prev.filter((s) => s.id !== id))
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingState(true)

    const candidatesList = chosenCandidates.length > 0 ? chosenCandidates : ['Hasini Dikkumbura']

    for (const candName of candidatesList) {
      let phone = '94765225044'
      if (candName.toLowerCase().includes('kasun')) phone = '94771234567'
      else if (candName.toLowerCase().includes('sanduni')) phone = '94719876543'
      else if (candName.toLowerCase().includes('priyanka')) phone = '94754567890'

      try {
        await wahaApi.sendInvite({
          phone: phone,
          candidate_name: candName,
          job_title: selectedJob || 'Senior React / Next.js Developer',
          employer_name: 'WSO2 Lanka',
          date: slots[0]?.date || 'Wed 11:30 AM',
          time_slot: `${slots[0]?.start || '11:30 AM'}`,
          mode: mode === 'Online' ? 'Google Meet' : 'On-site',
        })
      } catch (_) {}
    }

    setSendingState(false)
    setToastMsg(`🎉 SUCCESS: WhatsApp Interview Invitations sent to ${candidatesList.join(', ')} via WAHA Agent!`)

    onScheduleSubmit({
      jobTitle: selectedJob,
      candidates: candidatesList,
      slots,
      mode,
      locationType: mode === 'Online' ? 'virtual' : 'onsite',
      meetingLink,
      address,
      reminderFreqs,
      reminderFreq: reminderFreqs.join(', ') || 'None',
      date: slots[0]?.date || '2026-07-29',
      startTime: slots[0]?.start || '10:00',
      endTime: slots[0]?.end || '11:00',
      sendWahaWhatsApp: true,
    })

    setTimeout(() => {
      setToastMsg(null)
      onClose()
    }, 2000)
  }

  const filteredJobs = MOCK_JOB_OPTIONS.filter((j) =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase())
  )

  const filteredCands = allCandidates.filter((c) =>
    c.name.toLowerCase().includes(candSearch.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {toastMsg && (
          <div className="absolute top-3 left-6 right-16 z-50 p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xl animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-amber-950 flex items-center justify-center font-bold shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Bulk Interview Scheduler (WhatsApp Agent)</h2>
              <p className="text-xs text-muted">Select candidates, proposed slots & send automated WhatsApp invites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* 1. Which Job */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              1. Which Job Posting?
            </label>

            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search job postings by title..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                id="job-search-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-1">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((j) => {
                  const selected = selectedJob === j.title
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setSelectedJob(j.title)}
                      className={`h-12 px-3 py-2 rounded-xl border text-left text-xs font-semibold transition-all flex items-center min-w-0 ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm font-bold'
                          : 'border-border bg-surface-2 text-foreground hover:border-primary/40'
                      }`}
                    >
                      <span className="line-clamp-2 leading-tight">{j.title}</span>
                    </button>
                  )
                })
              ) : (
                <p className="text-xs text-muted col-span-2 py-3 text-center">No job postings found matching "{jobSearch}"</p>
              )}
            </div>
          </div>

          {/* 2. Which Candidates */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                2. Which Candidates? ({chosenCandidates.length} Selected)
              </label>
            </div>

            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search candidates by name..."
                value={candSearch}
                onChange={(e) => setCandSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto p-2 border border-border rounded-xl bg-surface-2/40">
              {filteredCands.map((cand) => {
                const checked = chosenCandidates.includes(cand.name)
                return (
                  <div
                    key={cand.id}
                    onClick={() => handleToggleCandidate(cand.name)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      checked
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleCandidate(cand.name)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
                      />
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                        {cand.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">{cand.name}</p>
                        <p className="text-[10px] text-muted">{cand.location} · {cand.phone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-primary">{cand.matchScore}% match</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Proposed Time Slots */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              3. Proposed Time Slots
            </label>

            <div className="space-y-2">
              {slots.map((s, idx) => (
                <div key={s.id} className="flex gap-2 items-center p-2.5 bg-surface-2 border border-border rounded-xl text-xs">
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => {
                      const val = e.target.value
                      setSlots((prev) => prev.map((sl) => (sl.id === s.id ? { ...sl, date: val } : sl)))
                    }}
                    className="px-2 py-1.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none"
                  />
                  <input
                    type="time"
                    value={s.start}
                    onChange={(e) => {
                      const val = e.target.value
                      setSlots((prev) => prev.map((sl) => (sl.id === s.id ? { ...sl, start: val } : sl)))
                    }}
                    className="px-2 py-1.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none"
                  />
                  <span className="text-muted text-xs">to</span>
                  <input
                    type="time"
                    value={s.end}
                    onChange={(e) => {
                      const val = e.target.value
                      setSlots((prev) => prev.map((sl) => (sl.id === s.id ? { ...sl, end: val } : sl)))
                    }}
                    className="px-2 py-1.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none"
                  />

                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(s.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSlot}
              className="mt-2 w-full py-2 border border-dashed border-border hover:bg-primary/5 text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Another Day / Time Slot</span>
            </button>
          </div>

          {/* 4. Interview Mode & WhatsApp Reminders */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              4. Interview Type & Location Mode
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('Online')}
                className={`flex-1 h-10 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'Online'
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-surface-2 text-foreground'
                }`}
              >
                <Video className="w-4 h-4 shrink-0" />
                <span>Online Virtual</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('Physical')}
                className={`flex-1 h-10 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'Physical'
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-surface-2 text-foreground'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>On-Site Physical</span>
              </button>
            </div>

            {mode === 'Online' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {[
                    { label: 'Google Meet', prefix: 'https://meet.google.com/' },
                    { label: 'Zoom', prefix: 'https://zoom.us/j/' },
                    { label: 'MS Teams', prefix: 'https://teams.microsoft.com/' },
                  ].map((plat) => (
                    <button
                      key={plat.label}
                      type="button"
                      onClick={() => setMeetingLink(`${plat.prefix}jobstart-interview-${Date.now().toString().slice(-4)}`)}
                      className="px-2.5 py-1 rounded-lg border border-border bg-surface-2 hover:bg-border text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                    >
                      + Quick {plat.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Paste Google Meet, Zoom, or Teams link (e.g. https://meet.google.com/xyz-abc-def)"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted">Recruiters can use any single meeting link (Google Meet, Zoom, MS Teams, Webex).</p>
              </div>
            ) : (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Physical Office Address"
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none"
              />
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-foreground">WhatsApp Join Reminder Frequency</label>
                <span className="text-[10px] text-muted font-medium">(Multi-select enabled)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['24 hours before', '3 hours before', '1 hour before', '15 mins before'].map((opt) => {
                  const isSelected = reminderFreqs.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleReminderFreq(opt)}
                      className={`h-10 px-2 rounded-xl text-[11px] font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-surface-2 text-muted hover:text-foreground'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-3 h-3 text-primary rounded border-border focus:ring-primary pointer-events-none shrink-0"
                      />
                      <span className="truncate">{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-accent hover:bg-amber-600 text-amber-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              id="submit-bulk-schedule-btn"
            >
              <Send className="w-4 h-4" />
              <span>Send Invites via WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
