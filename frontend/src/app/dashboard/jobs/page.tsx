'use client'

import { useState } from 'react'
import { Briefcase, Plus, Search, MapPin, DollarSign, Sparkles, Edit3, Trash2, Bot, Calendar } from 'lucide-react'
import PostJobModal from '@/components/modals/PostJobModal'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

const initialJobs = [
  { id: '1', title: 'Senior React / Next.js Developer', employer: 'WSO2', location: 'Colombo 03 / Remote', salary: 'LKR 350,000 - 500,000 / mo', type: 'Full-time', status: 'Active', applicants: 42 },
  { id: '2', title: 'Lead UI/UX Designer', employer: 'Sysco LABS', location: 'Colombo 05', salary: 'LKR 300,000 - 450,000 / mo', type: 'Full-time', status: 'Active', applicants: 28 },
  { id: '3', title: 'DevOps & Kubernetes Engineer', employer: 'Dialog Axiata', location: 'Colombo 02', salary: 'LKR 400,000 - 600,000 / mo', type: 'Full-time', status: 'Active', applicants: 19 },
  { id: '4', title: 'Associate Software Engineer', employer: 'Brandix Tech', location: 'Katunayake', salary: 'LKR 150,000 - 220,000 / mo', type: 'Contract', status: 'Paused', applicants: 65 },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState(initialJobs)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)

  const handleCreateJob = (jobData: any) => {
    const newJob = {
      id: String(Date.now()),
      title: jobData.title,
      employer: jobData.company || 'WSO2',
      location: jobData.location,
      salary: `LKR ${Number(jobData.salaryMin).toLocaleString()} - ${Number(jobData.salaryMax).toLocaleString()} / mo`,
      type: jobData.jobType === 'full_time' ? 'Full-time' : 'Contract',
      status: 'Active',
      applicants: 0,
    }
    setJobs([newJob, ...jobs])
  }

  const handleDeleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Job Postings
          </h1>
          <p className="text-sm text-muted">Manage active listings, draft postings, and incoming application pipelines.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            id="open-ai-drawer-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            id="open-post-job-modal-btn"
          >
            <Plus className="w-4 h-4" />
            <span>+ Post New Job</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search job title, skills, or employer..."
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="card p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-foreground text-lg">{job.title}</h3>
                <span className="badge-verified">{job.status}</span>
                <span className="badge-info text-xs">{job.type}</span>
              </div>
              <p className="text-sm text-muted font-medium">{job.employer}</p>

              <div className="flex flex-wrap gap-4 text-xs text-muted pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-accent" />
                  {job.salary}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-border justify-between md:justify-end">
              <div className="text-right mr-2">
                <p className="text-lg font-bold text-foreground">{job.applicants}</p>
                <p className="text-xs text-muted">Applicants</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedJob(job)
                    setIsScheduleModalOpen(true)
                  }}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="Schedule Interview"
                >
                  <Calendar className="w-3.5 h-3.5" /> Interview
                </button>

                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="w-8 h-8 rounded-lg border border-border bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
                  title="Ask AI Agent about this job"
                >
                  <Bot className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="w-8 h-8 rounded-lg border border-border bg-surface-2 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center"
                  title="Delete job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals & AI Drawer */}
      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        jobTitle={selectedJob?.title}
        onScheduleSubmit={(data) => alert('Interview Scheduled successfully!')}
      />

      <AiAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  )
}
