'use client'

import { useState, useEffect } from 'react'

import { FileText, Calendar, CheckCircle, XCircle, Clock, Filter, Plus, Sparkles, Bot } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import AiCandidateModal from '@/components/modals/AiCandidateModal'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'
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
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

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
        
        const liveApps = convs.map((c: any, idx: number) => {
          const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
          return {
            id: `wa-app-${c.phone || idx}`,
            candidate: name,
            job: c.selected_job_title || 'Flutter Mobile Developer',
            employer: 'WSO2 Lanka',
            applied: 'Just now (WhatsApp)',
            status: c.interview_confirmed ? 'interview' : 'screening',
            phone: c.phone || '94765225044',
            cvUrl: c.cv_media_url || '/dashboard/whatsapp'
          }
        })

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
    const target = applications.find((a) => a.id === id)
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    if (newStatus === 'offer' && target) {
      setToastMsg(`🎉 Job Offer Dispatched! Formal offer issued to ${target.candidate}.`)
      setTimeout(() => setToastMsg(null), 4000)
    }
  }

  const filtered = activeTab === 'all' ? tenantApplications : tenantApplications.filter((a) => a.status === activeTab)

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-slide-in-right flex items-center gap-2 border border-white/20">
          <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {['all', 'applied', 'screening', 'interview', 'offer', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-muted hover:text-foreground hover:bg-surface-2 border border-border/60'
            }`}
          >
            {tab}
          </button>
        ))}
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
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    {(app as any).cvUrl && (
                      <a
                        href={(app as any).cvUrl.startsWith('http') ? (app as any).cvUrl : `/dashboard/whatsapp`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all hover:bg-purple-500/20 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                        title={`View CV: ${(app as any).cvUrl}`}
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>PDF CV</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setIsAiDrawerOpen(true)
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-ai-drawer', {
                            detail: { type: 'candidate', name: app.candidate, title: app.job }
                          }))
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-teal-100 font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer border border-teal-600/40 whitespace-nowrap shrink-0 hover:scale-[1.02]"
                      title={`Ask AI Agent about @${app.candidate}`}
                    >
                      <div className="w-4 h-4 rounded bg-amber-500 text-amber-950 flex items-center justify-center font-bold shrink-0">
                        <Bot className="w-3 h-3 text-amber-950" />
                      </div>
                      <span>AI Copilot</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        setIsScheduleModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02]"
                      id={`schedule-app-btn-${app.id}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                      <span>Schedule Interview</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(app.id, 'offer')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Offer</span>
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
        onScheduleSubmit={(data) => {
          handleUpdateStatus(selectedApp?.id, 'interview')
          setToastMsg(`📅 Interview Scheduled with ${selectedApp?.candidate} on ${data.date || 'Tomorrow 10:00 AM'}!`)
          setTimeout(() => setToastMsg(null), 4000)
        }}
      />

      <AiAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  )
}
