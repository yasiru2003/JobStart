'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores'
import {
  Briefcase, Users, Calendar, TrendingUp, Sparkles, Plus,
  Kanban as KanbanIcon, ArrowRight, ShieldCheck, FileText, ChevronRight
} from 'lucide-react'
import ApplicationsChart from '@/components/charts/ApplicationsChart'
import VerificationQueueWidget from '@/components/tables/VerificationQueueWidget'
import KanbanBoard, { PipelineColumns } from '@/components/kanban/KanbanBoard'
import PostJobModal from '@/components/modals/PostJobModal'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import { useRouter } from 'next/navigation'

const SAMPLE_EMPLOYER_PIPELINE: PipelineColumns = {
  matched: [
    { id: 'c1', initials: 'KP', name: 'Kasun Perera', location: 'Colombo', verified: false, rating: '4.0', matchScore: 72 },
    { id: 'c2', initials: 'NF', name: 'Nimal Fernando', location: 'Gampaha', verified: true, rating: '4.2', matchScore: 81 },
  ],
  shortlisted: [
    { id: 'c4', initials: 'SR', name: 'Sunil Rathnayake', location: 'Negombo', verified: true, rating: '4.5', matchScore: 93 },
    { id: 'c5', initials: 'PJ', name: 'Priyanka Jayasuriya', location: 'Colombo', verified: true, rating: '4.1', matchScore: 87 },
  ],
  interviewing: [
    { id: 'c6', initials: 'CW', name: 'Chamara Wickramasinghe', location: 'Kandy', verified: true, rating: '4.6', matchScore: 95 },
  ],
  hired: [
    { id: 'c7', initials: 'DG', name: 'Dilani Gunawardena', location: 'Colombo', verified: true, rating: '4.8', matchScore: 97 },
  ],
}

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { user, viewingAs } = useAuthStore()
  const role = viewingAs || user?.role || 'admin'

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  // Employer / Recruiter View
  if (role === 'employer' || role === 'recruiter') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        {/* Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>Welcome back, {user?.fullName || 'Employer'}</span>
              <span className="badge-info text-xs capitalize">{role} Workspace</span>
            </h1>
            <p className="text-sm text-muted">Here is what's happening across your hiring pipelines and active job listings this week.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Schedule Interview</span>
            </button>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post New Job</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Active Postings</span>
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">4 Jobs</p>
            <p className="text-[11px] text-emerald-600 font-semibold">+2 new this month</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Total Applicants</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">154 Candidates</p>
            <p className="text-[11px] text-indigo-600 font-semibold">82% Verified via WhatsApp</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Interviews Scheduled</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">12 Scheduled</p>
            <p className="text-[11px] text-amber-600 font-semibold">WAHA Reminders Active</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Placements / Hired</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">8 Hired</p>
            <p className="text-[11px] text-emerald-600 font-semibold">+3 this week</p>
          </div>
        </div>

        {/* Kanban Candidate Pipeline Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <KanbanIcon className="w-5 h-5 text-indigo-600" />
                Active Candidate Pipeline (Drag & Drop)
              </h2>
              <p className="text-xs text-muted">Real-time hiring pipeline for Senior React / Next.js Developer role.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/jobs/1')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Full Job Pipeline View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <KanbanBoard initialColumns={SAMPLE_EMPLOYER_PIPELINE} jobTitle="Senior React / Next.js Developer" />
        </div>

        <PostJobModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={() => setIsPostModalOpen(false)}
        />

        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSubmit={() => setIsScheduleModalOpen(false)}
        />
      </div>
    )
  }

  // Admin View
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Grid: Applications Chart & Revenue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Chart (2 cols) */}
        <div className="lg:col-span-2 card p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-foreground">Platform-wide applications</h2>
                <p className="text-xs text-muted mt-0.5">Last 8 weeks</p>
              </div>
            </div>
            <ApplicationsChart />
          </div>
        </div>

        {/* Revenue Card (1 col) */}
        <div className="card p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <p className="text-sm font-semibold text-muted">Revenue this month</p>
            <p className="text-xs text-muted mt-0.5 mb-3">Employer subscriptions</p>

            <div className="mt-2">
              <h1 className="text-3xl font-extrabold text-foreground font-display tracking-tight">
                LKR 2.04M
              </h1>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.5% vs last month</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Starter</span>
                <span className="font-bold text-foreground">31 employers</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Growth</span>
                <span className="font-bold text-foreground">42 employers</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Scale / Enterprise</span>
                <span className="font-bold text-foreground">11 employers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Verification Queue */}
      <div className="w-full">
        <VerificationQueueWidget />
      </div>
    </div>
  )
}
