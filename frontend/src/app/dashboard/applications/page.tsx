'use client'

import { useState } from 'react'
import { FileText, Calendar, CheckCircle, XCircle, Clock, Filter, Plus } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'

const initialApplications = [
  { id: '1', candidate: 'Kasun Perera', job: 'Senior Full Stack Engineer', employer: 'WSO2', applied: '2 days ago', status: 'screening' },
  { id: '2', candidate: 'Sanduni Jayawardena', job: 'Lead UI/UX Designer', employer: 'Sysco LABS', applied: '1 day ago', status: 'interview' },
  { id: '3', candidate: 'Priyanka Jayasuriya', job: 'DevOps & Kubernetes Engineer', employer: 'Dialog Axiata', applied: '4 days ago', status: 'offer' },
  { id: '4', candidate: 'Dilshan Fernando', job: 'Data Analyst Specialist', employer: 'MAS Holdings', applied: '5 days ago', status: 'applied' },
  { id: '5', candidate: 'Nirosha Silva', job: 'QA Automation Engineer', employer: 'Brandix', applied: '6 days ago', status: 'rejected' },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
  }

  const filtered = activeTab === 'all' ? applications : applications.filter((a) => a.status === activeTab)

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
          const count = tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length
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
                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        setIsScheduleModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-accent hover:bg-amber-600 text-amber-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm"
                      id={`schedule-app-btn-${app.id}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'offer')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
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
    </div>
  )
}
