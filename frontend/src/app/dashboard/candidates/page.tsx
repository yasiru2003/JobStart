'use client'

import { useState } from 'react'
import { UserCircle, Search, Filter, ShieldCheck, MapPin, Briefcase, Sparkles } from 'lucide-react'
import CandidateDetailModal from '@/components/modals/CandidateDetailModal'
import FilterModal from '@/components/modals/FilterModal'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

import { useAuthStore } from '@/lib/stores'

const sampleCandidates = [
  { id: '1', initials: 'KP', name: 'Kasun Perera', title: 'Senior React / Next.js Developer', location: 'Colombo 03', exp: '6 years', verified: true, docs: 'NIC + NVQ Level 6 (Verified)', matchScore: 92, rating: '4.8', phone: '+94 77 123 4567' },
  { id: '6', initials: 'JA', name: 'Janith Alwis', title: 'Senior React / Next.js Developer', location: 'Colombo 05', exp: '5 years', verified: false, docs: 'NIC Verified (Degree Audit Pending)', matchScore: 89, rating: '4.7', phone: '+94 71 222 3344' },
  { id: '7', initials: 'RW', name: 'Ruwan Wickramasinghe', title: 'Senior React / Next.js Developer', location: 'Moratuwa', exp: '4 years', verified: false, docs: 'NIC Pending TVEC Audit', matchScore: 85, rating: '4.4', phone: '+94 75 333 4455' },
  { id: '2', initials: 'SJ', name: 'Sanduni Jayawardena', title: 'UI/UX Product Designer', location: 'Kandy', exp: '4 years', verified: true, docs: 'NIC + NVQ Level 5 (Verified)', matchScore: 88, rating: '4.6', phone: '+94 71 987 6543' },
  { id: '3', initials: 'PJ', name: 'Priyanka Jayasuriya', title: 'DevOps & Cloud Architect', location: 'Rajagiriya', exp: '8 years', verified: true, docs: 'AWS + CKA + Police (Verified)', matchScore: 95, rating: '4.9', phone: '+94 75 456 7890' },
  { id: '4', initials: 'DF', name: 'Dilshan Fernando', title: 'Data Analyst & ML Specialist', location: 'Galle', exp: '3 years', verified: false, docs: 'NIC Verified (Degree Audit Pending)', matchScore: 84, rating: '4.5', phone: '+94 77 555 1212' },
  { id: '5', initials: 'NS', name: 'Nirosha Silva', title: 'QA Automation Engineer', location: 'Negombo', exp: '5 years', verified: false, docs: 'ISTQB Audit Pending', matchScore: 81, rating: '4.1', phone: '+94 77 888 9999' },
]

export default function CandidatesPage() {
  const { user, viewingAs } = useAuthStore()
  const [selectedCand, setSelectedCand] = useState<any | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const isEmployerOrRecruiter = viewingAs === 'employer' || viewingAs === 'recruiter'
  const userCompany = user?.tenantDomain || (isEmployerOrRecruiter ? 'WSO2 Lanka' : null)

  const filtered = sampleCandidates.filter((cand) =>
    cand.name.toLowerCase().includes(search.toLowerCase()) ||
    cand.title.toLowerCase().includes(search.toLowerCase()) ||
    cand.location.toLowerCase().includes(search.toLowerCase())
  )

  const [aiPrompt, setAiPrompt] = useState('')

  const handleAnalyzeWithAi = (cand: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setAiPrompt(`Analyze @${cand.name} for ${cand.title}`)
    setIsAiDrawerOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="px-3.5 py-2 border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground flex items-center gap-2 hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cand) => (
          <div key={cand.id} className="card p-5 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary text-white font-bold flex items-center justify-center text-sm">
                    {cand.initials}
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
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <button
                onClick={(e) => handleAnalyzeWithAi(cand, e)}
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all border border-primary/20 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Candidate with AI</span>
              </button>

              <button
                onClick={() => setSelectedCand(cand)}
                className="w-full py-2 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                View Candidate Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      <CandidateDetailModal
        isOpen={Boolean(selectedCand)}
        onClose={() => setSelectedCand(null)}
        candidate={selectedCand}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={() => setIsFilterOpen(false)}
      />

      <AiAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        initialPrompt={aiPrompt}
      />
    </div>
  )
}
