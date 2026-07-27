'use client'

import { UserCircle, Search, Filter, ShieldCheck, MapPin, Briefcase } from 'lucide-react'

const sampleCandidates = [
  { id: '1', name: 'Kasun Perera', title: 'Senior Full Stack Engineer', location: 'Colombo 03', exp: '6 years', verified: false, docs: 'NIC + NVQ Level 6' },
  { id: '2', name: 'Sanduni Jayawardena', title: 'UI/UX Product Designer', location: 'Kandy', exp: '4 years', verified: false, docs: 'NIC' },
  { id: '3', name: 'Priyanka Jayasuriya', title: 'DevOps & Cloud Architect', location: 'Rajagiriya', exp: '8 years', verified: true, docs: 'NIC + Police Report' },
  { id: '4', name: 'Dilshan Fernando', title: 'Data Analyst & ML Specialist', location: 'Galle', exp: '3 years', verified: false, docs: 'NIC + Driving License' },
  { id: '5', name: 'Nirosha Silva', title: 'QA Automation Engineer', location: 'Negombo', exp: '5 years', verified: false, docs: 'Police Report' },
]

export default function CandidatesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            Candidates Directory
          </h1>
          <p className="text-sm text-muted">Browse verified talent, qualifications, and background checks across Sri Lanka.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search candidate skills, location, or job role..."
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="px-3.5 py-2 border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleCandidates.map((cand) => (
          <div key={cand.id} className="card p-5 hover:shadow-md transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary text-white font-bold flex items-center justify-center text-sm">
                  {cand.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-snug">{cand.name}</h3>
                  <p className="text-xs text-primary font-medium">{cand.title}</p>
                </div>
              </div>
              <span className={cand.verified ? 'badge-verified' : 'badge-pending'}>
                {cand.verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-muted pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>{cand.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>Experience: {cand.exp}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>Docs: {cand.docs}</span>
              </div>
            </div>

            <button className="w-full py-2 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl transition-colors">
              View Candidate Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
