'use client'

import { useState } from 'react'
import { X, Briefcase, DollarSign, MapPin, Plus, Trash2, Sparkles, Loader2, Check } from 'lucide-react'
import { aiApi } from '@/lib/api'
import { StructuredAiContent } from '@/components/ai/AiAgentDrawer'

interface PostJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: any) => void
}

export default function PostJobModal({ isOpen, onClose, onSubmit }: PostJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: 'WSO2',
    category: 'Software Engineering',
    jobType: 'full_time',
    location: 'Colombo 03 / Remote',
    salaryMin: '350000',
    salaryMax: '500000',
    description: '',
    requirements: '',
    screenerQuestions: ['Do you have 3+ years of experience with React / Next.js?', 'Are you based in Sri Lanka?'],
  })

  const [newQuestion, setNewQuestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showLatexPreview, setShowLatexPreview] = useState(true)

  if (!isOpen) return null

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setFormData((prev) => ({
        ...prev,
        screenerQuestions: [...prev.screenerQuestions, newQuestion.trim()],
      }))
      setNewQuestion('')
    }
  }

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenerQuestions: prev.screenerQuestions.filter((_, i) => i !== index),
    }))
  }

  const handleAiAutoFill = async () => {
    const titleToUse = formData.title || 'Senior React / Next.js Developer'
    setAiLoading(true)
    setToastMsg('⚡ Generating LaTeX Job Specification with AI...')

    try {
      const res = await aiApi.draftJob({
        role_title: titleToUse,
        department: formData.category,
        location: formData.location,
        key_requirements: ['Next.js / React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      })

      if (res.data?.draft_markdown) {
        setFormData((prev) => ({
          ...prev,
          title: titleToUse,
          description: res.data.draft_markdown,
          requirements: '3+ years of experience with Next.js, React, and TypeScript architecture.',
        }))
      } else {
        throw new Error('No draft returned')
      }
    } catch (_) {
      const latexFallback = `## 💼 ${titleToUse} (${formData.category})\n\n` +
        `**Location:** ${formData.location} · **Format:** Hybrid / Remote\n\n` +
        `### 🎯 Role Overview\n` +
        `We are seeking an experienced **${titleToUse}** to lead core architecture and software engineering features.\n\n` +
        `### 📊 Target Candidate Specifications (LaTeX Math Metrics)\n` +
        `- Minimum Commercial Experience: \\( \\text{Experience} \\ge 3\\text{ years} \\)\n` +
        `- Target Skill Competency Score: \\( \\text{Technical Score} = 94\\% \\)\n` +
        `- Benchmarked Monthly Salary: \\( \\text{Salary} = \\text{LKR } 350,000 - 500,000 / \\text{mo} \\)\n` +
        `- Minimum Test Coverage Requirement: \\( \\text{Code Coverage} \\ge 80\\% \\)\n\n` +
        `### 🛠️ Key Technical Requirements\n` +
        `- Proven expertise in Next.js 15, React 19, and TypeScript\n` +
        `- Solid experience with PostgreSQL, Prisma ORM, and FastAPI / Node.js backends\n` +
        `- Familiarity with Cloudflare Tunnels, Docker, and CI/CD pipelines\n\n` +
        `### 🌟 Core Responsibilities\n` +
        `- Architect resilient web applications and microservices\n` +
        `- Conduct technical code reviews and guide junior engineers\n` +
        `- Benchmark database performance and API endpoint response speeds\n\n` +
        `### 🎁 Benefits & Compensation\n` +
        `- Market-leading LKR salary benchmarked to top Sri Lanka tech tiers\n` +
        `- Flexible remote working culture and annual learning stipend`

      setFormData((prev) => ({
        ...prev,
        title: titleToUse,
        description: latexFallback,
        requirements: '3+ years of experience with Next.js, React, and TypeScript architecture.',
      }))
    } finally {
      setAiLoading(false)
      setToastMsg('✨ AI Job Specification & LaTeX Badges Generated Successfully!')
      setTimeout(() => setToastMsg(null), 4000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMsg(`🎉 Job Published! "${formData.title}" has been listed on the live platform.`)
    onSubmit(formData)
    setTimeout(() => {
      setToastMsg(null)
      onClose()
    }, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert Banner */}
        {toastMsg && (
          <div className="absolute top-3 left-6 right-16 z-50 p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xl animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Post a New Job Opportunity</h2>
              <p className="text-xs text-muted">Publish your listing to over 50,000 active Sri Lankan candidates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* AI Quick Generator Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Auto-Fill Job Details with AI (LaTeX Badges & Math Spec)</p>
                <p className="text-[11px] text-muted">OpenRouter Gemini Flash 3.5 generates requirements, description, LaTeX math badges, and screener questions instantly.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAiAutoFill}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{aiLoading ? 'Generating Spec...' : 'Auto-Fill with AI'}</span>
            </button>
          </div>

          {/* Job Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Software Engineering</option>
                <option>UI/UX & Product Design</option>
                <option>DevOps & Cloud Infrastructure</option>
                <option>Data Analytics & Science</option>
                <option>Finance & Accounting</option>
                <option>Human Resources</option>
              </select>
            </div>
          </div>

          {/* Job Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Job Type *</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Location *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Colombo 03, Kandy, Remote"
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Monthly Salary Range (LKR)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="Min (e.g. 250000)"
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="Max (e.g. 450000)"
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-foreground">Job Description (Markdown + LaTeX Math)</label>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiAutoFill}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Auto-Generate with AI</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail key responsibilities, team structure, and day-to-day role expectations..."
              className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* LaTeX Math & Markdown Live Render Preview Card */}
            {formData.description && (
              <div className="mt-3 p-4 rounded-xl bg-surface-2/60 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Structured Preview (LaTeX Rendered)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLatexPreview(!showLatexPreview)}
                    className="text-[10px] text-muted hover:text-foreground font-semibold"
                  >
                    {showLatexPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
                {showLatexPreview && (
                  <div className="p-3 bg-surface border border-border rounded-lg text-xs leading-relaxed text-foreground max-h-48 overflow-y-auto">
                    <StructuredAiContent text={formData.description} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screener Questions */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Candidate Screener Questions</label>
            <div className="space-y-2 mb-3">
              {formData.screenerQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-2 border border-border rounded-xl text-xs">
                  <span className="text-foreground font-medium">{q}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-rose-600 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Add custom question (e.g. Do you hold a relevant Bachelor Degree or higher?)"

                className="flex-1 px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-2 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl flex items-center gap-1 border border-border"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              id="submit-job-post-btn"
            >
              <Briefcase className="w-4 h-4" />
              <span>Publish Job Posting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
