'use client'

import ApplicationsChart from '@/components/charts/ApplicationsChart'
import VerificationQueueWidget from '@/components/tables/VerificationQueueWidget'
import { TrendingUp } from 'lucide-react'

export default function DashboardOverviewPage() {
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
