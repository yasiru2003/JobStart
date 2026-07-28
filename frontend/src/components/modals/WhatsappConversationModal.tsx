'use client'

import { useState } from 'react'
import { X, MessageSquare, CheckCircle2, ShieldCheck, Phone, Bot } from 'lucide-react'

interface WhatsappConversationModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName?: string
  phone?: string
  jobTitle?: string
}

export default function WhatsappConversationModal({
  isOpen,
  onClose,
  candidateName = 'Kasun Perera',
  phone = '+94 77 123 4567',
  jobTitle = 'Senior React / Next.js Developer',
}: WhatsappConversationModalProps) {
  const [tab, setTab] = useState<'chat' | 'screening'>('chat')

  if (!isOpen) return null

  const CHAT_MESSAGES = [
    { sender: 'bot', text: `👋 Hello ${candidateName}! JobStart AI Agent here. We noticed your application for ${jobTitle}. Could you confirm your availability?`, time: '10:00 AM' },
    { sender: 'candidate', text: 'Hi! Yes I am available full time in Colombo.', time: '10:02 AM' },
    { sender: 'bot', text: 'Great! Do you hold a valid NVQ Level 3 or equivalent technical certification?', time: '10:03 AM' },
    { sender: 'candidate', text: 'Yes, I have NVQ Level 3 with 3 years of work experience.', time: '10:05 AM' },
    { sender: 'bot', text: 'Awesome. Your application has been verified & forwarded to the employer hiring pipeline!', time: '10:06 AM' },
  ]

  const SCREENING_ANSWERS = [
    { question: '1. Are you available for full-time work in Sri Lanka?', answer: 'Yes, available immediately for full-time position in Western Province.', status: 'Verified' },
    { question: '2. Do you hold NVQ Level 3 or higher certification?', answer: 'Yes, NVQ Level 3 Certificate verified on JobStart.', status: 'Verified' },
    { question: '3. What is your expected monthly salary range?', answer: 'LKR 350,000 - 450,000 / month.', status: 'Matched' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div
        className="bg-surface w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between border-l border-border relative animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{candidateName}</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {phone} · WAHA Session Active
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border mt-4 gap-6">
            <button
              onClick={() => setTab('chat')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                tab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              WhatsApp Agent Chat Log
            </button>
            <button
              onClick={() => setTab('screening')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                tab === 'screening' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              Screening Answers (AI Bot)
            </button>
          </div>

          {/* Chat Tab Content */}
          {tab === 'chat' && (
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto p-3 rounded-2xl bg-surface-2/40 border border-border">
              {CHAT_MESSAGES.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'candidate' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'candidate'
                        ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                        : 'bg-surface border border-border text-foreground rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${msg.sender === 'candidate' ? 'opacity-80' : 'text-muted'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Screening Answers Tab Content */}
          {tab === 'screening' && (
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto">
              {SCREENING_ANSWERS.map((qa, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{qa.question}</p>
                    <span className="badge-verified text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> {qa.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-medium">{qa.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
          >
            Close Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
