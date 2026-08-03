'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, SkipForward, CheckCircle2 } from 'lucide-react'

interface AiPlaceholderWizardProps {
  placeholders: string[]
  onSubmit: (filledValues: Record<string, string>) => void
}

export default function AiPlaceholderWizard({ placeholders, onSubmit }: AiPlaceholderWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isFinished, setIsFinished] = useState(false)

  if (!placeholders || placeholders.length === 0) return null

  const rawPlaceholder = placeholders[currentIndex] || ''
  const cleanLabel = rawPlaceholder
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/Insert\s+/i, '')
    .replace(/Specify\s+/i, '')
    .trim()

  const handleNext = () => {
    const updatedAnswers = { ...answers }
    if (inputValue.trim()) {
      updatedAnswers[cleanLabel] = inputValue.trim()
    }
    setAnswers(updatedAnswers)
    setInputValue('')

    if (currentIndex < placeholders.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
      onSubmit(updatedAnswers)
    }
  }

  const handleSkip = () => {
    setInputValue('')
    if (currentIndex < placeholders.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
      onSubmit(answers)
    }
  }

  if (isFinished) {
    return (
      <div className="my-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Placeholder Wizard Completed! Submitting updates to AI Agent...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="my-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Job Details Assistant</span>
        </div>
        <span className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80">
          Step {currentIndex + 1} of {placeholders.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-amber-500/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-amber-500 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / placeholders.length) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-foreground">
          Please specify details for: <span className="text-amber-600 dark:text-amber-400 font-bold">{cleanLabel}</span>
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Enter ${cleanLabel} (e.g. ${
            cleanLabel.toLowerCase().includes('location')
              ? 'GTN / Remote'
              : cleanLabel.toLowerCase().includes('salary')
              ? 'LKR 450,000 - 600,000'
              : cleanLabel.toLowerCase().includes('company')
              ? 'WSO2 Sri Lanka'
              : 'Details...'
          })`}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-foreground"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleNext()
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleSkip}
          className="px-3 py-1.5 text-xs text-muted hover:text-foreground font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Skip</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>{currentIndex === placeholders.length - 1 ? 'Submit' : 'Next'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
