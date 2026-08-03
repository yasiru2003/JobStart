'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Calendar,
  Users, Kanban, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import KanbanBoard, { PipelineColumns } from '@/components/kanban/KanbanBoard'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import { useAuthStore } from '@/lib/stores'

// ── mock data (replace with API calls) ──────────────────────────────────────
const JOBS_DATA: Record<string, {
  title: string; employer: string; location: string; salary: string; type: string; status: string; applicants: number
  pipeline: PipelineColumns
  interviews: { candidate: string; date: string; time: string; mode: string; status: string }[]
}> = {
  '1': {
    title: 'Senior React / Next.js Developer',
    employer: 'WSO2 Lanka',
    location: 'Colombo 03 / Remote',
    salary: 'LKR 350,000 – 500,000 / mo',
    type: 'Full-time',
    status: 'Active',
    applicants: 3,
    pipeline: {
      matched: [
        { id: '7', initials: 'RW', name: 'Ruwan Wickramasinghe', location: 'Moratuwa', verified: true, rating: '4.4', matchScore: 85 },
      ],
      shortlisted: [
        { id: '1', initials: 'KP', name: 'Kasun Perera', location: 'Colombo 03', verified: true, rating: '4.8', matchScore: 92 },
      ],
      interviewing: [
        { id: '6', initials: 'JA', name: 'Janith Alwis', location: 'Colombo 05', verified: true, rating: '4.7', matchScore: 89 },
      ],
      hired: [],
    },
    interviews: [
      { candidate: 'Janith Alwis', job: 'Senior React / Next.js Developer', date: '25 Jul 2026', time: '10:00 AM–11:00 AM', mode: 'Google Meet', status: 'confirmed' },
      { candidate: 'Kasun Perera', job: 'Senior React / Next.js Developer', date: '26 Jul 2026', time: '02:00 PM–03:00 PM', mode: 'WhatsApp Call', status: 'awaiting' },
    ] as any,
  },
  '2': {
    title: 'Lead UI/UX Designer', employer: 'Sysco LABS', location: 'Colombo 05', salary: 'LKR 300,000 – 450,000 / mo', type: 'Full-time', status: 'Active', applicants: 28,
    pipeline: {
      matched:      [{ id: 'u1', initials: 'AM', name: 'Amaya Madushan',  location: 'Colombo', verified: true, rating: '4.3', matchScore: 79 }],
      shortlisted:  [{ id: 'u2', initials: 'RS', name: 'Ruchika Silva',   location: 'Colombo', verified: true, rating: '4.7', matchScore: 91 }],
      interviewing: [],
      hired:        [],
    },
    interviews: [],
  },
  '3': {
    title: 'DevOps & Kubernetes Engineer', employer: 'Dialog Axiata', location: 'Colombo 02', salary: 'LKR 400,000 – 600,000 / mo', type: 'Full-time', status: 'Active', applicants: 19,
    pipeline: {
      matched:      [{ id: 'd1', initials: 'TK', name: 'Tharaka Kumarage', location: 'Colombo', verified: false, rating: '3.9', matchScore: 68 }],
      shortlisted:  [],
      interviewing: [],
      hired:        [],
    },
    interviews: [],
  },
  '4': {
    title: 'Associate Software Engineer', employer: 'Brandix Tech', location: 'Katunayake', salary: 'LKR 150,000 – 220,000 / mo', type: 'Contract', status: 'Paused', applicants: 65,
    pipeline: {
      matched:      [{ id: 'b1', initials: 'LP', name: 'Lakmal Peiris',    location: 'Gampaha', verified: true, rating: '4.0', matchScore: 74 },
                     { id: 'b2', initials: 'MR', name: 'Maleesha Rodrigo', location: 'Colombo', verified: true, rating: '3.7', matchScore: 62 }],
      shortlisted:  [{ id: 'b3', initials: 'SK', name: 'Sachith Kumara',   location: 'Kandy',   verified: true, rating: '4.4', matchScore: 88 }],
      interviewing: [],
      hired:        [],
    },
    interviews: [],
  },
}

const STATUS_ICON: Record<string, { icon: React.ReactNode; cls: string }> = {
  confirmed: { icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  awaiting:  { icon: <AlertCircle className="w-3.5 h-3.5" />, cls: 'text-amber-600 bg-amber-50 border-amber-200'   },
  declined:  { icon: <XCircle    className="w-3.5 h-3.5" />, cls: 'text-rose-600 bg-rose-50 border-rose-200'      },
}

type Tab = 'pipeline' | 'interviews'

export default function JobDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = (params?.id as string) ?? '1'
  const job     = JOBS_DATA[id] ?? JOBS_DATA['1']

  const { viewingAs } = useAuthStore()
  const [tab, setTab] = useState<Tab>('pipeline')
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const TAB_STYLE = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
      tab === t
        ? 'bg-primary text-white shadow-sm'
        : 'text-muted hover:text-foreground hover:bg-surface-2'
    }`

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Back + header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </button>

        <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
              <span className="badge-verified text-xs">{job.status}</span>
              <span className="badge-info text-xs">{job.type}</span>
            </div>
            <p className="text-sm text-muted font-medium">{job.employer}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted pt-0.5">
              <span className="flex items-center gap-1"><MapPin    className="w-3.5 h-3.5 text-primary" />{job.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-accent" />{job.salary}</span>
              <span className="flex items-center gap-1"><Users     className="w-3.5 h-3.5 text-indigo-400" />{job.applicants} applicants</span>
            </div>
          </div>

          {(viewingAs === 'recruiter' || viewingAs === 'admin') && (
            <button
              onClick={() => setScheduleOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              + Schedule Interview
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-0">
        <div className="flex items-center gap-1 pb-3">
          <button id="tab-pipeline"   className={TAB_STYLE('pipeline')}   onClick={() => setTab('pipeline')}>
            <span className="flex items-center gap-1.5"><Kanban className="w-3.5 h-3.5" />Pipeline</span>
          </button>
          <button id="tab-interviews" className={TAB_STYLE('interviews')} onClick={() => setTab('interviews')}>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Interviews</span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'pipeline' && (
        <KanbanBoard initialColumns={job.pipeline} jobTitle={job.title} />
      )}

      {tab === 'interviews' && (
        <div className="card overflow-hidden">
          {job.interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Calendar className="w-10 h-10 text-muted opacity-30" />
              <p className="text-muted text-sm">No interviews scheduled yet.</p>
              <button onClick={() => setScheduleOpen(true)} className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition-colors">
                + Schedule First Interview
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1.4fr_1.2fr] px-5 py-3 bg-surface-2 text-xs font-bold text-muted uppercase tracking-wide border-b border-border">
                <span>Candidate</span>
                <span>Date</span>
                <span>Time · Mode</span>
                <span>Status</span>
              </div>
              {job.interviews.map((iv, i) => {
                const s = STATUS_ICON[iv.status] ?? STATUS_ICON.awaiting
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_1fr_1.4fr_1.2fr] px-5 py-4 border-b border-border last:border-0 items-center hover:bg-surface-2 transition-colors text-sm"
                  >
                    <span className="font-semibold text-foreground">{iv.candidate}</span>
                    <span className="text-muted">{iv.date}</span>
                    <span className="text-muted">{iv.time} · {iv.mode}</span>
                    <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${s.cls}`}>
                      {s.icon}{iv.status}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      <ScheduleInterviewModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        jobTitle={job.title}
        onScheduleSubmit={() => { setScheduleOpen(false); alert('Interview scheduled!') }}
      />
    </div>
  )
}
