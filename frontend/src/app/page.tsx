'use client'

import Link from 'next/link'
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Bot,
  Kanban,
  Clock,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  FileCheck,
  ChevronRight,
  PhoneCall,
  Check
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070A10] text-[#F8FAFC] selection:bg-emerald-500/30 selection:text-emerald-400 font-sans overflow-x-hidden">
      {/* ── Floating Animated Background Glows ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0">
        <div className="absolute top-[-80px] left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px] animate-[glowPulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-[120px] right-1/4 w-[450px] h-[450px] bg-sky-500/15 rounded-full blur-[150px] animate-[float_8s_ease-in-out_infinite]" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-50 border-b border-slate-800 bg-[#070A10]/90 backdrop-blur-xl sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Briefcase className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                JobStart <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">Recruiter Suite</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">WhatsApp Recruitment & Screening Engine</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors duration-200 hover:scale-105 transform inline-block">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors duration-200 hover:scale-105 transform inline-block">How it Works</a>
            <a href="#employers" className="hover:text-emerald-400 transition-colors duration-200 hover:scale-105 transform inline-block">Enterprise Partners</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors duration-200 hover:scale-105 transform inline-block">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] flex items-center gap-2"
            >
              <span>Recruiter Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ── HERO SECTION ── */}
        <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.15] animate-scale-in">
            Automated Candidate Screening & Hiring via{' '}
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              WhatsApp Integration
            </span>
          </h1>

          {/* Subtitle - High Contrast Readable Text */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal animate-fade-in">
            JobStart automates initial candidate screening, CV document processing, credential verification, and interview scheduling directly through WhatsApp.

          </p>

          {/* CTA Button Row with Hover Animations */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Zap className="w-4 h-4 fill-white text-transparent group-hover:rotate-12 transition-transform duration-300" />
              <span>Access Recruiter Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <Bot className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore Platform Workflow</span>
            </Link>
          </div>

          {/* Stats Metric Cards - Hover Lift & Glowing Borders */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 group-hover:scale-105 transition-transform duration-300">98%</p>
              <p className="text-xs font-bold text-white">Candidate Response Rate</p>
              <p className="text-[11px] text-slate-300">Direct WhatsApp engagement</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group">
              <p className="text-2xl sm:text-3xl font-black text-amber-400 group-hover:scale-105 transition-transform duration-300">&lt; 24 Hrs</p>
              <p className="text-xs font-bold text-white">Average Time to Hire</p>
              <p className="text-[11px] text-slate-300">Accelerated candidate pipeline</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 hover:-translate-y-1.5 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group">
              <p className="text-2xl sm:text-3xl font-black text-sky-400 group-hover:scale-105 transition-transform duration-300">100%</p>
              <p className="text-xs font-bold text-white">Multilingual Processing</p>
              <p className="text-[11px] text-slate-300">Singlish, Sinhala & English</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 hover:-translate-y-1.5 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <p className="text-2xl sm:text-3xl font-black text-purple-400 group-hover:scale-105 transition-transform duration-300">70%</p>
              <p className="text-xs font-bold text-white">Screener Time Saved</p>
              <p className="text-[11px] text-slate-300">Automated candidate qualification</p>
            </div>
          </div>
        </section>

        {/* ── ENTERPRISE PARTNERS STRIP WITH HOVER SCALING ── */}
        <section id="employers" className="py-10 border-y border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Supported Industry Organizations & Enterprise Teams</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              <div className="flex items-center gap-2 text-base font-bold text-white hover:scale-110 hover:text-emerald-400 transition-all duration-300 cursor-pointer"><Building2 className="w-4 h-4 text-emerald-400" /> WSO2 Lanka</div>
              <div className="flex items-center gap-2 text-base font-bold text-white hover:scale-110 hover:text-sky-400 transition-all duration-300 cursor-pointer"><Building2 className="w-4 h-4 text-sky-400" /> Sysco LABS</div>
              <div className="flex items-center gap-2 text-base font-bold text-white hover:scale-110 hover:text-amber-400 transition-all duration-300 cursor-pointer"><Building2 className="w-4 h-4 text-amber-400" /> Dialog Axiata</div>
              <div className="flex items-center gap-2 text-base font-bold text-white hover:scale-110 hover:text-purple-400 transition-all duration-300 cursor-pointer"><Building2 className="w-4 h-4 text-purple-400" /> Brandix Tech</div>
              <div className="flex items-center gap-2 text-base font-bold text-white hover:scale-110 hover:text-rose-400 transition-all duration-300 cursor-pointer"><Building2 className="w-4 h-4 text-rose-400" /> MAS Holdings</div>
            </div>
          </div>
        </section>

        {/* ── LIVE INTERACTIVE PREVIEW WITH ANIMATED MESSAGES ── */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
              PLATFORM WORKFLOW PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real-Time Synchronization Between WhatsApp and Recruiter Dashboard
            </h2>
            <p className="text-sm text-slate-300">
              Candidates submit applications and complete screening via WhatsApp while recruiter dashboards update stage statuses automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Mobile Phone WhatsApp Simulator with Animated Messages */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-700 bg-[#0F172A] p-4 shadow-xl space-y-3 hover:border-emerald-500/50 transition-all duration-300">
              <div className="px-4 py-3 rounded-xl bg-slate-800 flex items-center gap-3 text-white border border-slate-700">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                    JS
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-800 rounded-full animate-ping" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-800 rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">JobStart AI Screening Agent</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Auto-Responder
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs p-2 max-h-[380px] overflow-y-auto">
                <div className="p-3 rounded-xl rounded-tl-none bg-slate-800 text-white max-w-[90%] space-y-1 border border-slate-700 animate-scale-in">
                  <p className="font-bold text-emerald-400 text-[11px]">JobStart Agent</p>
                  <p className="text-slate-100 leading-relaxed">ආයුබෝවන් Hasini! WSO2 Lanka හි Senior React Developer තනතුරට සාදරයෙන් පිළිගනිමු.</p>
                </div>

                <div className="p-3 rounded-xl rounded-tr-none bg-emerald-900 text-white ml-auto max-w-[90%] space-y-1 border border-emerald-700 animate-scale-in">
                  <p className="font-bold text-emerald-200 text-[11px]">Candidate</p>
                  <p className="text-white leading-relaxed">hi mata 2 weni job ekata apply krnn oni</p>
                </div>

                <div className="p-3 rounded-xl rounded-tl-none bg-slate-800 text-white max-w-[90%] space-y-1 border border-amber-500/40 animate-scale-in">
                  <p className="font-bold text-amber-400 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Clarification Handler
                  </p>
                  <p className="text-slate-100 leading-relaxed">&quot;ඔබේ බලාපොරොත්තු වන Notice Period එක සති කීයක්ද?&quot;</p>
                </div>

                <div className="p-3 rounded-xl rounded-tr-none bg-emerald-900 text-white ml-auto max-w-[90%] space-y-1 border border-emerald-700 animate-scale-in">
                  <p className="font-bold text-emerald-200 text-[11px]">Candidate</p>
                  <p className="text-white leading-relaxed">1 month notice period</p>
                </div>

                <div className="p-3 rounded-xl rounded-tl-none bg-slate-800 text-white max-w-[90%] space-y-1 border border-slate-700 animate-scale-in">
                  <p className="font-bold text-emerald-400 text-[11px]">JobStart Agent</p>
                  <p className="text-slate-100 leading-relaxed">ස්තූතියි! ඔබේ සම්මුඛ පරීක්ෂණ වේලාව සාර්ථකව තහවුරු විය (Wed 10:00 AM).</p>
                </div>
              </div>
            </div>

            {/* Right: Recruiter Dashboard Live Kanban */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5 hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Kanban className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <div>
                    <h3 className="font-bold text-base text-white">Automated Kanban Pipeline</h3>
                    <p className="text-xs text-slate-400">Updates candidate stages based on WhatsApp interactions</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Sync
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                {/* Column 1: Screening */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">In Screening (2)</p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 hover:-translate-y-1 transition-transform cursor-pointer">
                    <p className="font-bold text-white">Kasun Perera</p>
                    <p className="text-[11px] text-slate-300">Senior Full Stack Engineer</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px]">PDF CV Verified</span>
                  </div>
                </div>

                {/* Column 2: Interview */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-amber-500/40 transition-colors">
                  <p className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Interview Scheduled (1)</p>
                  <div className="p-3 rounded-xl bg-slate-900 border-2 border-amber-500/50 space-y-2 hover:-translate-y-1 transition-transform cursor-pointer shadow-lg shadow-amber-500/10">
                    <p className="font-bold text-white">Hasini Dikkumbura</p>
                    <p className="text-[11px] text-amber-300 font-semibold">Senior React Developer</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-bold">98% Match</span>
                      <span className="text-slate-300">3.5s Speed</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Offer */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-colors">
                  <p className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Confirmed (1)</p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 hover:-translate-y-1 transition-transform cursor-pointer">
                    <p className="font-bold text-white">Sunil Rathnayake</p>
                    <p className="text-[11px] text-slate-300">DevOps Architect</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Slot Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE GRID WITH 3D HOVER LIFT & GLOW ── */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              RECRUITER PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Integrated Tools for Modern Candidate Evaluation
            </h2>
            <p className="text-sm text-slate-300">
              Built with structured LLM evaluation models, Singlish processing, and credential verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Multilingual WhatsApp Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operates across Singlish, Sinhala, and English to present job listings and process candidate answers automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">Smart Clarification Protection</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When candidates ask clarifying questions, the system provides explanations and maintains state progression.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">Credential & Identity Verification</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Validates uploaded document files, NIC identity records, and professional qualification certificates.
              </p>

            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Response Latency Analytics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates average response speeds and assigns responsiveness ratings to highlight highly motivated applicants.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">LLM Technical Answer Evaluator</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates candidate screening answers for technical accuracy and flags off-topic or improbable responses.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 space-y-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Salary Benchmark Spec Generator</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates job specifications, requirement lists, and benchmarked Sri Lankan LKR salary ranges automatically.
              </p>
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS WITH HOVER LIFT & ANIMATED GLOWS ── */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              RECRUITER PRICING TIERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Subscription Plans for Employers and Agencies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan 1 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:-translate-y-1.5 transition-all duration-300 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter Recruiter</h3>
                <p className="text-3xl font-black text-white">LKR 15,000 <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
                <p className="text-xs text-slate-300">For small organizations hiring up to 5 roles per month.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Active WhatsApp Session</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 100 Candidates / mo</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Automated Candidate Screening</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Access Starter Dashboard
              </Link>
            </div>

            {/* Plan 2: Highlighted with Animated Glow */}
            <div className="p-8 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 hover:border-emerald-400 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 space-y-6 flex flex-col justify-between relative">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-pulse">RECOMMENDED</div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Growth Agency</h3>
                <p className="text-3xl font-black text-emerald-400">LKR 45,000 <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
                <p className="text-xs text-slate-300">For hiring agencies and active development teams.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 3 Active WhatsApp Sessions</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Candidate Screening</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Technical LLM Answer Evaluator</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Identity & Credential Verification</li>

                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Access Growth Dashboard
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:-translate-y-1.5 transition-all duration-300 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Enterprise Tier</h3>
                <p className="text-3xl font-black text-white">Custom Pricing</p>
                <p className="text-xs text-slate-300">For large enterprise teams requiring custom API integrations.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited WhatsApp Channels</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Technical Support</li>
                  <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Enterprise Gateway Configuration</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Contact Enterprise Team
              </Link>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION FOOTER BANNER ── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="p-10 sm:p-14 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-white text-center space-y-5 shadow-xl transition-all duration-300 group">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:scale-[1.01] transition-transform duration-300">
              Streamline Candidate Evaluation with JobStart
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              Access the recruiter dashboard to manage job listings, evaluate applicant responses, and schedule interviews.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Open Recruiter Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 py-8 bg-[#05070C] text-xs text-slate-400 text-center">
        <p>© 2026 JobStart Recruitment Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
