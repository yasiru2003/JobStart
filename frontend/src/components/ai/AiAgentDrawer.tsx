'use client'

import { useState } from 'react'
import { Sparkles, Send, X, Bot, RefreshCw } from 'lucide-react'

interface AiAgentDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function AiAgentDrawer({ isOpen, onClose }: AiAgentDrawerProps) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your JobStart AI Recruitment Assistant. You can ask me to draft job postings, screen candidate CVs, or summarize candidate verification documents.',
    },
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMsg = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setInput('')
    setIsGenerating(true)

    setTimeout(() => {
      let aiReply = 'I have analyzed the request. Here is the recommended screening summary for Kasun Perera: NIC and NVQ Level 6 verified against national registries.'
      if (userMsg.toLowerCase().includes('job') || userMsg.toLowerCase().includes('draft')) {
        aiReply = 'Drafted Job Posting: Senior Full Stack Engineer (Colombo / Remote). Required Skills: Next.js, Node.js, PostgreSQL, Docker.'
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }])
      setIsGenerating(false)
    }, 1200)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[420px] bg-white dark:bg-[#1e293b] border-l border-border shadow-2xl flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-[#0f172a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              JobStart AI Assistant
              <span className="badge-info text-[10px] px-1.5 py-0.2">v2.4</span>
            </h3>
            <p className="text-[11px] text-muted">AI-Powered Recruitment & Verification Agent</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/60 dark:bg-[#0f172a]/60">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#0F766E] text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-muted p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>AI Agent is drafting response...</span>
          </div>
        )}
      </div>

      {/* Form Input Box & Submit Button */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-white dark:bg-[#1e293b] space-y-2">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI Agent... (type @ to tag a job or candidate)"
            className="w-full pl-3 pr-10 py-2.5 bg-slate-100 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#0F766E] text-white disabled:opacity-40 flex items-center justify-center hover:bg-[#0d9488] transition-colors shadow-sm"
            id="ai-submit-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-muted text-center">
          Supports tags: <span className="font-semibold text-teal-700 dark:text-teal-400">@Kasun</span>, <span className="font-semibold text-teal-700 dark:text-teal-400">@Next.js Developer</span>
        </p>
      </form>
    </div>
  )
}
