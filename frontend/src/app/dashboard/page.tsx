'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores'
import { dashboardApi, wahaApi } from '@/lib/api'

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

const INITIAL_EMPLOYER_PIPELINE: PipelineColumns = {
  matched: [
    { id: 'c1', initials: 'KP', name: 'Kasun Perera', location: 'Colombo 03', verified: false, rating: '4.0', matchScore: 72 },
  ],
  shortlisted: [
    { id: 'c4', initials: 'SR', name: 'Sunil Rathnayake', location: 'Negombo', verified: true, rating: '4.5', matchScore: 93 },
  ],
  interviewing: [
    { id: 'c-hd', initials: 'HD', name: 'Hasini Dikkumbura', location: 'Colombo 03 / Remote', verified: true, rating: '4.9', matchScore: 98 },
  ],
  hired: [],
}

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { user, viewingAs } = useAuthStore()
  const role = viewingAs || user?.role || 'admin'
  const isEmployer = role === 'employer'

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<any | null>(null)
  const [pipelineData, setPipelineData] = useState<PipelineColumns>(INITIAL_EMPLOYER_PIPELINE)
  const [liveMetrics, setLiveMetrics] = useState({
    totalCandidates: isEmployer ? 3 : 52,
    activeJobs: isEmployer ? 1 : 4,
    screenedApplicants: isEmployer ? 2 : 41,
    confirmedInterviews: isEmployer ? 2 : 14,
  })

  useEffect(() => {
    async function fetchDashboard() {
      try {
        let res
        if (role === 'employer') {
          res = await dashboardApi.employerOverview()
        } else if (role === 'recruiter') {
          res = await dashboardApi.recruiterOverview()
        } else {
          res = await dashboardApi.adminOverview()
        }
        if (res?.data) {
          setDashboardData(res.data)
        }
      } catch (_) {}

      try {
        const convsRes = await wahaApi.conversations()
        const convs = convsRes.data || []
        const waCount = convs.length
        const waScreened = convs.filter((c: any) => c.pdf_received || c.cv_media_url || c.screening_stage === 'completed').length
        const waConfirmed = convs.filter((c: any) => c.interview_confirmed).length

        // Prepend Hasini and WhatsApp candidates to interviewing column
        const waInterviewingCards: any[] = []
        convs.forEach((c: any) => {
          const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'HD'
          waInterviewingCards.push({
            id: `wa-card-${c.phone}`,
            initials: initials,
            name: name,
            location: 'Colombo 03 / Remote',
            verified: true,
            rating: '4.9',
            matchScore: 98,
          })
        })

        if (!waInterviewingCards.some((item) => item.name.includes('Hasini'))) {
          waInterviewingCards.unshift({
            id: 'wa-card-94765225044',
            initials: 'HD',
            name: 'Hasini Dikkumbura',
            location: 'Colombo 03 / Remote',
            verified: true,
            rating: '4.9',
            matchScore: 98,
          })
        }

        setPipelineData((prev) => ({
          ...prev,
          interviewing: [
            ...waInterviewingCards,
            ...prev.interviewing.filter((item) => !item.id.startsWith('wa-card-') && item.id !== 'c-hd')
          ]
        }))

        setLiveMetrics({
          totalCandidates: isEmployer ? (2 + waCount) : (45 + waCount),
          activeJobs: isEmployer ? 1 : 4,
          screenedApplicants: isEmployer ? (1 + waScreened) : (35 + waScreened),
          confirmedInterviews: isEmployer ? (1 + waConfirmed) : (12 + waConfirmed),
        })
      } catch (_) {}
    }

    fetchDashboard()
    const interval = setInterval(fetchDashboard, 5000)
    return () => clearInterval(interval)
  }, [role])



  // Employer View
  if (role === 'employer') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        {/* Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>Welcome, {user?.fullName || 'Employer'}</span>
              <span className="badge-info text-xs">Employer Portal</span>
            </h1>
            <p className="text-sm text-muted">Manage your company job postings, internal HR team, and candidate hiring pipelines.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Schedule Interview</span>
            </button>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
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
              <span className="text-xs font-semibold">Company Openings</span>
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{liveMetrics.activeJobs} Active {liveMetrics.activeJobs === 1 ? 'Job' : 'Jobs'}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">+1 posted this month</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Hiring Team</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">2 HR Recruiters</p>
            <p className="text-[11px] text-indigo-600 font-semibold">1 Opening Managed</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Scheduled Interviews</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{liveMetrics.confirmedInterviews} Scheduled</p>
            <p className="text-[11px] text-amber-600 font-semibold">WhatsApp Bot Active</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Total Hired</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">1 Placed</p>
            <p className="text-[11px] text-emerald-600 font-semibold">+1 placed this week</p>
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
              <p className="text-xs text-muted">Real-time candidate hiring stages for Senior React / Next.js Developer role.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/jobs/1')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Job Pipeline View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <KanbanBoard initialColumns={pipelineData} jobTitle="Senior React / Next.js Developer" />

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

  // Recruiter Workspace View
  if (role === 'recruiter') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>Welcome, {user?.fullName || 'Recruiter'}</span>
              <span className="badge-verified text-xs">Recruiter Workspace</span>
            </h1>
            <p className="text-sm text-muted">Screen candidate submissions, schedule interviews, and move candidates across active pipelines.</p>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Candidate Interview</span>
          </button>
        </div>

        {/* Recruiter Workspace Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">My Assigned Jobs</span>
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">3 Assigned</p>
            <p className="text-[11px] text-muted">Engineering & Tech Ops</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Candidates Screened</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">28 Candidates</p>
            <p className="text-[11px] text-emerald-600 font-semibold">19 active in pipeline</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Interviews Conducted</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">14 Conducted</p>
            <p className="text-[11px] text-amber-600 font-semibold">5 scheduled this week</p>
          </div>

          <div className="card p-5 space-y-1">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold">Success Hire Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">88% Placement</p>
            <p className="text-[11px] text-emerald-600 font-semibold">High quality match rating</p>
          </div>
        </div>

        {/* Candidate Pipeline Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <KanbanIcon className="w-5 h-5 text-indigo-600" />
                Assigned Candidate Pipeline
              </h2>
              <p className="text-xs text-muted">Evaluate, match, and schedule interviews for assigned applicants.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/jobs/1')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <KanbanBoard initialColumns={pipelineData} jobTitle="Senior React / Next.js Developer" />

        </div>

        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSubmit={() => setIsScheduleModalOpen(false)}
        />
      </div>
    )
  }

  // Platform Admin (HirePath Core Team) View
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>HirePath Platform Command Center</span>
            <span className="badge-verified text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
              Platform Admin System
            </span>
          </h1>
          <p className="text-sm text-muted">Full administrative oversight across verified companies, candidates, verification queues, and platform subscriptions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/employers')}
            className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Manage Employers</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/verification')}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Queue</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold">Total Verified Employers</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">84 Companies</p>
          <p className="text-[11px] text-emerald-600 font-semibold">+6 registered this week</p>
        </div>

        <div className="card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold">Platform Candidate Pool</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">1,240 Talent Profiles</p>
          <p className="text-[11px] text-indigo-600 font-semibold">94% Identity Verified</p>
        </div>

        <div className="card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold">Pending Verification Queue</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">14 Pending</p>
          <p className="text-[11px] text-amber-600 font-semibold">TVEC & NIC Checks Queued</p>
        </div>

        <div className="card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold">Platform Monthly MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">LKR 2.04M</p>
          <p className="text-[11px] text-emerald-600 font-semibold">+18.4% MRR Growth</p>
        </div>
      </div>

      {/* Top Grid: Applications Chart & Revenue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Chart (2 cols) */}
        <div className="lg:col-span-2 card p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-foreground">Platform-wide Job Applications</h2>
                <p className="text-xs text-muted mt-0.5">Application volume across all registered employers (Last 8 weeks)</p>
              </div>
            </div>
            <ApplicationsChart />
          </div>
        </div>

        {/* Revenue Card (1 col) */}
        <div className="card p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <p className="text-sm font-semibold text-muted">Revenue & Subscriptions</p>
            <p className="text-xs text-muted mt-0.5 mb-3">Employer SaaS Plan Tier Breakdown</p>

            <div className="mt-2">
              <h1 className="text-3xl font-extrabold text-foreground font-display tracking-tight">
                LKR 2.04M
              </h1>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% vs last month</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Starter Plan (LKR 25k/mo)</span>
                <span className="font-bold text-foreground">31 employers</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Growth Plan (LKR 45k/mo)</span>
                <span className="font-bold text-foreground">42 employers</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Scale Enterprise</span>
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
