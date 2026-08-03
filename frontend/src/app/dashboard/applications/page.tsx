'use client'

import { useState } from 'react'
import { FileText, Calendar, CheckCircle, XCircle, Briefcase, Building2 } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import { useAuthStore } from '@/lib/stores'

const initialApplications = [
  { id: '1', candidate: 'Kasun Perera', job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', applied: '2 days ago', status: 'screening' },
  { id: '8', candidate: 'Kasun Perera', job: 'Full Stack Engineer', employer: 'Zone24x7', applied: '5 days ago', status: 'interview' },
  { id: '2', candidate: 'Janith Alwis', job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', applied: '1 day ago', status: 'interview' },
  { id: '3', candidate: 'Ruwan Wickramasinghe', job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', applied: '3 hours ago', status: 'applied' },
  { id: '4', candidate: 'Sanduni Jayawardena', job: 'Lead UI/UX Designer', employer: 'WSO2 Lanka', applied: '1 day ago', status: 'interview' },
  { id: '5', candidate: 'Priyanka Jayasuriya', job: 'DevOps & Cloud Architect', employer: 'WSO2 Lanka', applied: '4 days ago', status: 'offer' },
  { id: '6', candidate: 'Dilshan Fernando', job: 'Data Analyst Specialist', employer: 'WSO2 Lanka', applied: '5 days ago', status: 'applied' },
  { id: '7', candidate: 'Nirosha Silva', job: 'QA Automation Lead', employer: 'WSO2 Lanka', applied: '6 days ago', status: 'rejected' },
]

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  screening: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  interview: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  offer: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
}

export default function ApplicationsPage() {
  const { user, viewingAs } = useAuthStore()
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const effectiveRole = viewingAs || user?.role || 'admin'
  const isEmployerOrRecruiter = effectiveRole === 'employer' || effectiveRole === 'recruiter'
  const isCandidate = effectiveRole === 'candidate'
  const userCompany = user?.tenantDomain || (isEmployerOrRecruiter ? 'WSO2' : null)

  // Derive the logged-in candidate's display name from the user store
  const candidateName = user?.fullName || ''

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
  }

  // Scope: candidates only see THEIR OWN applications
  //        employers/recruiters only see applications for THEIR company
  //        admins see everything
  const scopedApps = applications.filter((app) => {
    if (isCandidate) {
      // Match by candidate name (case-insensitive)
      return app.candidate.toLowerCase() === candidateName.toLowerCase()
    }
    if (isEmployerOrRecruiter && userCompany) {
      const compLower = userCompany.toLowerCase()
      const appEmpLower = app.employer.toLowerCase()
      return appEmpLower.includes(compLower) || compLower.includes(appEmpLower)
    }
    return true // admin sees all
  })

  const filtered = activeTab === 'all'
    ? scopedApps
    : scopedApps.filter((a) => a.status === activeTab)

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {isCandidate ? 'My Applications' : 'Job Applications Pipeline'}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {isCandidate
              ? 'Track your job submissions, interview stages, and hiring outcomes.'
              : 'Track candidate submissions, interview stages, offers, and hiring outcomes.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2 text-xs font-semibold overflow-x-auto">
        {['all', 'applied', 'screening', 'interview', 'offer', 'rejected'].map((tab) => {
          const count = tab === 'all' ? scopedApps.length : scopedApps.filter((a) => a.status === tab).length
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

      {/* Empty state for candidate with no results */}
      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">No applications yet</p>
            <p className="text-sm text-muted mt-1">
              {isCandidate ? "You haven't applied to any jobs yet. Browse open positions to get started." : 'No applications match the selected filter.'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
                {!isCandidate && <th className="p-4">Candidate</th>}
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
                  {!isCandidate && (
                    <td className="p-4 font-semibold text-foreground">{app.candidate}</td>
                  )}
                  <td className="p-4 text-foreground font-medium">{app.job}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {app.employer}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{app.applied}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_STYLES[app.status] ?? 'bg-surface-2 text-muted border-border'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {app.status === 'rejected' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted font-medium italic">Archived</span>
                          {!isCandidate && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'applied')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-foreground border border-border hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      ) : app.status === 'offer' ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-xs border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Job Offer Sent
                        </span>
                      ) : isCandidate ? (
                        // Candidates can only withdraw their application
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold rounded-lg text-xs border border-rose-500/20 transition-colors cursor-pointer"
                          title="Withdraw Application"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <>
                          {(viewingAs === 'recruiter' || viewingAs === 'admin') && (
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
                          )}
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'offer')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Offer
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold rounded-lg text-xs border border-rose-500/20 transition-colors cursor-pointer"
                            title="Reject Application"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidateName={selectedApp?.candidate}
        jobTitle={selectedApp?.job}
        onScheduleSubmit={(data) => handleUpdateStatus(selectedApp?.id, 'interview')}
      />
    </div>
  )
}
