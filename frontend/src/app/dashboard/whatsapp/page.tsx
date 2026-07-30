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
} from 'lucide-react'
import { wahaApi } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────

interface Message {
  sender: 'candidate' | 'agent'
  text: string
  time: string
}

interface Conversation {
  phone: string
  candidate_name: string
  job_title: string
  messages: Message[]
  last_intent: string | null
  interview_confirmed: boolean
  interview_date?: string
  interview_time?: string
}

interface AgentStatus {
  auto_reply_enabled: boolean
  total_conversations: number
  total_messages: number
  interviews_confirmed: number
  agent_name: string
  model: string
}

// ── Helpers ───────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRM:    { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  DECLINE:    { label: 'Declined',  color: 'text-rose-600',    bg: 'bg-rose-500/10 border-rose-500/20' },
  RESCHEDULE: { label: 'Reschedule',color: 'text-amber-600',   bg: 'bg-amber-500/10 border-amber-500/20' },
  QUESTION:   { label: 'Question',  color: 'text-blue-600',    bg: 'bg-blue-500/10 border-blue-500/20' },
  UNKNOWN:    { label: 'Pending',   color: 'text-slate-500',   bg: 'bg-slate-400/10 border-slate-400/20' },
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

type Tab = 'conversations' | 'send-invite' | 'agent-settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'conversations',  label: 'Conversations',  icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'send-invite',    label: 'Send Invitation', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
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
  const [inviteSent, setInviteSent] = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [convRes, agentRes] = await Promise.all([
        wahaApi.status().then(() => wahaApi.updateConfig('', '', undefined).catch(() => null)),
        wahaApi.status(),
      ])
      // Fetch actual conversations and agent status
      const [convData, agentData] = await Promise.all([
        fetch('/api/v1/whatsapp/agent/conversations', {
          headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''}` }
        }).then(r => r.json()).catch(() => []),
        fetch('/api/v1/whatsapp/agent/status', {
          headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('jobstart-auth-v2') || '{}')?.state?.token || ''}` }
        }).then(r => r.json()).catch(() => null),
      ])
      setConversations(Array.isArray(convData) ? convData : [])
      if (agentData && !agentData.detail) setAgentStatus(agentData)
    } catch {
      if (!silent) setError('Failed to load WhatsApp data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Poll conversations every 5s
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
      setInviteSent(true)
      showToast(`✅ Interview invitation sent to ${inviteName}`)
      setInvitePhone(''); setInviteName(''); setInviteJob(''); setInviteDate('')
      setTimeout(() => { setInviteSent(false); setActiveTab('conversations') }, 2000)
      fetchData()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send invitation')
    } finally { setInviteSending(false) }
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
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl animate-fade-in">
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
            WhatsApp AI Agent
          </h1>
          <p className="text-sm text-muted mt-1">
            AI-powered WhatsApp automation for interview invitations & candidate communications
          </p>
        </div>

        {/* Stats */}
        {agentStatus && (
          <div className="flex gap-3">
            {[
              { label: 'Conversations', value: agentStatus.total_conversations },
              { label: 'Messages', value: agentStatus.total_messages },
              { label: 'Confirmed', value: agentStatus.interviews_confirmed },
            ].map(s => (
              <div key={s.label} className="text-center px-3 py-2 bg-surface rounded-xl border border-border">
                <p className="text-lg font-black text-foreground">{s.value}</p>
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
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
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
              <h3 className="text-sm font-bold text-foreground">Active Conversations</h3>
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
                  <p className="text-xs text-muted">No conversations yet.<br />Send an interview invitation to start.</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.phone} onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 hover:bg-surface transition-colors ${selectedConv?.phone === conv.phone ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                          {conv.candidate_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{conv.candidate_name}</p>
                          <p className="text-[11px] text-muted truncate">{conv.job_title || conv.phone}</p>
                          {conv.messages.length > 0 && (
                            <p className="text-[11px] text-muted/70 truncate mt-0.5">
                              {conv.messages[conv.messages.length - 1]?.text?.slice(0, 40)}…
                            </p>
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
                ))
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
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {selectedConv.candidate_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedConv.candidate_name}</p>
                      <p className="text-[11px] text-muted flex items-center gap-1">
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
                    <div className="flex items-center justify-center h-full text-xs text-muted">No messages yet</div>
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
                  <p className="text-sm font-bold text-foreground">Select a conversation</p>
                  <p className="text-xs text-muted mt-1">Click a candidate from the list to view their WhatsApp thread</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Send Invitation ── */}
      {activeTab === 'send-invite' && (
        <div className="max-w-2xl">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="w-4.5 h-4.5 text-primary" />
                Send Interview Invitation via WhatsApp
              </h3>
              <p className="text-xs text-muted mt-1">
                The AI agent will send a structured interview invite and automatically handle the candidate's reply (YES/NO/Reschedule).
              </p>
            </div>

            {inviteSent ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-emerald-600">Invitation Sent Successfully!</p>
                <p className="text-xs text-muted">Redirecting to conversations…</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number *
                    </label>
                    <input value={invitePhone} onChange={e => setInvitePhone(e.target.value)}
                      placeholder="94771234567" type="tel"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                  </div>
                  {/* Candidate Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted flex items-center gap-1">
                      <User className="w-3 h-3" /> Candidate Name *
                    </label>
                    <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                      placeholder="Kasun Perera"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                  </div>
                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Job Title *
                    </label>
                    <input value={inviteJob} onChange={e => setInviteJob(e.target.value)}
                      placeholder="Senior React Developer"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                  </div>
                  {/* Employer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Employer Name
                    </label>
                    <input value={inviteEmployer} onChange={e => setInviteEmployer(e.target.value)}
                      placeholder="WSO2 Lanka"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                  </div>
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" /> Interview Date *
                    </label>
                    <input value={inviteDate} onChange={e => setInviteDate(e.target.value)} type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                  </div>
                  {/* Time */}
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
                  {/* Mode */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-muted">Interview Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {['Google Meet', 'Microsoft Teams', 'Onsite', 'Phone Call', 'Zoom'].map(mode => (
                        <button key={mode} type="button" onClick={() => setInviteMode(mode)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            inviteMode === mode
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface border-border text-muted hover:text-foreground hover:border-primary/30'
                          }`}>
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {inviteName && inviteJob && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />Message Preview
                    </p>
                    <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
{`👋 Hello *${inviteName}*,

Congratulations! You have been shortlisted for an interview with *${inviteEmployer}* for the position of *${inviteJob}*.

📅 Date: ${inviteDate || '[date]'}
⏰ Time: ${inviteTime}
📍 Mode: ${inviteMode}

Please reply:
✅ *YES* — to confirm
❌ *NO* — to reschedule`}
                    </p>
                  </div>
                )}

                <button onClick={handleSendInvite} disabled={inviteSending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]">
                  {inviteSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {inviteSending ? 'Sending via WhatsApp…' : 'Send Interview Invitation via WhatsApp'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Agent Settings ── */}
      {activeTab === 'agent-settings' && (
        <div className="max-w-2xl space-y-4">
          {/* Status card */}
          <div className="card p-6 space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-primary" />
              WhatsApp AI Agent Configuration
            </h3>

            {agentStatus ? (
              <>
                {/* Auto-reply toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                  <div>
                    <p className="text-sm font-bold text-foreground">Auto-Reply Mode</p>
                    <p className="text-xs text-muted mt-0.5">
                      Automatically reply to candidate messages (YES/NO/Reschedule/Questions)
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Conversations', value: agentStatus.total_conversations, color: 'text-primary' },
                    { label: 'Total Messages', value: agentStatus.total_messages, color: 'text-blue-500' },
                    { label: 'Confirmed', value: agentStatus.interviews_confirmed, color: 'text-emerald-500' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-surface border border-border text-center">
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Model info */}
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <p className="text-xs font-bold text-foreground">Agent Configuration</p>
                  <div className="space-y-1.5 text-xs text-muted">
                    <div className="flex justify-between"><span>Agent Name</span><span className="font-medium text-foreground">{agentStatus.agent_name}</span></div>
                    <div className="flex justify-between"><span>AI Model</span><span className="font-medium text-foreground">{agentStatus.model}</span></div>
                    <div className="flex justify-between"><span>Auto-Reply</span>
                      <span className={`font-bold ${agentStatus.auto_reply_enabled ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {agentStatus.auto_reply_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Agent status unavailable — make sure the backend is running and WAHA is configured.</span>
              </div>
            )}
          </div>

          {/* Intent guide */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Auto-Reply Intent Guide
            </h3>
            <div className="space-y-3">
              {[
                { intent: 'CONFIRM', desc: 'Candidate replies YES / OK / Confirm → agent confirms interview & gives details', example: '"Yes I confirm"' },
                { intent: 'DECLINE', desc: 'Candidate replies NO / Can\'t → agent offers to reschedule', example: '"No I can\'t make it"' },
                { intent: 'RESCHEDULE', desc: 'Candidate asks to change time → agent requests preferred date', example: '"Can we reschedule?"' },
                { intent: 'QUESTION', desc: 'Candidate asks a question → LLM generates contextual answer', example: '"Is the interview remote?"' },
              ].map(r => (
                <div key={r.intent} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                  <IntentBadge intent={r.intent} />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{r.desc}</p>
                    <p className="text-[11px] text-muted mt-0.5 italic">{r.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook setup */}
          <div className="card p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">WAHA Webhook Setup</h3>
            <p className="text-xs text-muted leading-relaxed">
              To enable inbound message auto-reply, configure this webhook URL in your WAHA dashboard:
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border">
              <code className="text-xs text-primary flex-1 font-mono break-all">
                POST http://&lt;your-backend&gt;/api/v1/whatsapp/webhook
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText('http://your-backend:8000/api/v1/whatsapp/webhook'); showToast('Copied!') }}
                className="text-[11px] text-primary hover:underline font-semibold shrink-0"
              >
                Copy
              </button>
            </div>
            <p className="text-[11px] text-muted">
              Go to WAHA Dashboard → Sessions → {'{'}session{'}'} → Webhooks → Add this URL for <code>message</code> events.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
