'use client'

import { useState } from 'react'
import {
  UserCircle, Mail, Phone, MapPin, Save, CheckCircle2, Building2,
  Briefcase, GraduationCap, ShieldCheck, Award, Sparkles, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores'
import { CANDIDATE_CVS, buildCvContextString } from '@/lib/candidateCvData'
import AiAgentDrawer from '@/components/ai/AiAgentDrawer'

export default function ProfilePage() {
  const { user } = useAuthStore()

  const effectiveRole = user?.role || 'admin'
  const isCandidate = effectiveRole === 'candidate'
  const candidateName = user?.fullName || ''
  const cv = isCandidate ? CANDIDATE_CVS[candidateName] : null

  const [fullName, setFullName]   = useState(user?.fullName || 'Nadeeka Dias')
  const [email, setEmail]         = useState(user?.email || 'nadeeka.dias@jobstart.lk')
  const [phone, setPhone]         = useState(cv?.phone || '+94 77 123 4567')
  const [location, setLocation]   = useState(cv?.location || 'Colombo, Sri Lanka')
  const [agency, setAgency]       = useState('JobStart Recruitment LK')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [aiOpen, setAiOpen]       = useState(false)
  const [aiPrompt, setAiPrompt]   = useState<string | undefined>(undefined)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const openAiWithPrompt = (prompt: string) => {
    setAiPrompt(prompt)
    setAiOpen(true)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            {isCandidate ? 'My Profile & CV' : 'My Profile & Credentials'}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {isCandidate
              ? 'Your professional CV, active applications, and AI-powered insights.'
              : 'Manage personal details, contact information, and agency credentials.'}
          </p>
        </div>
        {savedSuccess && (
          <span className="badge-verified text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Profile Updated!
          </span>
        )}
      </div>

      {/* Basic Info Form */}
      <form onSubmit={handleSaveProfile} className="card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0">
            {fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted capitalize font-medium">
              {cv ? cv.role : `${user?.role || 'Admin'} Account · ${agency}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Location / City</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          {!isCandidate && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1.5">Agency / Company Name</label>
              <input type="text" value={agency} onChange={(e) => setAgency(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="badge-verified">Verified Portal User</span>
          <button type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* ─── Candidate-only: Full CV Section ─── */}
      {isCandidate && cv && (
        <>
          {/* Summary */}
          <div className="card p-6 space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" /> Professional Summary
            </h2>
            <p className="text-sm text-muted leading-relaxed">{cv.summary}</p>
          </div>

          {/* Work Experience */}
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Work Experience
            </h2>
            <div className="space-y-4">
              {cv.experience.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0" />
                    {i < cv.experience.length - 1 && <div className="w-px flex-1 bg-border mt-1.5" />}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{exp.role}</p>
                    <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {exp.company} · {exp.period}
                    </p>
                    <p className="text-xs text-muted mt-1">{exp.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education + Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Education
              </h2>
              <p className="text-xs text-muted">{cv.education}</p>
            </div>
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Documents
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {cv.verification.split(' · ').map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6 space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Key Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill) => (
                <span key={skill}
                  className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>



          {/* AI Quick Actions */}
          <div className="card p-6 space-y-3 border-primary/30 bg-primary/5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI-Powered Career Assistant
            </h2>
            <p className="text-xs text-muted">Ask the AI anything about your applications, interviews, or how to improve your profile.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                `How am I matching for the ${cv.applications?.[0]?.job} role at ${cv.applications?.[0]?.employer}?`,
                `What skills should I improve to boost my match score?`,
                `Help me prepare for my ${cv.interviews?.[0]?.job} interview at ${cv.interviews?.[0]?.employer}`,
                `Analyze my CV and suggest improvements`,
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => openAiWithPrompt(prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-xs font-medium text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <AiAgentDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} initialPrompt={aiPrompt} />
    </div>
  )
}
