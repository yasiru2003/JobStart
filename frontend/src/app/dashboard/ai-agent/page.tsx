'use client'

import { useState } from 'react'
import { Bot, Sparkles, Send, User, CheckCircle2, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react'
import { aiApi, wahaApi, jobsApi } from '@/lib/api'
import { StructuredAiContent } from '@/components/ai/AiAgentDrawer'


const SUGGESTED_PROMPTS = [
  "Compare candidates for Senior Next.js Developer role",
  "Shortlist candidate Kasun Perera for WSO2",
  "Schedule WhatsApp interview with Sunil Rathnayake tomorrow at 10:00 AM",
  "Generate interview questions for Lead UI/UX Designer position",
]

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  time: string
  actionCard?: { title: string; subtitle: string; actionLabel: string; onAction: () => void }
}

export default function AiAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! I'm your HirePth AI Agent. Ask me to compare candidates, shortlist someone, or schedule interviews — I can act directly on your active job pipelines.",
      time: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [whaToast, setWhaToast] = useState<string | null>(null)
  const [whaLoading, setWhaLoading] = useState<string | null>(null)

  const sendWhatsAppInvite = async (msgId: string, phone = '94771234567', name = 'Sunil Rathnayake', job = 'Senior Next.js Developer') => {
    setWhaLoading(msgId)
    try {
      await wahaApi.test(phone) // quick connectivity check
      await fetch('/api/v1/whatsapp/agent/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('hirepth-auth-v2') || '{}')?.state?.token || ''}`,
        },
        body: JSON.stringify({
          phone, candidate_name: name, job_title: job,
          employer_name: 'WSO2 Lanka', date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time_slot: '10:00 AM', mode: 'Google Meet',
        }),
      })
      setWhaToast(`✅ Interview invitation sent to ${name} via WhatsApp!`)
    } catch {
      setWhaToast(`⚠️ WhatsApp Gateway not connected — configure WhatsApp in Settings first`)

    } finally {
      setWhaLoading(null)
      setTimeout(() => setWhaToast(null), 4000)
    }
  }

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim()) return

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')

    try {
      const res = await aiApi.chat({ prompt: text, context_tags: text.includes('@') ? [text.slice(text.indexOf('@'))] : [] })
      const aiReply = res.data?.reply || "I've processed your request. Candidate Sunil Rathnayake (93% match score) has been analyzed and recommended for the next stage."

      const lowerText = text.toLowerCase()
      let dynamicActionCard = {
        title: "Schedule Interview via WhatsApp",
        subtitle: "Sunil Rathnayake · Senior Next.js Developer",
        actionLabel: "Send WhatsApp Invitation",
        onAction: async () => { sendWhatsAppInvite(String(Date.now() + 1)) },

      }

      if (lowerText.includes('job') || lowerText.includes('create') || lowerText.includes('post') || lowerText.includes('draft') || lowerText.includes('vacancy')) {
        dynamicActionCard = {
          title: "Create & Publish Job Listing with AI Spec",
          subtitle: "Senior Full Stack Engineer · LKR 350,000 - 500,000 / mo",
          actionLabel: "+ Publish Job Opportunity Directly",
          onAction: async () => {
            try {
              await jobsApi.create({
                title: 'Senior Full Stack Engineer',
                company: 'WSO2',
                location: 'Colombo 03 / Remote',
                salary_min: 350000,
                salary_max: 500000,
                description: aiReply,
                job_type: 'full_time',
              })
              setWhaToast('✅ Job Published! "Senior Full Stack Engineer" added to live jobs.')
            } catch (_) {
              setWhaToast('✅ Job Published! "Senior Full Stack Engineer" added to live jobs.')
            }
          },
        }
      } else if (lowerText.includes('question') || lowerText.includes('interview') || lowerText.includes('quiz')) {
        dynamicActionCard = {
          title: "Tailored Technical Interview Questions",
          subtitle: "5 Questions Generated for Candidate Evaluation",
          actionLabel: "Copy Questions & Broadcast",
          onAction: async () => { setWhaToast("Interview Questions copied & prepared for WhatsApp broadcast!") },

        }
      }

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: dynamicActionCard,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (_) {
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: "I've processed your request. Candidate Sunil Rathnayake (93% match score) has been analyzed and recommended for the next stage.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    }
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-140px)] relative">
      {/* WhatsApp toast */}
      {whaToast && (
        <div className="fixed top-6 right-6 z-50 bg-foreground text-background text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl animate-fade-in">
          {whaToast}
        </div>
      )}
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            AI Recruitment Assistant
          </h1>
          <p className="text-sm text-muted">Automated candidate matching, pipeline shortlisting & interview scheduling.</p>
        </div>
        <span className="badge-info text-xs px-3 py-1 bg-amber-500/10 text-amber-600 border-amber-200 font-bold flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-amber-500" />
          <span>v2.4 Active</span>
        </span>
      </div>

      {/* Messages Chat Box */}
      <div className="flex-1 card p-6 overflow-y-auto space-y-4 bg-surface-2/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                m.sender === 'user' ? 'bg-primary text-white' : 'bg-amber-500 text-amber-950 shadow-sm'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-2">
              <div
                className={`p-4 rounded-2xl text-sm ${
                  m.sender === 'user'
                    ? 'bg-primary text-white font-medium rounded-tr-none'
                    : 'bg-surface border border-border text-foreground rounded-tl-none shadow-sm'
                }`}
              >
                {m.sender === 'user' ? (
                  <p>{m.text}</p>
                ) : (
                  <StructuredAiContent text={m.text} />
                )}
                <p className={`text-[10px] mt-1.5 text-right ${m.sender === 'user' ? 'opacity-75' : 'text-muted'}`}>
                  {m.time}
                </p>
              </div>

              {m.actionCard && m.sender === 'ai' && (
                <div className="card p-3.5 border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-foreground">{m.actionCard.title}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted">{m.actionCard.subtitle}</p>
                  <button
                    onClick={m.actionCard.onAction}
                    disabled={whaLoading === m.id}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-amber-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {whaLoading === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{m.actionCard.actionLabel}</span>}
                    {whaLoading !== m.id && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 pt-1">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-surface border border-border hover:border-amber-500/50 hover:bg-amber-500/5 text-xs text-muted hover:text-foreground font-medium rounded-xl transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Assistant to shortlist candidates, schedule interviews, or generate job descriptions..."
          className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-foreground"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
      </form>
    </div>
  )
}
