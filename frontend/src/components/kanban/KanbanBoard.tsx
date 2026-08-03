import { useState, useRef } from 'react'
import { MapPin, Star, ShieldCheck, GripVertical, Calendar, FileText, ChevronRight, Sparkles } from 'lucide-react'
import ScheduleInterviewModal from '@/components/modals/ScheduleInterviewModal'
import CandidateDetailModal from '@/components/modals/CandidateDetailModal'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

export type Candidate = {
  id: string
  initials: string
  name: string
  location: string
  verified: boolean
  rating: string
  matchScore: number
}

export type PipelineColumns = {
  matched: Candidate[]
  shortlisted: Candidate[]
  interviewing: Candidate[]
  hired: Candidate[]
}

type ColumnKey = keyof PipelineColumns

const COLUMNS: { key: ColumnKey; label: string; color: string; bg: string; border: string }[] = [
  { key: 'matched',      label: 'Matched',      color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)' },
  { key: 'shortlisted',  label: 'Shortlisted',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)'  },
  { key: 'interviewing', label: 'Interviewing',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  { key: 'hired',        label: 'Hired',         color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
]

interface KanbanBoardProps {
  initialColumns: PipelineColumns
  jobTitle?: string
}

export default function KanbanBoard({ initialColumns, jobTitle }: KanbanBoardProps) {
  const [columns, setColumns] = useState<PipelineColumns>(initialColumns)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragFrom, setDragFrom] = useState<ColumnKey | null>(null)
  const [dragOver, setDragOver] = useState<ColumnKey | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'match' | 'name' | 'rating'>('match')
  const [scheduleFor, setScheduleFor] = useState<Candidate | null>(null)
  const [selectedCand, setSelectedCand] = useState<Candidate | null>(null)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)

  const dragNode = useRef<HTMLDivElement | null>(null)

  const total = Object.values(columns).flat().length

  const handleDragStart = (e: React.DragEvent, id: string, from: ColumnKey) => {
    setDragId(id)
    setDragFrom(from)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, col: ColumnKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(col)
  }

  const handleDrop = (e: React.DragEvent, to: ColumnKey) => {
    e.preventDefault()
    if (!dragId || !dragFrom || dragFrom === to) { setDragOver(null); return }

    setColumns(prev => {
      const fromList = [...prev[dragFrom]]
      const toList = [...prev[to]]
      const idx = fromList.findIndex(c => c.id === dragId)
      if (idx === -1) return prev
      const [card] = fromList.splice(idx, 1)
      toList.push(card)
      return { ...prev, [dragFrom]: fromList, [to]: toList }
    })
    setDragId(null)
    setDragFrom(null)
    setDragOver(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragFrom(null)
    setDragOver(null)
  }

  const filterSort = (list: Candidate[]) => {
    let out = list
    if (search) out = out.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'match') out = [...out].sort((a, b) => b.matchScore - a.matchScore)
    if (sort === 'rating') out = [...out].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    if (sort === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name))
    return out
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search candidates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="py-2 px-3 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none cursor-pointer"
        >
          <option value="match">Sort: Best Match</option>
          <option value="rating">Sort: Rating</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="h-2 rounded-full overflow-hidden flex gap-px bg-surface-2">
          {COLUMNS.map(col => {
            const count = columns[col.key].length
            const pct = total > 0 ? (count / total) * 100 : 0
            return pct > 0 ? (
              <div key={col.key} style={{ width: `${pct}%`, background: col.color }} className="transition-all duration-500" />
            ) : null
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-2.5">
          {COLUMNS.map(col => (
            <div key={col.key} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: col.color }} />
              <span>{col.label}</span>
              <span className="font-bold text-foreground">{columns[col.key].length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const cards = filterSort(columns[col.key])
          const isOver = dragOver === col.key
          return (
            <div
              key={col.key}
              onDragOver={e => handleDragOver(e, col.key)}
              onDragEnter={e => handleDragOver(e, col.key)}
              onDrop={e => handleDrop(e, col.key)}
              onDragLeave={() => setDragOver(null)}
              style={{
                background: isOver ? col.bg : undefined,
                borderColor: isOver ? col.color : undefined,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '14px',
                transition: 'all 0.15s ease',
              }}
              className={`p-3 flex flex-col gap-3 min-h-[260px] ${!isOver ? 'border-border bg-surface-2' : ''}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{col.label}</span>
                  <button
                    onClick={() => setIsAiDrawerOpen(true)}
                    className="p-1 rounded-md hover:bg-primary/10 text-primary transition-colors cursor-pointer group"
                    title={`Get AI Help & compare candidates in ${col.label}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: col.color, borderColor: col.border, background: col.bg }}
                >
                  {columns[col.key].length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {cards.map(cand => (
                  <div
                    key={cand.id}
                    draggable
                    onDragStart={e => handleDragStart(e, cand.id, col.key)}
                    onDragEnd={handleDragEnd}
                    className={`bg-surface border border-border rounded-xl p-3.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all select-none ${dragId === cand.id ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'}`}
                  >
                    {/* Avatar + name row */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ background: col.color }}
                      >
                        {cand.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground text-sm leading-tight truncate">{cand.name}</p>
                          {cand.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                          <MapPin className="w-3 h-3" />
                          <span>{cand.location}</span>
                        </div>
                      </div>
                      <GripVertical className="w-4 h-4 text-border flex-shrink-0 mt-0.5" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-foreground">{cand.rating}</span>
                      </div>
                      <div
                        className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: col.color, background: col.bg }}
                      >
                        <span>{cand.matchScore}% match</span>
                      </div>
                    </div>

                    {/* Context-Relevant Stage Actions */}
                    <div className="flex gap-1.5 mt-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCand(cand)
                        }}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-2 hover:bg-border text-foreground transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="View Profile & Resume"
                      >
                        <FileText className="w-3 h-3" />
                        Profile
                      </button>

                      {(col.key === 'shortlisted' || col.key === 'interviewing') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setScheduleFor(cand)
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Schedule Interview"
                        >
                          <Calendar className="w-3 h-3" />
                          Interview
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted mb-2" />
                    <p className="text-xs text-muted">Drop candidates here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {scheduleFor && (
        <ScheduleInterviewModal
          isOpen={true}
          onClose={() => setScheduleFor(null)}
          jobTitle={jobTitle}
          candidateName={scheduleFor.name}
          onScheduleSubmit={() => { setScheduleFor(null); alert(`Interview scheduled with ${scheduleFor?.name}!`) }}
        />
      )}

      {selectedCand && (
        <CandidateDetailModal
          isOpen={true}
          onClose={() => setSelectedCand(null)}
          candidate={{
            ...selectedCand,
            jobTitle: jobTitle || (selectedCand as any).jobTitle || (selectedCand as any).title || 'DevOps & Cloud Architect'
          }}
        />
      )}

      <AiAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  )
}
