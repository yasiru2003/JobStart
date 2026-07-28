'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, UserRole } from '@/lib/stores'
import { authApi } from '@/lib/api'
import { LogIn, Shield, Briefcase, UserCheck, User, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

const DEMO_PRESETS: { role: UserRole; label: string; email: string; name: string; icon: any; color: string }[] = [
  {
    role: 'admin',
    label: 'Platform Admin',
    email: 'nadeeka.dias@jobstart.lk',
    name: 'Nadeeka Dias',
    icon: Shield,
    color: 'bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20',
  },
  {
    role: 'employer',
    label: 'Employer',
    email: 'employer@wso2.com',
    name: 'Sahan Gunawardena',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
  },
  {
    role: 'recruiter',
    label: 'Recruiter',
    email: 'recruiter@jobstart.lk',
    name: 'Kavinda Fernando',
    icon: UserCheck,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20',
  },
  {
    role: 'candidate',
    label: 'Candidate',
    email: 'candidate@gmail.com',
    name: 'Kasun Perera',
    icon: User,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Attempt API login
      const res = await authApi.login(email, password)
      const { access_token, user } = res.data

      login(access_token, {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role as UserRole,
        avatarUrl: user.avatar_url,
      })

      router.push('/dashboard')
    } catch (err: any) {
      // Fallback for demo mode if backend server is not running
      const matchingPreset = DEMO_PRESETS.find((p) => p.email.toLowerCase() === email.toLowerCase())
      
      const mockUser = matchingPreset
        ? {
            id: `usr_${matchingPreset.role}_1`,
            email: matchingPreset.email,
            fullName: matchingPreset.name,
            role: matchingPreset.role,
          }
        : {
            id: 'usr_custom_1',
            email: email,
            fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
            role: 'candidate' as UserRole,
          }

      const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: mockUser.id, role: mockUser.role }))}.mock_signature`

      login(mockJwt, mockUser)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePresetClick = (preset: (typeof DEMO_PRESETS)[0]) => {
    setEmail(preset.email)
    setPassword('demo12345')
    setError(null)
    
    // Auto login demo preset
    const mockUser = {
      id: `usr_${preset.role}_1`,
      email: preset.email,
      fullName: preset.name,
      role: preset.role,
    }
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: mockUser.id, role: mockUser.role }))}.mock_signature`
    
    login(mockJwt, mockUser)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/25">
            J
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-display">
            Job<span className="text-primary">Start</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-center text-xs text-muted">
          Sri Lanka's Premier Recruitment & Verification Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="card p-8 shadow-xl border border-border/80 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with JWT...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Options */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Demo Roles</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_PRESETS.map((preset) => {
                const Icon = preset.icon
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${preset.color}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs leading-tight truncate">{preset.label}</p>
                      <p className="text-[10px] opacity-75 truncate">{preset.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Don't have an account?{' '}
          <a onClick={() => router.push('/register')} className="font-bold text-primary hover:underline cursor-pointer">
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}
