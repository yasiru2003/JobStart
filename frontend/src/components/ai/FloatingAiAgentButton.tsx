'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

export default function FloatingAiAgentButton() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-ai-drawer', handleOpen)
    return () => window.removeEventListener('open-ai-drawer', handleOpen)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#0F766E] hover:bg-[#0d9488] text-white font-bold text-xs rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-2.5 border border-white/20"
        id="floating-ai-agent-trigger"
        title="Open AI Recruitment Assistant"
      >
        <div className="w-6 h-6 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-950" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-xs font-bold text-white">AI Agent</p>
          <p className="text-[10px] text-teal-100 font-medium">Assistant Active</p>
        </div>
      </button>

      <AiAgentDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
