'use client'

import { Users, Plus, Search, Filter, Mail, Building2 } from 'lucide-react'

const sampleRecruiters = [
  { id: '1', name: 'Nalaka Bandara', email: 'nalaka@jobstart.lk', agency: 'TopJobs Talent Agency', activePlacements: 14, verified: true },
  { id: '2', name: 'Chathurika De Silva', email: 'chathurika@execsearch.lk', agency: 'Executive Search LK', activePlacements: 9, verified: true },
  { id: '3', name: 'Roshan Fernando', email: 'roshan@primecareers.lk', agency: 'Prime Careers', activePlacements: 22, verified: true },
  { id: '4', name: 'Kavindi Perera', email: 'kavindi@talenthub.lk', agency: 'TalentHub Sri Lanka', activePlacements: 5, verified: false },
]

export default function RecruitersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Recruiters & Talent Partners
          </h1>
          <p className="text-sm text-muted">Manage agency partners, recruiters, and placement commissions.</p>
        </div>
        <button className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0d9488] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Recruiter</span>
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search recruiters by name, agency, or email..."
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
              <th className="p-4 w-[24%]">Recruiter Name</th>
              <th className="p-4 w-[24%]">Agency</th>
              <th className="p-4 w-[24%]">Contact</th>
              <th className="p-4 w-[14%]">Active Placements</th>
              <th className="p-4 w-[14%]">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {sampleRecruiters.map((rec) => (
              <tr key={rec.id} className="hover:bg-surface-2/40 transition-colors">
                <td className="p-4 font-semibold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-xs shrink-0">
                      {rec.name.charAt(0)}
                    </div>
                    <span>{rec.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted shrink-0" />
                    <span>{rec.agency}</span>
                  </div>
                </td>
                <td className="p-4 text-muted">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>{rec.email}</span>
                  </div>
                </td>
                <td className="p-4 font-semibold text-foreground">{rec.activePlacements} candidates</td>
                <td className="p-4">
                  <span className={rec.verified ? 'badge-verified' : 'badge-pending'}>
                    {rec.verified ? 'Verified Agency' : 'Pending Review'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
