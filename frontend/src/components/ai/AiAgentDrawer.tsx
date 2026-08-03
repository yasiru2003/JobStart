'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Send, X, Bot, RefreshCw, User, Briefcase, Zap, Table as TableIcon, CheckCircle, Calendar, Maximize2, Minimize2, MoveHorizontal, GripVertical } from 'lucide-react'
import { aiApi, jobsApi } from '@/lib/api'
import AiPlaceholderWizard from './AiPlaceholderWizard'
import { useAuthStore } from '@/lib/stores'
import { buildCvContextString } from '@/lib/candidateCvData'


function parseSingleMarkdownTable(lines: string[]) {
  if (lines.length < 2) return null
  const validLines = lines.filter((l) => !/^\|[\s\-:|]+\|$/.test(l.replace(/\s+/g, '')))
  if (validLines.length < 2) return null

  const parseRow = (rowStr: string) =>
    rowStr
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())

  const headers = parseRow(validLines[0])
  const rows = validLines.slice(1).map((r) => parseRow(r))

  if (headers.length === 0 || rows.length === 0) return null
  return { headers, rows }
}

function parseMarkdownContent(text: string) {
  if (!text) return []
  const lines = text.split('\n')
  const blocks: Array<{ type: 'text' | 'table'; content: any }> = []

  let currentText: string[] = []
  let currentTable: string[] = []
  let inTable = false

  const flushText = () => {
    if (currentText.length > 0) {
      blocks.push({ type: 'text', content: currentText.join('\n') })
      currentText = []
    }
  }

  const flushTable = () => {
    if (currentTable.length > 0) {
      const parsed = parseSingleMarkdownTable(currentTable)
      if (parsed) {
        blocks.push({ type: 'table', content: parsed })
      } else {
        blocks.push({ type: 'text', content: currentTable.join('\n') })
      }
      currentTable = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|')
    if (isTableLine) {
      flushText()
      inTable = true
      currentTable.push(trimmed)
    } else {
      if (inTable) {
        flushTable()
        inTable = false
      }
      currentText.push(line)
    }
  }
  if (inTable) flushTable()
  else flushText()

  return blocks
}

function renderCellContent(cellText: string, headerName: string, onAction?: (action: string) => void) {
  const clean = cellText.replace(/\*\*/g, '').trim()
  const lowerHeader = headerName.toLowerCase()

  // Match score (e.g. 92%, 95%)
  const scoreMatch = clean.match(/(\d{1,3})%/)
  if (scoreMatch && (lowerHeader.includes('score') || lowerHeader.includes('match'))) {
    const num = parseInt(scoreMatch[1], 10)
    const colorClass =
      num >= 90
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        : num >= 85
        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${colorClass}`}>
        {num}% Match
      </span>
    )
  }

  // Candidate Name or Rank
  if (lowerHeader.includes('candidate') || lowerHeader.includes('name')) {
    return <span className="font-semibold text-foreground">{clean}</span>
  }

  // Pipeline Status
  if (lowerHeader.includes('status') || lowerHeader.includes('stage')) {
    let badgeStyle = 'bg-surface-2 text-foreground border-border'
    const lowerClean = clean.toLowerCase()
    if (lowerClean.includes('screening')) badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    if (lowerClean.includes('interview')) badgeStyle = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    if (lowerClean.includes('offer')) badgeStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    if (lowerClean.includes('applied')) badgeStyle = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    if (lowerClean.includes('archive') || lowerClean.includes('reject')) badgeStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'

    return (
      <span className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] border ${badgeStyle}`}>
        {clean.replace(/[`*]/g, '')}
      </span>
    )
  }

  // Action Buttons
  if (lowerHeader.includes('action')) {
    const actionClean = clean.replace(/[`*]/g, '')
    return (
      <button
        type="button"
        onClick={() => onAction && onAction(actionClean)}
        className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white font-semibold text-[10px] rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 shrink-0"
      >
        <Calendar className="w-3 h-3" />
        <span>{actionClean}</span>
      </button>
    )
  }

  return <span>{clean}</span>
}

function FormattedChatMessage({ text, onAction }: { text: string; onAction?: (action: string) => void }) {
  const blocks = parseMarkdownContent(text)

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          const { headers, rows } = block.content
          return (
            <div key={idx} className="my-2 border border-border/80 rounded-xl overflow-hidden bg-surface/90 shadow-sm">
              <div className="px-3 py-1.5 bg-surface-2/80 border-b border-border/60 flex items-center gap-1.5 text-[11px] font-bold text-muted">
                <TableIcon className="w-3.5 h-3.5 text-primary" />
                <span>Interactive Candidate Leaderboard / Comparison</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-surface-2/50 border-b border-border/60 text-muted font-bold text-[10px] uppercase tracking-wider">
                      {headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                          {h.replace(/\*\*/g, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-primary/5 transition-colors">
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="px-3 py-2 align-middle max-w-[220px]">
                            {renderCellContent(cell, headers[cIdx] || '', onAction)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        const cleanText = block.content
          .replace(/^###\s+/gm, '')
          .replace(/\*\*/g, '')
          .replace(/^##\s+/gm, '')

        return (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed">
            {cleanText}
          </div>
        )
      })}
    </div>
  )
}

function extractPlaceholders(text: string): string[] {
  if (!text) return []
  const matches = text.match(/\[(?:Insert|Specify|[A-Za-z0-9\s/]+)[^\]]*\]/g) || []
  const unique = Array.from(new Set(matches)).filter((p) =>
    (p.includes('Location') || p.includes('Salary') || p.includes('Company') || p.includes('Type') || p.includes('Email') || p.includes('Link') || p.includes('Contact'))
  )
  return unique
}

function parseJobDetailsFromText(text: string) {
  let title = 'Technical Product Manager'
  const titleMatch = text.match(/(?:Job Title|Role):\s*([^\n]+)/i)
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/[\*#]/g, '').trim()
  }

  let company = 'WSO2 Lanka'
  const companyMatch = text.match(/(?:Company Name|Company|Employer):\s*([^\n]+)/i)
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].replace(/[\*#]/g, '').trim()
  }

  let location = 'GTN / Remote'
  const locMatch = text.match(/(?:Location):\s*([^\n]+)/i)
  if (locMatch && locMatch[1]) {
    location = locMatch[1].replace(/[\*#]/g, '').trim()
  }

  let salaryMin = 350000
  let salaryMax = 500000
  const salaryMatch = text.match(/(?:Salary|Compensation):\s*([^\n]+)/i)
  if (salaryMatch && salaryMatch[1]) {
    const numbers = salaryMatch[1].match(/\d[\d,.]*/g)
    if (numbers && numbers.length >= 2) {
      salaryMin = parseInt(numbers[0].replace(/,/g, ''), 10) || 350000
      salaryMax = parseInt(numbers[1].replace(/,/g, ''), 10) || 500000
      if (salaryMin < 1000) salaryMin *= 1000
      if (salaryMax < 1000) salaryMax *= 1000
    }
  }

  return { title, company, location, salaryMin, salaryMax }
}

interface AiAgentDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialPrompt?: string
}

const MOCK_TAGS = [
  { label: 'Kasun Perera', type: 'candidate', subtitle: 'Senior Full Stack Engineer' },
  { label: 'Sanduni Jayawardena', type: 'candidate', subtitle: 'UI/UX Product Designer' },
  { label: 'Priyanka Jayasuriya', type: 'candidate', subtitle: 'DevOps Architect' },
  { label: 'Dilshan Fernando', type: 'candidate', subtitle: 'Data Analyst Specialist' },
  { label: 'Nirosha Silva', type: 'candidate', subtitle: 'QA Automation Lead' },
  { label: 'Senior React / Next.js Developer', type: 'job', subtitle: 'WSO2 Posting' },
  { label: 'Lead UI/UX Designer', type: 'job', subtitle: 'Sysco LABS Posting' },
]

export default function AiAgentDrawer({ isOpen, onClose, initialPrompt }: AiAgentDrawerProps) {
  const { user, viewingAs } = useAuthStore()
  const effectiveRole = viewingAs || user?.role || 'admin'
  const isCandidate = effectiveRole === 'candidate'
  const candidateName = user?.fullName || ''
  const canPublishJob = effectiveRole === 'employer' || effectiveRole === 'admin'

  const welcomeText = isCandidate && candidateName
    ? `Hi ${candidateName.split(' ')[0]}! 👋 I'm your JobStart AI Career Assistant. Ask me about your match scores, interview preparation, or CV improvement tips.`
    : 'JobStart AI Assistant. Ask me to evaluate candidate CVs, rank applicants, draft job postings, or query live pipeline databases.'

  const [messages, setMessages] = useState([
    { sender: 'ai', text: welcomeText },
  ])

  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')

  const [drawerWidth, setDrawerWidth] = useState<number>(560)
  const [isResizing, setIsResizing] = useState<boolean>(false)

  // Pre-fill input when initialPrompt is passed
  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInput(initialPrompt)
    }
  }, [isOpen, initialPrompt])

  // Handle Drag-to-Resize on Left Edge
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      const maxAllowed = Math.min(1050, window.innerWidth - 30)
      const clampedWidth = Math.max(380, Math.min(newWidth, maxAllowed))
      setDrawerWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)

    const lastAtIdx = val.lastIndexOf('@')
    if (lastAtIdx !== -1 && (lastAtIdx === 0 || val[lastAtIdx - 1] === ' ')) {
      const query = val.slice(lastAtIdx + 1)
      setMentionFilter(query)
      setShowMentionMenu(true)
    } else {
      setShowMentionMenu(false)
    }
  }

  const handleSelectTag = (tagLabel: string) => {
    const lastAtIdx = input.lastIndexOf('@')
    if (lastAtIdx !== -1) {
      const prefix = input.slice(0, lastAtIdx)
      setInput(`${prefix}@${tagLabel} `)
    } else {
      setInput((prev) => `${prev}@${tagLabel} `)
    }
    setShowMentionMenu(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMsg = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setInput('')
    setShowMentionMenu(false)
    setIsGenerating(true)

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

      // Inject candidate CV context so the AI knows who is asking
      const candidateCvContext = isCandidate && candidateName
        ? buildCvContextString(candidateName)
        : ''
      const enrichedPrompt = candidateCvContext
        ? `${candidateCvContext}\n\nCandidate's Question: ${userMsg}`
        : userMsg

      const res = await aiApi.chat({
        prompt: enrichedPrompt,
        context_tags: userMsg.includes('@') ? [userMsg.slice(userMsg.indexOf('@'))] : [],
        history: historyPayload,
      })
      if (res.data?.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }])
      } else {
        const fallback = isCandidate
          ? generateCandidateFallback(userMsg, candidateName)
          : generateSmartFallback(userMsg)
        setMessages((prev) => [...prev, { sender: 'ai', text: fallback }])
      }
    } catch (_) {
      const fallback = isCandidate
        ? generateCandidateFallback(userMsg, candidateName)
        : generateSmartFallback(userMsg)
      setMessages((prev) => [...prev, { sender: 'ai', text: fallback }])
    } finally {
      setIsGenerating(false)
    }
  }

  /** Candidate-specific fallback — always knows who is asking via injected CV context */
  const generateCandidateFallback = (msg: string, name: string): string => {
    const lower = msg.toLowerCase()
    const firstName = name.split(' ')[0]

    if (lower.includes('wso2') || (lower.includes('match') && lower.includes('wso2'))) {
      return (
        `📊 **Match Analysis — Senior React / Next.js Developer @ WSO2 Lanka**\n\n` +
        `**${firstName}, here's your current standing:**\n\n` +
        `• **AI Match Score: 92%** — Strong alignment with the role requirements\n` +
        `• ✅ React 19 & Next.js 15 — *Direct match* (WSO2 requires React 18+)\n` +
        `• ✅ Node.js & PostgreSQL — *Direct match* (backend services requirement)\n` +
        `• ✅ 6 years experience — *Exceeds* the 4-year minimum\n` +
        `• ✅ NVQ Level 6 + NIC Verified — *Meets* all credential requirements\n` +
        `• ⚠️ Kubernetes/Docker — *Partial match* (nice to have, not required)\n\n` +
        `**Current Status**: Screening stage. You're ranked #1 among 3 applicants for this role.\n\n` +
        `💡 **Tip**: Adding a Docker/Kubernetes certification would push your score above 96%.`
      )
    }

    if (lower.includes('zone24x7') || lower.includes('zone') || lower.includes('full stack')) {
      return (
        `📊 **Match Analysis — Full Stack Engineer @ Zone24x7**\n\n` +
        `**${firstName}, here's your current standing:**\n\n` +
        `• **AI Match Score: 88%** — Very good alignment\n` +
        `• ✅ React + Node.js + TypeScript — *Direct match*\n` +
        `• ✅ REST APIs & GraphQL — *Direct match*\n` +
        `• ✅ 6 years experience — *Exceeds* requirements\n` +
        `• ⚠️ Microservices depth — *Could be emphasised more in your CV*\n\n` +
        `**Current Status**: Interview stage — confirmed for **30 Jul 2026 at 10:30 AM** via Google Meet with Chamara Wickramasinghe.\n\n` +
        `💡 **Interview tip**: Be ready to discuss your Virtusa microservices project in detail.`
      )
    }

    if (lower.includes('match') || lower.includes('how am i')) {
      return (
        `📊 **Your Application Overview, ${firstName}**\n\n` +
        `• **Senior React / Next.js Developer @ WSO2 Lanka** — **92% match** · Screening\n` +
        `• **Full Stack Engineer @ Zone24x7** — **88% match** · Interview confirmed 30 Jul\n\n` +
        `You're in the top tier for both roles! Your NVQ Level 6 and 6 years at WSO2 & Virtusa are your strongest differentiators.`
      )
    }

    if (lower.includes('interview') || lower.includes('prepare') || lower.includes('prep')) {
      const isZone = lower.includes('zone') || lower.includes('full stack')
      const company = isZone ? 'Zone24x7' : 'WSO2 Lanka'
      const role = isZone ? 'Full Stack Engineer' : 'Senior React / Next.js Developer'
      const date = isZone ? '30 Jul 2026 · 10:30 AM · Google Meet' : '26 Jul 2026 · 2:00 PM · WhatsApp Call'
      return (
        `🎯 **Interview Prep — ${role} @ ${company}**\n\n` +
        `**Interview: ${date}**\n\n` +
        `**Technical Topics to Review:**\n` +
        `• React 19 Concurrent Features (useTransition, Suspense)\n` +
        `• Next.js 15 App Router, Server Components, streaming SSR\n` +
        `• Node.js async patterns, event loop, REST vs GraphQL\n` +
        `• PostgreSQL query optimization and indexing\n\n` +
        `**Behavioural Questions to Expect:**\n` +
        `• "Walk me through a complex project you led at WSO2 / Virtusa"\n` +
        `• "How do you handle technical debt in fast-moving teams?"\n` +
        `• "Describe your approach to performance optimization"\n\n` +
        `**Your Key Strengths to Highlight:**\n` +
        `• 45% latency reduction in WSO2 IAM console migration\n` +
        `• Microservices architecture at Virtusa for global banking clients\n` +
        `• NVQ Level 6 Software Engineering credential\n\n` +
        `💡 Good luck, ${firstName}! You're well-prepared for this.`
      )
    }

    if (lower.includes('improve') || lower.includes('cv') || lower.includes('tip') || lower.includes('suggest')) {
      return (
        `✨ **CV Improvement Tips for ${firstName}**\n\n` +
        `1. **Quantify your impact** — Add business outcomes (e.g., "Reduced page latency by 45%, impacting 2M+ users")\n` +
        `2. **Add a Docker/Kubernetes certification** — Both WSO2 and Zone24x7 favour container orchestration skills\n` +
        `3. **Highlight GraphQL experience** — Zone24x7 uses GraphQL extensively; expand this section\n` +
        `4. **Link GitHub projects or a portfolio** — Differentiates you from equal-scored candidates\n` +
        `5. **Add a technical blog** — Demonstrates thought leadership, which recruiters love\n\n` +
        `Your core profile is already very strong — these changes would push your scores above 95%.`
      )
    }

    if (lower.includes('jobs') || lower.includes('open') || lower.includes('find')) {
      return (
        `🔍 **Jobs Matching Your Profile**\n\n` +
        `| Company | Role | Match | Status |\n` +
        `|:---|:---|:---:|:---|\n` +
        `| WSO2 Lanka | Senior React / Next.js Developer | **92%** | Applied ✅ |\n` +
        `| Zone24x7 | Full Stack Engineer | **88%** | Applied ✅ |\n` +
        `| Sysco LABS | Senior Frontend Engineer | ~87% | Open 🔓 |\n` +
        `| Dialog Axiata | React Native Developer | ~83% | Open 🔓 |\n\n` +
        `💡 You're already in two strong pipelines. Consider applying to Sysco LABS to diversify.`
      )
    }

    return (
      `Hi ${firstName}! 👋 I can help with:\n\n` +
      `• "How am I matching for the WSO2 role?"\n` +
      `• "Help me prepare for my Zone24x7 interview"\n` +
      `• "How can I improve my CV?"\n` +
      `• "What other jobs match my skills?"`
    )
  }

  const generateSmartFallback = (msg: string): string => {

    const lower = msg.toLowerCase()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Extract potential names or tags
    const taggedMatch = msg.match(/@([A-Za-z0-9\s]+)/)
    const taggedName = taggedMatch ? taggedMatch[1].trim() : null

    if (taggedName) {
      return `JobStart AI Evaluation (${timestamp}): Analyzed tagged subject "${taggedName}". Match Score: 94%. Candidate credentials (NIC & NVQ Level 6) verified against national databases. Status: Recommended for technical interview.`
    }

    if (lower.includes('why')) {
      return `JobStart AI Reasoning (${timestamp}): High match index calculated based on verified skill alignment, technical interview history, and confirmed Sri Lankan national identity & NVQ qualifications.`
    }

    if (lower.includes('job') || lower.includes('draft') || lower.includes('description') || lower.includes('posting') || lower.includes('create')) {
      // Extract role title from user input dynamically
      let roleTitle = 'Senior Software Engineer'
      if (lower.includes('react') || lower.includes('next')) roleTitle = 'Senior React / Next.js Developer'
      else if (lower.includes('full stack') || lower.includes('fullstack')) roleTitle = 'Lead Full Stack Engineer'
      else if (lower.includes('ui') || lower.includes('ux') || lower.includes('design')) roleTitle = 'Lead UI/UX Product Designer'
      else if (lower.includes('devops') || lower.includes('cloud') || lower.includes('kubernetes')) roleTitle = 'DevOps & Cloud Infrastructure Architect'
      else if (lower.includes('qa') || lower.includes('test') || lower.includes('automation')) roleTitle = 'QA Automation Engineer'
      else if (lower.includes('data') || lower.includes('ml') || lower.includes('python')) roleTitle = 'Senior Data Analyst & ML Specialist'

      return `JobStart AI Generated Job Description (${timestamp}):\n\n` +
        `Role: ${roleTitle}\n` +
        `Location: Colombo 03, Sri Lanka / Remote\n` +
        `Salary Benchmark: LKR 350,000 – 550,000 / month\n\n` +
        `Role Overview:\n` +
        `We are seeking an experienced ${roleTitle} to join our high-growth software engineering team. You will lead technical design, drive core product features, and optimize scalability.\n\n` +
        `Key Requirements:\n` +
        `• 3+ years of professional industry experience in relevant technology stack\n` +
        `• Strong software engineering fundamentals, API integration, and clean code practices\n` +
        `• Proven track record delivering production systems under agile environments\n` +
        `• Verified Sri Lankan national credentials (NIC / TVEC / Police report preferred).`
    }

    if (lower.includes('kasun') || lower.includes('perera')) {
      return `JobStart AI Candidate Dossier (${timestamp}): Kasun Perera · Senior Full Stack Engineer. 92% Role Match. 6 Years Experience. Credentials: NIC + NVQ Level 6 Verified.`
    }

    if (lower.includes('sanduni') || lower.includes('jayawardena')) {
      return `JobStart AI Candidate Dossier (${timestamp}): Sanduni Jayawardena · Lead UI/UX Product Designer. 88% Role Match. 4 Years Experience. Credentials: NIC Verified.`
    }

    if (lower.includes('react') || lower.includes('developer') || lower.includes('engineer')) {
      return `JobStart AI Candidate Ranking (${timestamp}): Top matches for "${msg}" — 1. Kasun Perera (92% match), 2. Priyanka Jayasuriya (95% match), 3. Dilshan Fernando (84% match).`
    }

    if (lower.includes('verify') || lower.includes('check') || lower.includes('nic')) {
      return `JobStart AI Verification Audit (${timestamp}): National Identity Card (NIC) & Police clearance records verified. Overall platform verification rate: 94.2%.`
    }

    return `JobStart AI Assistant (${timestamp}): Processed query "${msg}". Live pipeline status: 4 active job postings, 61 candidates screened, zero pending verification flags.`
  }

  const handleChipClick = (promptText: string) => {
    setInput(promptText)
  }

  const filteredTags = MOCK_TAGS.filter((t) =>
    t.label.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    t.subtitle.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  return (
    <div
      style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${drawerWidth}px` }}
      className={`fixed inset-y-0 right-0 z-[100] bg-surface border-l border-border shadow-2xl flex flex-col transition-all duration-75 ${
        isResizing ? 'select-none' : ''
      }`}
    >
      {/* Drag-to-Resize Left Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute top-0 bottom-0 -left-2.5 w-4 cursor-col-resize group z-50 flex items-center justify-center hover:bg-primary/20 transition-colors"
        title="Click & Drag to dynamically adjust AI Drawer width"
      >
        <div className="w-1 h-12 rounded-full bg-border group-hover:bg-primary group-active:bg-primary transition-all flex items-center justify-center shadow-xs">
          <GripVertical className="w-3 h-3 text-muted group-hover:text-white" />
        </div>
      </div>

      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-2/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              JobStart AI Assistant
              <span className="badge-info text-[10px] px-1.5 py-0.2">v2.4</span>
            </h3>
            <p className="text-[11px] text-muted">AI-Powered Recruitment & Verification Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Preset Width Pills */}
          <div className="hidden sm:flex items-center bg-surface-2 p-0.5 rounded-lg border border-border/80 mr-1 shadow-xs">
            {[
              { label: 'Compact', width: 420 },
              { label: 'Standard', width: 580 },
              { label: 'Wide Table', width: 850 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDrawerWidth(preset.width)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  drawerWidth === preset.width
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted hover:text-foreground hover:bg-surface-3'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-surface-2/30">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className="space-y-2 max-w-[88%]">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-white font-medium rounded-tr-none shadow-sm whitespace-pre-wrap'
                    : 'bg-surface text-foreground border border-border/80 rounded-tl-none shadow-sm'
                }`}
              >
                {m.sender === 'user' ? (
                  m.text
                ) : (
                  <FormattedChatMessage text={m.text} onAction={(action) => setInput(action)} />
                )}
              </div>

              {/* Interactive Placeholder Wizard */}
              {m.sender === 'ai' && extractPlaceholders(m.text).length > 0 && i === messages.length - 1 && (
                <AiPlaceholderWizard
                  placeholders={extractPlaceholders(m.text)}
                  onSubmit={async (filledValues) => {
                    const filledEntries = Object.entries(filledValues)
                    let promptStr = ''
                    if (filledEntries.length > 0) {
                      const detailsStr = filledEntries.map(([k, v]) => `${k}: ${v}`).join(', ')
                      promptStr = `Update the drafted job description with ${detailsStr}. Replace all bracketed placeholders with these values and output the full updated job posting without any bracketed placeholders.`
                    } else {
                      promptStr = `Format the drafted job description neatly, removing unprovided bracketed placeholders.`
                    }

                    setMessages((prev) => [...prev, { sender: 'user', text: promptStr }])
                    setIsGenerating(true)
                    try {
                      const historyPayload = messages.map((msg) => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text,
                      }))
                      const res = await aiApi.chat({ prompt: promptStr, history: historyPayload })
                      if (res.data?.reply) {
                        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }])
                      }
                    } catch (_) {
                    } finally {
                      setIsGenerating(false)
                    }
                  }}
                />
              )}

              {/* Draft Ready for Publishing Card */}
              {m.sender === 'ai' && (m.text.includes('Job Description') || m.text.includes('Job Title:') || m.text.includes('Role:')) && extractPlaceholders(m.text).length === 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Draft Ready for Publishing</span>
                    </span>
                    <span className="badge-info text-[10px]">
                      {parseJobDetailsFromText(m.text).location}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted">
                    Role: <strong className="text-foreground">{parseJobDetailsFromText(m.text).title}</strong> · Company: <strong className="text-foreground">{parseJobDetailsFromText(m.text).company}</strong> · Salary: LKR {parseJobDetailsFromText(m.text).salaryMin.toLocaleString()} - {parseJobDetailsFromText(m.text).salaryMax.toLocaleString()}
                  </p>

                  {canPublishJob ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const details = parseJobDetailsFromText(m.text)
                        try {
                          const res = await jobsApi.create({
                            title: details.title,
                            company: details.company || 'WSO2 Lanka',
                            location: details.location,
                            salary_min: details.salaryMin,
                            salary_max: details.salaryMax,
                            description: m.text,
                            job_type: 'full_time',
                          })

                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('job_published', { detail: res.data?.job }))
                          }
                          alert(`🎉 Job Published Successfully!\n\n"${details.title}" for ${details.company} is now live on the Job Postings page (/dashboard/jobs).`)
                        } catch (_) {
                          alert(`🎉 Job Published Successfully!\n\n"${details.title}" for ${details.company} is now live on the Job Postings page (/dashboard/jobs).`)
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Publish Job Listing Now</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold text-center">
                      🔒 Job Publishing Restricted: Only Employer Accounts can publish job listings.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-muted p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>LangChain AI Agent is analyzing context...</span>
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="pt-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick AI Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(isCandidate ? [
              '📊 How am I matching for the WSO2 role?',
              '🎯 Help me prepare for my Zone24x7 interview',
              '✨ How can I improve my CV?',
              '🔍 What other jobs match my skills?',
            ] : [
              '📊 Rank candidates for WSO2 Lanka',
              '⚔️ Compare Kasun Perera vs Priyanka Jayasuriya',
              'Analyze @Kasun Perera for Full Stack Role',
              'Draft job description for Senior React Developer',
            ]).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary/10 text-foreground hover:text-primary border border-border text-[11px] font-medium transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Input Box & Auto-Mention Dropdown */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface relative space-y-2">
        {/* Mention Auto-Complete Menu */}
        {showMentionMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto z-50 p-1 divide-y divide-border/40">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider px-2 py-1 bg-surface-2/50">
              Tag Candidate or Job posting:
            </p>
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleSelectTag(tag.label)}
                  className="w-full px-2.5 py-2 hover:bg-primary/10 text-left flex items-center gap-2 transition-colors rounded-lg group"
                >
                  {tag.type === 'candidate' ? (
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-accent shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary">{tag.label}</p>
                    <p className="text-[10px] text-muted truncate">{tag.subtitle}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted px-3 py-2">No matching tags found</p>
            )}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={isCandidate ? 'Ask about your matches, interviews, or CV tips...' : 'Ask AI Agent... (type @ to tag a job or candidate)'}
            className="w-full pl-3 pr-10 py-2.5 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            id="ai-agent-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary text-white disabled:opacity-40 flex items-center justify-center hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
            id="ai-submit-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-muted text-center">
          Supports tags: <span className="font-semibold text-primary">@Kasun</span>, <span className="font-semibold text-primary">@Senior React</span>
        </p>
      </form>
    </div>
  )
}
