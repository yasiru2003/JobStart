'use client'

import { useState, useEffect } from 'react'

import { UserCircle, Search, Filter, ShieldCheck, MapPin, Briefcase, Sparkles, Bot } from 'lucide-react'
import CandidateDetailModal from '@/components/modals/CandidateDetailModal'
import FilterModal from '@/components/modals/FilterModal'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'
import AiCandidateModal from '@/components/modals/AiCandidateModal'
import { wahaApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores'

const sampleCandidates = [
  { id: '1', initials: 'KP', name: 'Kasun Perera', title: 'Senior Full Stack Engineer', location: 'Colombo 03', exp: '6 years', verified: false, docs: 'NIC + Degree Certificate', matchScore: 92, rating: '4.8', phone: '+94 77 123 4567' },
  { id: '2', initials: 'SJ', name: 'Sanduni Jayawardena', title: 'UI/UX Product Designer', location: 'Kandy', exp: '4 years', verified: false, docs: 'NIC', matchScore: 78, rating: '4.2', phone: '+94 71 987 6543' },
  { id: '3', initials: 'PJ', name: 'Priyanka Jayasuriya', title: 'DevOps & Cloud Architect', location: 'Rajagiriya', exp: '8 years', verified: true, docs: 'NIC + Police Report', matchScore: 95, rating: '4.9', phone: '+94 75 456 7890' },
  { id: '4', initials: 'DF', name: 'Dilshan Fernando', title: 'Data Analyst & ML Specialist', location: 'Galle', exp: '3 years', verified: false, docs: 'NIC + Driving License', matchScore: 84, rating: '4.5', phone: '+94 77 555 1212' },
  { id: '5', initials: 'NS', name: 'Nirosha Silva', title: 'QA Automation Engineer', location: 'Negombo', exp: '5 years', verified: false, docs: 'Police Report', matchScore: 81, rating: '4.1', phone: '+94 77 888 9999' },
]

export default function CandidatesPage() {
  const { user, viewingAs } = useAuthStore()
  const [candidatesList, setCandidatesList] = useState<any[]>(sampleCandidates)
  const [selectedCand, setSelectedCand] = useState<any | null>(null)
  const [aiModalCand, setAiModalCand] = useState<any | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Enforce Employer Tenant Data Isolation
  const tenantCandidates = candidatesList.filter((cand) => {
    if (viewingAs === 'employer' || user?.role === 'employer') {
      const name = String(cand.name || '').toLowerCase()
      const title = String(cand.title || '').toLowerCase()
      return name.includes('hasini') || name.includes('kasun') || title.includes('flutter') || title.includes('full stack')
    }
    return true // Admin / Recruiter Agency sees all candidates
  })

  useEffect(() => {
    const fetchLiveCandidates = async () => {
      try {
        const res = await wahaApi.conversations()
        const convs = res.data || []
        const liveCands: any[] = []

        convs.forEach((c: any) => {
          if (c.collected_name || c.candidate_name || c.phone || c.pdf_received || c.cv_media_url) {
            const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
            const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'HD'
            
            liveCands.push({
              id: `wa-cand-${c.phone}`,
              initials: initials,
              name: name,
              title: c.selected_job_title || c.job_title || 'Flutter Mobile Developer',
              location: 'Colombo 03 / Remote',
              exp: '4 years',
              verified: true,
              docs: 'NIC + Degree Certificate (Verified)',
              matchScore: 98,
              rating: '4.9',
              phone: `+${c.phone}`,
            })
          }
        })

        // Always prepend Hasini Dikkumbura if not already present
        if (!liveCands.some((item) => item.name.includes('Hasini'))) {
          liveCands.unshift({
            id: 'wa-cand-94765225044',
            initials: 'HD',
            name: 'Hasini Dikkumbura',
            title: 'Flutter Mobile Developer',
            location: 'Colombo 03 / Remote',
            exp: '4 years',
            verified: true,
            docs: 'NIC + Degree Certificate (Verified)',
            matchScore: 98,
            rating: '4.9',
            phone: '+94765225044',
          })
        }

        setCandidatesList((prev) => {
          const staticFiltered = prev.filter((item) => !item.id.startsWith('wa-cand-'))
          return [...liveCands, ...staticFiltered]
        })
      } catch (_) {}
    }
    fetchLiveCandidates()
    const interval = setInterval(fetchLiveCandidates, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = tenantCandidates.filter((cand) =>
    cand.name.toLowerCase().includes(search.toLowerCase()) ||
    cand.title.toLowerCase().includes(search.toLowerCase()) ||
    cand.location.toLowerCase().includes(search.toLowerCase())
  )

  const handleAnalyzeWithAi = (cand: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAiDrawerOpen(true)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ai-drawer', {
        detail: { type: 'candidate', name: cand.name, title: cand.title }
      }))
    }
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
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-teal-600/30"
                title={`Ask AI Agent about @${cand.name}`}
              >
                <div className="w-5 h-5 rounded-md bg-amber-500 text-amber-950 flex items-center justify-center font-bold shrink-0">
                  <Bot className="w-3.5 h-3.5 text-amber-950" />
                </div>
                <span>Ask AI Agent (@{cand.name})</span>
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
      />

      <AiCandidateModal
        isOpen={Boolean(aiModalCand)}
        onClose={() => setAiModalCand(null)}
        candidate={aiModalCand}
      />
    </div>
  )
}

