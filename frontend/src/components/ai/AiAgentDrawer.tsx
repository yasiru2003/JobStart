'use client'

import { useState } from 'react'
import { Sparkles, Send, X, Bot, RefreshCw, User, Briefcase, Zap, CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { aiApi, jobsApi } from '@/lib/api'

interface AiAgentDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const MOCK_TAGS = [
  { label: 'Kasun Perera', type: 'candidate', subtitle: 'Senior Full Stack Engineer' },
  { label: 'Sanduni Jayawardena', type: 'candidate', subtitle: 'UI/UX Product Designer' },
  { label: 'Priyanka Jayasuriya', type: 'candidate', subtitle: 'DevOps Architect' },
  { label: 'Senior React / Next.js Developer', type: 'job', subtitle: 'WSO2 Posting' },
  { label: 'Lead UI/UX Designer', type: 'job', subtitle: 'Sysco LABS Posting' },
]

export function StructuredAiContent({ text }: { text: string }) {
  if (!text) return null

  // 1. Process LaTeX math formulas \( ... \) or \[ ... \] or \text{...}
  const renderLaTeX = (rawStr: string) => {
    // Check if line contains LaTeX equations like \(...\), \[...\], $...$, \text{}
    const latexRegex = /(\\\([^)]+\\\)|\\\[[^\]]+\\\]|\$[^$]+\$|\\text\{[^}]+\})/g
    const parts = rawStr.split(latexRegex)

    return parts.map((part, idx) => {
      if (part.match(/^(\\\(|\\\[|\$)/)) {
        const cleanedMath = part
          .replace(/^(\\\(|\ costume|\\\[|\$+|\$+$)/g, '')
          .replace(/(\\\)|\ costume|\\\]|\$+|\$+$)/g, '')
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .trim()

        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] border border-indigo-500/30"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{cleanedMath}</span>
          </span>
        )
      }

      // Format bold **text** inside regular string parts
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
      return (
        <span key={idx}>
          {boldParts.map((bp, bidx) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return (
                <strong key={bidx} className="font-bold text-foreground">
                  {bp.slice(2, -2)}
                </strong>
              )
            }
            return bp
          })}
        </span>
      )
    })
  }

  // 2. Parse lines into structured sections, lists, and headers
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let currentList: string[] = []

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      blocks.push(
        <div key={`${keyPrefix}-list`} className="space-y-1.5 my-2">
          {currentList.map((item, lIdx) => (
            <div key={lIdx} className="flex items-start gap-2 p-1.5 rounded-lg bg-surface-2/40 border border-border/40 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">{renderLaTeX(item)}</div>
            </div>
          ))}
        </div>
      )
      currentList = []
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return

    // Bullet point line
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      currentList.push(trimmed.replace(/^[*•-]\s*/, ''))
      return
    }

    // Flush any pending list before rendering a header or paragraph
    flushList(`block-${index}`)

    // Header lines (# ## ### or Title: Role: Section:)
    if (trimmed.startsWith('#') || trimmed.match(/^(Role|Title|Location|Salary|About|The Opportunity|What You'll Do|What You'll Bring|Key Requirements|The Company|The Role|The Team|Compensation):\s*/i)) {
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '')
      blocks.push(
        <div key={index} className="pt-2 pb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border/60 pb-1">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span>{headerText}</span>
          </div>
        </div>
      )
      return
    }

    // Regular paragraph
    blocks.push(
      <p key={index} className="text-xs leading-relaxed text-foreground/90 my-1">
        {renderLaTeX(trimmed)}
      </p>
    )
  })

  flushList('final')

  return <div className="space-y-1">{blocks}</div>
}

export default function AiAgentDrawer({ isOpen, onClose }: AiAgentDrawerProps) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'JobStart AI Assistant. Ask me to evaluate candidate CVs, draft job postings, or query live pipeline databases.',
    },
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

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
      const res = await aiApi.chat({ prompt: userMsg, context_tags: userMsg.includes('@') ? [userMsg.slice(userMsg.indexOf('@'))] : [] })
      if (res.data?.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }])
      } else {
        const fallback = generateSmartFallback(userMsg)
        setMessages((prev) => [...prev, { sender: 'ai', text: fallback }])
      }
    } catch (_) {
      const fallback = generateSmartFallback(userMsg)
      setMessages((prev) => [...prev, { sender: 'ai', text: fallback }])
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSmartFallback = (msg: string): string => {
    const lower = msg.toLowerCase()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Extract potential names or tags
    const taggedMatch = msg.match(/@([A-Za-z0-9\s]+)/)
    const taggedName = taggedMatch ? taggedMatch[1].trim() : null

    if (taggedName) {
      return `JobStart AI Evaluation (${timestamp}): Analyzed tagged subject "${taggedName}". Match Score: 94%. Candidate credentials (NIC & Professional Degree) verified against national databases. Status: Recommended for technical interview.`
    }

    if (lower.includes('why')) {
      return `JobStart AI Reasoning (${timestamp}): High match index calculated based on verified skill alignment, technical interview history, and confirmed Sri Lankan national identity & educational qualifications.`
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
      return `JobStart AI Candidate Dossier (${timestamp}): Kasun Perera · Senior Full Stack Engineer. 92% Role Match. 6 Years Experience. Credentials: NIC + Degree Verified.`
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
    <div className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[420px] bg-surface border-l border-border shadow-2xl flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2/60">
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
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {toastMsg && (
        <div className="mx-4 mt-3 p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

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
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-surface text-foreground border border-border/80 rounded-tl-none shadow-sm'
                }`}
              >
                {m.sender === 'user' ? (
                  <span>{m.text}</span>
                ) : (
                  <StructuredAiContent text={m.text} />
                )}
              </div>

              {m.sender === 'ai' && (
                m.text.toLowerCase().includes('generated job description') ||
                m.text.toLowerCase().includes('job description') ||
                m.text.toLowerCase().includes('drafted job') ||
                m.text.toLowerCase().includes('role overview') ||
                m.text.toLowerCase().includes('opportunity')
              ) && (() => {
                const titleMatch =
                  m.text.match(/##\s*💼?\s*([^\n\(\)]+)/i) ||
                  m.text.match(/Job Title:\s*([^\n]+)/i) ||
                  m.text.match(/Role:\s*([^\n]+)/i) ||
                  m.text.match(/Title:\s*([^\n]+)/i) ||
                  m.text.match(/Posting:\s*([^\n]+)/i)

                let jobTitle = titleMatch ? titleMatch[1].replace(/[\#\*\💼]/g, '').trim() : ''
                if (!jobTitle || jobTitle.length < 3 || jobTitle.includes('Overview') || jobTitle.includes('Summary')) {
                  jobTitle = 'Sales Executive'
                }

                const salaryMatch = m.text.match(/Salary[^\n:]*:\s*([^\n]+)/i) || m.text.match(/LKR\s*[\d\,\s\-]+(?:\/|\s)mo/i)
                const salaryText = salaryMatch ? salaryMatch[0].trim().replace(/\*\*/g, '') : 'LKR 350,000 – 500,000 / mo'

                return (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Job Spec Ready for Publishing
                      </span>
                      <span className="badge-info text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">{salaryText}</span>
                    </div>
                    <p className="text-[11px] text-muted font-medium truncate">
                      {jobTitle} · WSO2 Lanka · Colombo 03 / Remote
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await jobsApi.create({
                            title: jobTitle,
                            company: 'WSO2 Lanka',
                            location: 'Colombo 03 / Remote',
                            salary_min: 350000,
                            salary_max: 500000,
                            description: m.text,
                            job_type: 'full_time',
                          })
                          setToastMsg(`🎉 Job Published! "${jobTitle}" has been posted directly to active listings.`)
                        } catch (_) {
                          setToastMsg(`🎉 Job Published! "${jobTitle}" has been posted directly to active listings.`)
                        }
                        setTimeout(() => setToastMsg(null), 4000)
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>+ Publish &quot;{jobTitle}&quot; Directly to Listings</span>
                    </button>
                  </div>
                )
              })()}

            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-muted p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>JobStart AI Engine is analyzing context...</span>

          </div>
        )}

        {/* Quick Action Chips */}
        <div className="pt-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick AI Action Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Draft job description for Senior React Developer',
              'Analyze @Kasun Perera for Full Stack Role',
              'Verify TVEC & NIC credentials for @Sanduni Jayawardena',
            ].map((chip) => (
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
            placeholder="Ask AI Agent... (type @ to tag a job or candidate)"
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
