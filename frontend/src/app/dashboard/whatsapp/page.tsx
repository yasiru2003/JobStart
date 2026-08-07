'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageCircle,
  Send,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CalendarCheck,
  Phone,
  Briefcase,
  Building2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Settings,
  Trophy,
  HelpCircle,
  BellRing,
  FileText,
  Globe,
  ArrowRightLeft,
  Check,
  QrCode,
} from 'lucide-react'
import { wahaApi } from '@/lib/api'
import WAHASettingsCard from '@/components/modals/WAHASettingsCard'

// ── Types ─────────────────────────────────────────────────────────────────

interface Message {
  sender: 'candidate' | 'agent' | 'system'
  text: string
  time: string
}

interface Conversation {
  phone: string
  candidate_name: string
  job_title: string
  messages: Message[]
  last_intent: string | null
  language?: 'en' | 'si' | 'ta'
  application_stage?: string
  screening_stage?: string
  cv_media_url?: string
  interview_confirmed: boolean
  interview_date?: string
  interview_time?: string
}

interface AgentStatus {
  auto_reply_enabled: boolean
  total_conversations: number
  total_messages: number
  interviews_confirmed: number
  active_screenings?: number
  applications_in_progress?: number
  agent_name: string
  model: string
}

interface RankedCandidate {
  rank: number
  candidate_id: string
  name: string
  score: number
  skill_match: number
  experience_match: number
  reasoning: string
  strengths: string[]
  gaps: string[]
  recommendation: string
  engine: string
}

// ── Helpers ───────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRM:        { label: 'Confirmed',  color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  DECLINE:        { label: 'Declined',   color: 'text-rose-600',    bg: 'bg-rose-500/10 border-rose-500/20' },
  RESCHEDULE:     { label: 'Reschedule', color: 'text-amber-600',   bg: 'bg-amber-500/10 border-amber-500/20' },
  QUESTION:       { label: 'Question',   color: 'text-blue-600',    bg: 'bg-blue-500/10 border-blue-500/20' },
  BROWSE_JOBS:    { label: 'Browsing Jobs', color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  CV_SUBMITTED:   { label: 'CV Received', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/20' },
  SCREENING_ANSWER: { label: 'Screening', color: 'text-teal-600', bg: 'bg-teal-500/10 border-teal-500/20' },
  UNKNOWN:        { label: 'Pending',    color: 'text-slate-500',   bg: 'bg-slate-400/10 border-slate-400/20' },
}

const LANG_CONFIG: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  si: { label: 'සිංහල', flag: '🇱🇰' },
  ta: { label: 'தமிழ்', flag: '🇱🇰' },
}

function IntentBadge({ intent }: { intent: string | null }) {
  const cfg = INTENT_CONFIG[intent ?? 'UNKNOWN'] ?? INTENT_CONFIG.UNKNOWN
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  )
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

// ── Tabs ──────────────────────────────────────────────────────────────────

type Tab = 'conversations' | 'waha-qr' | 'send-invite' | 'screening' | 'ranking' | 'notify-match' | 'agent-settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'conversations',  label: 'Conversations',  icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'waha-qr',        label: 'WhatsApp Connection & QR', icon: <QrCode className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'send-invite',    label: 'Send Invitation', icon: <CalendarCheck className="w-3.5 h-3.5" /> },

  { id: 'screening',      label: 'WhatsApp Screening', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'ranking',        label: 'AI Ranking',     icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'notify-match',   label: 'Job Match Alert', icon: <BellRing className="w-3.5 h-3.5" /> },
  { id: 'agent-settings', label: 'Agent Settings',  icon: <Settings className="w-3.5 h-3.5" /> },
]

// ── Main Page ─────────────────────────────────────────────────────────────

export default function WhatsAppAgentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Invite form ────────────────────────────────────────────────────────
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteJob, setInviteJob] = useState('')
  const [inviteEmployer, setInviteEmployer] = useState('WSO2 Lanka (Pvt) Ltd')
  const [inviteDate, setInviteDate] = useState('')
  const [inviteTime, setInviteTime] = useState('10:00 AM')
  const [inviteMode, setInviteMode] = useState('Google Meet')
  const [inviteSending, setInviteSending] = useState(false)

  // ── Screening form ────────────────────────────────────────────────────
  const [screenPhone, setScreenPhone] = useState('')
  const [screenName, setScreenName] = useState('')
  const [screenJob, setScreenJob] = useState('Senior Full Stack Engineer')
  const [screenQ1, setScreenQ1] = useState('What experience do you have with Next.js and FastAPI?')
  const [screenQ2, setScreenQ2] = useState('What is your current notice period?')
  const [screenQ3, setScreenQ3] = useState('What are your salary expectations (LKR)?')
  const [screenSending, setScreenSending] = useState(false)

  // ── Ranking state ─────────────────────────────────────────────────────
  const [rankJobTitle, setRankJobTitle] = useState('Senior React Developer')
  const [rankJobSkills, setRankJobSkills] = useState('React, TypeScript, Next.js, Node.js, PostgreSQL')
  const [rankCandidatesList, setRankCandidatesList] = useState<RankedCandidate[]>([])
  const [rankingLoading, setRankingLoading] = useState(false)

  // ── Notify match state ────────────────────────────────────────────────
  const [notifyPhone, setNotifyPhone] = useState('')
  const [notifyName, setNotifyName] = useState('')
  const [notifyJobTitle, setNotifyJobTitle] = useState('Full Stack Software Engineer')
  const [notifyScore, setNotifyScore] = useState(94)
  const [notifySending, setNotifySending] = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [convRes, agentRes] = await Promise.all([
        wahaApi.conversations().catch(() => ({ data: [] })),
        wahaApi.agentStatus().catch(() => ({ data: null })),
      ])
      const convData = convRes.data || []
      const agentData = agentRes.data || null

      setConversations(Array.isArray(convData) ? convData : [])
      if (agentData && !agentData.detail) setAgentStatus(agentData)
    } catch {
      if (!silent) setError('Failed to load WhatsApp agent data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(() => fetchData(true), 5000)
    return () => clearInterval(t)
  }, [fetchData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv?.messages])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  // ── Send Invite ───────────────────────────────────────────────────────

  const handleSendInvite = async () => {
    if (!invitePhone || !inviteName || !inviteJob || !inviteDate) {
      setError('Please fill in all required fields')
      return
    }
    setInviteSending(true); setError(null)
    try {
      const token = JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''
      const res = await fetch('/api/v1/whatsapp/agent/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone: invitePhone,
          candidate_name: inviteName,
          job_title: inviteJob,
          employer_name: inviteEmployer,
          date: inviteDate,
          time_slot: inviteTime,
          mode: inviteMode,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Send failed')
      }
      showToast(`✅ Interview invitation sent to ${inviteName}`)
      setInvitePhone(''); setInviteName(''); setInviteJob(''); setInviteDate('')
      setActiveTab('conversations')
      fetchData()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send invitation')
    } finally { setInviteSending(false) }
  }

  // ── Start Screening ───────────────────────────────────────────────────

  const handleStartScreening = async () => {
    if (!screenPhone || !screenName) {
      setError('Please provide candidate phone and name')
      return
    }
    setScreenSending(true); setError(null)
    try {
      const token = JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''
      const questions = [screenQ1, screenQ2, screenQ3].filter(q => q.trim())
      const res = await fetch('/api/v1/whatsapp/agent/start-screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone: screenPhone,
          candidate_name: screenName,
          job_title: screenJob,
          questions,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Screening start failed')
      }
      showToast(`📝 WhatsApp screening initiated for ${screenName}`)
      setScreenPhone(''); setScreenName('')
      setActiveTab('conversations')
      fetchData()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to start screening')
    } finally { setScreenSending(false) }
  }

  // ── AI Candidate Ranking ──────────────────────────────────────────────

  const handleRunAIRanking = async () => {
    setRankingLoading(true); setError(null)
    try {
      const token = JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''
      const skillsArray = rankJobSkills.split(',').map(s => s.trim()).filter(Boolean)

      // Sample candidate pool for ranking demonstration
      const sampleCandidates = [
        { id: 'cand-1', name: 'Kasun Perera', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'PostgreSQL'], experience_years: 5, education: 'BSc Computer Science (University of Moratuwa)' },
        { id: 'cand-2', name: 'Sanduni Jayawardena', skills: ['React', 'JavaScript', 'HTML/CSS', 'Node.js'], experience_years: 3, education: 'BSc Software Engineering' },

        { id: 'cand-3', name: 'Priyanka Jayasuriya', skills: ['Vue.js', 'Python', 'FastAPI', 'Docker', 'PostgreSQL'], experience_years: 4, education: 'BSc IT (SLIIT)' },
        { id: 'cand-4', name: 'Mahesh Gunasekara', skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL'], experience_years: 6, education: 'MSc Computer Science (Colombo)' },
      ]

      const res = await fetch('/api/v1/whatsapp/agent/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          job: { id: 'job-demo', title: rankJobTitle, required_skills: skillsArray, experience_required: '3+ years' },
          candidates: sampleCandidates,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Ranking failed')
      }
      const data = await res.json()
      setRankCandidatesList(data.ranked_candidates || [])
      showToast('🏆 AI Candidate Ranking complete!')
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to run AI ranking')
    } finally { setRankingLoading(false) }
  }

  // ── Notify Job Match ──────────────────────────────────────────────────

  const handleSendMatchNotify = async () => {
    if (!notifyPhone || !notifyName) {
      setError('Please fill in candidate details')
      return
    }
    setNotifySending(true); setError(null)
    try {
      const token = JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''
      const res = await fetch('/api/v1/whatsapp/agent/notify-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone: notifyPhone,
          candidate_name: notifyName,
          matched_jobs: [{ job_title: notifyJobTitle, score: notifyScore }],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Notification failed')
      }
      showToast(`🔔 Job match notification sent to ${notifyName}`)
      setNotifyPhone(''); setNotifyName('')
      setActiveTab('conversations')
      fetchData()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send notification')
    } finally { setNotifySending(false) }
  }

  // ── Toggle agent ──────────────────────────────────────────────────────

  const handleToggleAgent = async () => {
    if (!agentStatus) return
    try {
      const token = JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''
      await fetch('/api/v1/whatsapp/agent/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !agentStatus.auto_reply_enabled }),
      })
      setAgentStatus(s => s ? { ...s, auto_reply_enabled: !s.auto_reply_enabled } : s)
      showToast(`AI Agent auto-reply ${!agentStatus.auto_reply_enabled ? 'enabled' : 'disabled'}`)
    } catch { showToast('Failed to toggle agent') }
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in relative pb-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
            </div>
            WhatsApp AI Agent System
          </h1>
          <p className="text-sm text-muted mt-1">
            Multilingual (EN / SI / TA) WhatsApp recruitment agent with AI CV screening, candidate ranking & automated interview scheduling
          </p>
        </div>

        {/* Stats */}
        {agentStatus && (
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'Conversations', value: agentStatus.total_conversations },
              { label: 'Confirmed', value: agentStatus.interviews_confirmed },
              { label: 'Active Screenings', value: agentStatus.active_screenings ?? 0 },
            ].map(s => (
              <div key={s.label} className="text-center px-3 py-2 bg-surface rounded-xl border border-border min-w-[90px]">
                <p className="text-base font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-600 text-xs">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-surface rounded-xl border border-border w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted hover:text-foreground'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Conversations ── */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]">
          {/* List */}
          <div className="lg:col-span-1 card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Active WhatsApp Threads</h3>
              <button onClick={() => fetchData()} className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 gap-3 text-center">
                  <MessageCircle className="w-10 h-10 text-muted/40" />
                  <p className="text-xs text-muted">No WhatsApp conversations yet.<br />Candidates can message your WhatsApp bot or you can send an invite.</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const langInfo = LANG_CONFIG[conv.language || 'en'] || LANG_CONFIG.en
                  return (
                    <button key={conv.phone} onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left p-4 hover:bg-surface transition-colors ${selectedConv?.phone === conv.phone ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 font-bold flex items-center justify-center text-sm shrink-0">
                            {conv.candidate_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-foreground truncate">{conv.candidate_name}</p>
                              <span className="text-[10px]" title={langInfo.label}>{langInfo.flag}</span>
                            </div>
                            <p className="text-[11px] text-muted truncate">{conv.job_title || conv.phone}</p>
                            {conv.cv_media_url && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 font-medium">
                                <FileText className="w-2.5 h-2.5" /> CV Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <IntentBadge intent={conv.last_intent} />
                          {conv.interview_confirmed && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 card flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 font-bold flex items-center justify-center">
                      {selectedConv.candidate_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{selectedConv.candidate_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted">
                          {LANG_CONFIG[selectedConv.language || 'en']?.flag} {LANG_CONFIG[selectedConv.language || 'en']?.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" /> {selectedConv.phone}
                        {selectedConv.job_title && <> · <Briefcase className="w-3 h-3" /> {selectedConv.job_title}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IntentBadge intent={selectedConv.last_intent} />
                    {selectedConv.interview_confirmed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-2/20">
                  {selectedConv.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted">No messages in this thread</div>
                  ) : (
                    selectedConv.messages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 max-w-[80%] ${msg.sender === 'candidate' ? '' : 'ml-auto flex-row-reverse'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          msg.sender === 'candidate' ? 'bg-surface border border-border text-foreground' : 'bg-emerald-600 text-white'
                        }`}>
                          {msg.sender === 'candidate' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'candidate'
                            ? 'bg-surface border border-border text-foreground rounded-tl-none'
                            : 'bg-emerald-600 text-white rounded-tr-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right opacity-70`}>{formatTime(msg.time)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-emerald-500/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Select a WhatsApp thread</p>
                  <p className="text-xs text-muted mt-1">Click a candidate from the list to view their live conversation & submitted documents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: WAHA Connection & QR ── */}
      {activeTab === 'waha-qr' && (
        <div className="max-w-4xl animate-fade-in">
          <WAHASettingsCard onToast={showToast} />
        </div>
      )}

      {/* ── Tab: Send Invitation ── */}
      {activeTab === 'send-invite' && (
        <div className="max-w-2xl">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="w-4.5 h-4.5 text-primary" />
                Send WhatsApp Interview Invitation
              </h3>
              <p className="text-xs text-muted mt-1">
                Sends a structured invitation directly to the candidate's WhatsApp. The AI agent will auto-reply and track whether they confirm or reschedule.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Candidate Phone *
                  </label>
                  <input value={invitePhone} onChange={e => setInvitePhone(e.target.value)}
                    placeholder="94771234567" type="tel"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <User className="w-3 h-3" /> Candidate Name *
                  </label>
                  <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                    placeholder="Kasun Perera"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Job Title *
                  </label>
                  <input value={inviteJob} onChange={e => setInviteJob(e.target.value)}
                    placeholder="Senior React Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Employer Name
                  </label>
                  <input value={inviteEmployer} onChange={e => setInviteEmployer(e.target.value)}
                    placeholder="WSO2 Lanka"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3" /> Interview Date *
                  </label>
                  <input value={inviteDate} onChange={e => setInviteDate(e.target.value)} type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Slot
                  </label>
                  <select value={inviteTime} onChange={e => setInviteTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                    {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleSendInvite} disabled={inviteSending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]">
                {inviteSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {inviteSending ? 'Sending via WhatsApp…' : 'Send Interview Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Screening ── */}
      {activeTab === 'screening' && (
        <div className="max-w-2xl">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-teal-600" />
                Start WhatsApp Candidate Screening Flow
              </h3>
              <p className="text-xs text-muted mt-1">
                The agent will message questions one by one to the candidate via WhatsApp and record their answers automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Candidate Phone *</label>
                  <input value={screenPhone} onChange={e => setScreenPhone(e.target.value)} placeholder="94771234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Candidate Name *</label>
                  <input value={screenName} onChange={e => setScreenName(e.target.value)} placeholder="Kasun Perera"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-foreground">Screening Questions (Asked Sequentially)</p>
                <div className="space-y-2">
                  <input value={screenQ1} onChange={e => setScreenQ1(e.target.value)} placeholder="Question 1"
                    className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <input value={screenQ2} onChange={e => setScreenQ2(e.target.value)} placeholder="Question 2"
                    className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <input value={screenQ3} onChange={e => setScreenQ3(e.target.value)} placeholder="Question 3"
                    className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>

              <button onClick={handleStartScreening} disabled={screenSending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all">
                {screenSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {screenSending ? 'Initiating Screening…' : 'Start WhatsApp Screening'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: AI Ranking ── */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-500" />
                  AI Candidate Ranking & Evaluation
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  LLM-powered candidate match scoring against job requirements with detailed strengths & gaps analysis
                </p>
              </div>
              <button onClick={handleRunAIRanking} disabled={rankingLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all">
                {rankingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {rankingLoading ? 'Evaluating via AI…' : 'Run AI Ranking'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Job Title</label>
                <input value={rankJobTitle} onChange={e => setRankJobTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted">Required Skills (Comma separated)</label>
                <input value={rankJobSkills} onChange={e => setRankJobSkills(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground" />
              </div>
            </div>
          </div>

          {/* Results list */}
          {rankCandidatesList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Ranked Candidate Leaderboard</h4>
              <div className="grid grid-cols-1 gap-3">
                {rankCandidatesList.map(cand => (
                  <div key={cand.candidate_id} className="card p-4 space-y-3 border-l-4 border-amber-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 font-black text-sm flex items-center justify-center">
                          #{cand.rank}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{cand.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            {cand.recommendation}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-amber-500">{cand.score}%</span>
                        <p className="text-[10px] text-muted">Composite Fit Score</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">{cand.reasoning}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Key Strengths</p>
                        <ul className="list-disc list-inside text-muted text-[11px] space-y-0.5">
                          {cand.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                        <p className="text-[10px] font-bold text-rose-500 uppercase">Gaps / Risk</p>
                        <ul className="list-disc list-inside text-muted text-[11px] space-y-0.5">
                          {cand.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Job Match Alert ── */}
      {activeTab === 'notify-match' && (
        <div className="max-w-2xl">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BellRing className="w-4.5 h-4.5 text-indigo-500" />
                Send Proactive Job Match WhatsApp Alert
              </h3>
              <p className="text-xs text-muted mt-1">
                Notify a candidate about a job that matches their qualifications right on WhatsApp so they can apply immediately.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Candidate Phone *</label>
                  <input value={notifyPhone} onChange={e => setNotifyPhone(e.target.value)} placeholder="94771234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Candidate Name *</label>
                  <input value={notifyName} onChange={e => setNotifyName(e.target.value)} placeholder="Kasun Perera"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Matching Job Title</label>
                  <input value={notifyJobTitle} onChange={e => setNotifyJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Match Percentage Score</label>
                  <input type="number" value={notifyScore} onChange={e => setNotifyScore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                </div>
              </div>

              <button onClick={handleSendMatchNotify} disabled={notifySending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all">
                {notifySending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {notifySending ? 'Sending Alert…' : 'Send WhatsApp Job Match Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Agent Settings ── */}
      {activeTab === 'agent-settings' && (
        <div className="max-w-2xl space-y-4">
          <div className="card p-6 space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-primary" />
              WhatsApp AI Agent Configuration
            </h3>

            {agentStatus ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                  <div>
                    <p className="text-sm font-bold text-foreground">Auto-Reply Mode</p>
                    <p className="text-xs text-muted mt-0.5">
                      Automatically process job browsing, applications, screening Q&A & interview responses
                    </p>
                  </div>
                  <button onClick={handleToggleAgent} className="flex items-center gap-2">
                    {agentStatus.auto_reply_enabled
                      ? <ToggleRight className="w-9 h-9 text-emerald-500" />
                      : <ToggleLeft className="w-9 h-9 text-muted" />
                    }
                    <span className={`text-xs font-bold ${agentStatus.auto_reply_enabled ? 'text-emerald-600' : 'text-muted'}`}>
                      {agentStatus.auto_reply_enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <p className="text-xs font-bold text-foreground">Agent Configuration</p>
                  <div className="space-y-1.5 text-xs text-muted">
                    <div className="flex justify-between"><span>Agent Name</span><span className="font-medium text-foreground">{agentStatus.agent_name}</span></div>
                    <div className="flex justify-between"><span>AI Engine</span><span className="font-medium text-foreground">{agentStatus.model}</span></div>
                    <div className="flex justify-between"><span>Languages Supported</span><span className="font-medium text-foreground">English, Sinhala (සිංහල), Tamil (தமிழ்)</span></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Agent status unavailable — verify backend server connection.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

