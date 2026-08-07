'use client'

import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react'
import ApplicationsChart from '@/components/charts/ApplicationsChart'

import { useAuthStore } from '@/lib/stores'

export default function ReportsPage() {
  const { user, viewingAs } = useAuthStore()
  const isEmployer = viewingAs === 'employer' || user?.role === 'employer'

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-sm text-muted">
            {isEmployer ? 'Company hiring velocity, applicant pipeline metrics, and interview outcomes.' : 'Platform performance, hiring velocity, and revenue analytics.'}
          </p>
        </div>
        <button className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-sm rounded-xl transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Total Applications</p>
          <h2 className="text-2xl font-bold text-foreground mt-2">{isEmployer ? '3' : '12,480'}</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% this month
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Successful Placements</p>
          <h2 className="text-2xl font-bold text-foreground mt-2">{isEmployer ? '1' : '1,840'}</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +9.8% this month
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted">Avg Time to Hire</p>
          <h2 className="text-2xl font-bold text-foreground mt-2">{isEmployer ? '14 Days' : '18 Days'}</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 3 days faster than Q1
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Hiring Velocity & Pipeline Volume</h3>
        <ApplicationsChart />
      </div>
    </div>
  )
}
