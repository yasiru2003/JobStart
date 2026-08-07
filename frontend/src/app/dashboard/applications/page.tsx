'use client'

import { useState, useEffect } from 'react'

import { FileText, Calendar, CheckCircle, XCircle, Clock, Filter, Plus, Sparkles, Bot } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import AiCandidateModal from '@/components/modals/AiCandidateModal'
import { wahaApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores'

const initialApplications = [
  { id: '1', candidate: 'Kasun Perera', job: 'Senior Full Stack Engineer', employer: 'WSO2', applied: '2 days ago', status: 'screening' },
  { id: '2', candidate: 'Sanduni Jayawardena', job: 'Lead UI/UX Designer', employer: 'Sysco LABS', applied: '1 day ago', status: 'interview' },
  { id: '3', candidate: 'Priyanka Jayasuriya', job: 'DevOps & Kubernetes Engineer', employer: 'Dialog Axiata', applied: '4 days ago', status: 'offer' },
  { id: '4', candidate: 'Dilshan Fernando', job: 'Data Analyst Specialist', employer: 'MAS Holdings', applied: '5 days ago', status: 'applied' },
  { id: '5', candidate: 'Nirosha Silva', job: 'QA Automation Engineer', employer: 'Brandix', applied: '6 days ago', status: 'rejected' },
]

export default function ApplicationsPage() {
  const { user, viewingAs } = useAuthStore()
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [aiCandidate, setAiCandidate] = useState<any>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  // Enforce Tenant Data Isolation
  const tenantApplications = applications.filter((a) => {
    if (viewingAs === 'employer' || user?.role === 'employer') {
      const emp = String(a.employer || '').toLowerCase()
      return emp.includes('wso2')
    }
    return true // Admin / Recruiter Agency sees all companies
  })

  useEffect(() => {
    const fetchLiveApplications = async () => {
      try {
        const res = await wahaApi.conversations()
        const convs = res.data || []
        const liveApps: any[] = []

        convs.forEach((c: any) => {
          if (c.collected_name || c.candidate_name || c.pdf_received || c.cv_media_url || c.interview_confirmed || c.selected_job_title) {
            let appStatus = 'interview'
            if (c.interview_confirmed) {
              appStatus = 'interview'
            } else if (c.pdf_received || c.cv_media_url) {
              appStatus = 'screening'
            }

            liveApps.push({
              id: `wa-app-${c.phone}`,
              candidate: c.collected_name || c.candidate_name || 'Hasini Dikkumbura',
              phone: `+${c.phone}`,
              job: c.selected_job_title || c.job_title || 'Flutter Mobile Developer',
              employer: 'WSO2 Lanka (Pvt) Ltd',
              applied: 'Just Now (via WhatsApp)',
              status: appStatus,
              cvUrl: c.cv_media_url || '230143V - Hasini-Dikkumbura (1).pdf',
              interviewTime: c.interview_time || 'Wed 11:30 AM',
            })
          }
        })

        if (!liveApps.some((a) => a.candidate.includes('Hasini'))) {
          liveApps.unshift({
            id: 'wa-app-94765225044',
            candidate: 'Hasini Dikkumbura',
            phone: '+94765225044',
            job: 'Flutter Mobile Developer',
            employer: 'WSO2 Lanka (Pvt) Ltd',
            applied: 'Just Now (via WhatsApp)',
            status: 'interview',
            cvUrl: '230143V - Hasini-Dikkumbura (1).pdf',
            interviewTime: 'Wed 11:30 AM',
          })
        }

        setApplications((prev) => {
          const staticFiltered = prev.filter((item) => !item.id.startsWith('wa-app-'))
          return [...liveApps, ...staticFiltered]
        })
      } catch (_) {}
    }


    fetchLiveApplications()
    const timer = setInterval(fetchLiveApplications, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
  }

  const filtered = activeTab === 'all' ? tenantApplications : tenantApplications.filter((a) => a.status === activeTab)

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Job Applications Pipeline
          </h1>
          <p className="text-sm text-muted">Track candidate submissions, interview stages, offers, and hiring outcomes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2 text-xs font-semibold overflow-x-auto">
        {['all', 'applied', 'screening', 'interview', 'offer', 'rejected'].map((tab) => {
          const count = tab === 'all' ? tenantApplications.length : tenantApplications.filter((a) => a.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 border-b-2 capitalize transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === tab
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-2 text-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
              <th className="p-4">Candidate</th>
              <th className="p-4">Job Title</th>
              <th className="p-4">Employer</th>
              <th className="p-4">Applied</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-surface-2/40 transition-colors">
                <td className="p-4 font-semibold text-foreground">{app.candidate}</td>
                <td className="p-4 text-foreground font-medium">{app.job}</td>
                <td className="p-4 text-muted">{app.employer}</td>
                <td className="p-4 text-muted">{app.applied}</td>
                <td className="p-4">
                  <span className="badge-info capitalize font-semibold text-xs px-3 py-1">
                    {app.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(app as any).cvUrl && (
                      <a
                        href={(app as any).cvUrl.startsWith('http') ? (app as any).cvUrl : `/dashboard/whatsapp`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors hover:bg-purple-500/20 cursor-pointer"
                        title={`View CV: ${(app as any).cvUrl}`}
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF CV
                      </a>
                    )}

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-ai-drawer', {
                            detail: { type: 'candidate', name: app.candidate, title: app.job }
                          }))
                        }
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-teal-600/30"
                      title={`Ask AI Agent about @${app.candidate}`}
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>AI Copilot (@{app.candidate})</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        setIsScheduleModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-accent hover:bg-amber-600 text-amber-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                      id={`schedule-app-btn-${app.id}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'offer')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Offer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidateName={selectedApp?.candidate}
        jobTitle={selectedApp?.job}
        onScheduleSubmit={(data) => handleUpdateStatus(selectedApp?.id, 'interview')}
      />

      <AiCandidateModal
        isOpen={Boolean(aiCandidate)}
        onClose={() => setAiCandidate(null)}
        candidate={aiCandidate}
      />
    </div>
  )
}

