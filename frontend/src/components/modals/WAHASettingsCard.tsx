'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageCircle,
  Wifi,
  WifiOff,
  QrCode,
  Play,
  Square,
  Send,
  Settings2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { wahaApi } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────

type SessionStatus =
  | 'NOT_CONFIGURED'
  | 'NOT_STARTED'
  | 'STARTING'
  | 'SCAN_QR_CODE'
  | 'WORKING'
  | 'FAILED'
  | 'UNREACHABLE'
  | 'ERROR'
  | 'UNKNOWN'

interface WAHAStatus {
  name: string
  status: SessionStatus
  engine: Record<string, unknown>
  is_configured: boolean
  host: string
  error?: string
}

// ── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; bg: string; dot: string; pulse: boolean }
> = {
  NOT_CONFIGURED: { label: 'Not Configured', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-400', pulse: false },
  NOT_STARTED:    { label: 'Not Started',    color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', pulse: false },
  STARTING:       { label: 'Starting…',      color: 'text-blue-500',  bg: 'bg-blue-500/10 border-blue-500/20',  dot: 'bg-blue-500',  pulse: true  },
  SCAN_QR_CODE:   { label: 'Scan QR Code',   color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', pulse: true  },
  WORKING:        { label: 'Connected ✓',    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500', pulse: false },
  FAILED:         { label: 'Failed',         color: 'text-rose-500',  bg: 'bg-rose-500/10 border-rose-500/20',  dot: 'bg-rose-500',  pulse: false },
  UNREACHABLE:    { label: 'Unreachable',    color: 'text-rose-500',  bg: 'bg-rose-500/10 border-rose-500/20',  dot: 'bg-rose-500',  pulse: false },
  ERROR:          { label: 'Error',          color: 'text-rose-500',  bg: 'bg-rose-500/10 border-rose-500/20',  dot: 'bg-rose-500',  pulse: false },
  UNKNOWN:        { label: 'Unknown',        color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400', pulse: false },
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg}`}>
      <span className="relative flex h-2 w-2">
        {cfg.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      {cfg.label}
    </span>
  )
}

// ── QR Countdown ──────────────────────────────────────────────────────────

function QRCountdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    setRemaining(seconds)
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(t); onExpire(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [seconds, onExpire])
  const pct = (remaining / seconds) * 100
  return (
    <div className="flex items-center gap-2 text-[11px] text-amber-600 font-medium">
      <Clock className="w-3 h-3" />
      <span>QR expires in {remaining}s</span>
      <div className="flex-1 h-1 rounded-full bg-amber-500/20 overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

interface WAHASettingsCardProps {
  onToast?: (msg: string) => void
}

export default function WAHASettingsCard({ onToast }: WAHASettingsCardProps) {
  // Config form
  const [host, setHost] = useState('http://178.104.127.220:3000')
  const [apiKey, setApiKey] = useState('key_Z9s561T3AdkBlkciQ73wt7oag2yEurGA')
  const [sessionName, setSessionName] = useState('jobstart')
  const [showApiKey, setShowApiKey] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  // Session state
  const [sessionStatus, setSessionStatus] = useState<WAHAStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // QR Code
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrFetched, setQrFetched] = useState(false)
  const [qrExpireKey, setQrExpireKey] = useState(0)

  // Test message
  const [testPhone, setTestPhone] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  // Banners
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const qrRefreshRef = useRef<NodeJS.Timeout | null>(null)
  const prevStatus = useRef<SessionStatus | null>(null)

  // ── QR Fetch ──────────────────────────────────────────────────────────

  const fetchQR = useCallback(async () => {
    setQrLoading(true)
    try {
      const res = await wahaApi.getQR()
      const qr = res.data?.qr_code
      if (qr) {
        setQrCode(qr)
        setQrFetched(true)
        setQrExpireKey(k => k + 1) // reset countdown
      }
    } catch {
      // QR not ready yet
    } finally {
      setQrLoading(false)
    }
  }, [])

  // ── Status fetch ──────────────────────────────────────────────────────

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setStatusLoading(true)
    setError(null)
    try {
      const res = await wahaApi.status()
      const data: WAHAStatus = res.data
      const newStatus = data.status as SessionStatus

      // Detect WORKING transition → show success
      if (prevStatus.current === 'SCAN_QR_CODE' && newStatus === 'WORKING') {
        setQrCode(null)
        setQrFetched(false)
        setInfo('✅ WhatsApp connected successfully!')
        onToast?.('🎉 WhatsApp session connected!')
      }
      prevStatus.current = newStatus
      setSessionStatus(data)

      // Auto-fetch QR when needed
      if (newStatus === 'SCAN_QR_CODE' && !qrFetched) {
        fetchQR()
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to fetch status'
      if (!silent) setError(msg)
    } finally {
      if (!silent) setStatusLoading(false)
    }
  }, [qrFetched, fetchQR, onToast])

  // ── Polling ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus()

    // Poll every 3s so QR transitions are detected quickly
    pollRef.current = setInterval(() => {
      fetchStatus(true)
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (qrRefreshRef.current) clearInterval(qrRefreshRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh QR every 25s (WAHA QR codes expire ~30s)
  useEffect(() => {
    if (qrRefreshRef.current) clearInterval(qrRefreshRef.current)
    if (sessionStatus?.status === 'SCAN_QR_CODE') {
      qrRefreshRef.current = setInterval(() => {
        fetchQR()
      }, 25000)
    }
    return () => { if (qrRefreshRef.current) clearInterval(qrRefreshRef.current) }
  }, [sessionStatus?.status, fetchQR])

  // ── Save Config ───────────────────────────────────────────────────────

  const handleSaveConfig = async () => {
    if (!host.trim()) { setError('Please enter the WAHA host URL'); return }
    setConfigSaving(true); setError(null)
    try {
      const res = await wahaApi.updateConfig(host.trim(), apiKey.trim(), sessionName.trim() || 'default')
      const connectivity = res.data.connectivity === 'ok' ? '✅ Reachable' : `⚠️ ${res.data.connectivity}`
      setInfo(`Config saved. Connectivity: ${connectivity}`)
      setConfigSaved(true)
      onToast?.('WAHA configuration saved!')
      setTimeout(() => setConfigSaved(false), 3000)
      await fetchStatus()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save config'
      setError(msg)
    } finally { setConfigSaving(false) }
  }

  // ── Session Actions ───────────────────────────────────────────────────

  const handleStartSession = async () => {
    setActionLoading('start'); setError(null)
    try {
      await wahaApi.startSession()
      setInfo('Session starting… QR code will appear shortly.')
      setQrFetched(false)
      onToast?.('WhatsApp session starting — scan the QR code to connect')
      setTimeout(() => fetchStatus(), 2000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to start'
      setError(msg)
    } finally { setActionLoading(null) }
  }

  const handleStopSession = async () => {
    setActionLoading('stop'); setError(null)
    try {
      await wahaApi.stopSession()
      setQrCode(null); setQrFetched(false)
      onToast?.('WhatsApp session stopped')
      setTimeout(() => fetchStatus(), 1000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to stop'
      setError(msg)
    } finally { setActionLoading(null) }
  }

  // ── Test ──────────────────────────────────────────────────────────────

  const handleSendTest = async () => {
    if (!testPhone.trim()) { setError('Enter a phone number for the test message'); return }
    setTestLoading(true); setError(null)
    try {
      await wahaApi.test(testPhone.trim())
      onToast?.(`✅ Test message sent to ${testPhone}`)
      setInfo(`Test message delivered to ${testPhone}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to send'
      setError(msg)
    } finally { setTestLoading(false) }
  }

  // ── Derived ───────────────────────────────────────────────────────────

  const currentStatus: SessionStatus = (sessionStatus?.status as SessionStatus) ?? 'NOT_CONFIGURED'
  const isWorking = currentStatus === 'WORKING'
  const needsQR = currentStatus === 'SCAN_QR_CODE'
  const canStart = ['NOT_CONFIGURED', 'NOT_STARTED', 'FAILED', 'UNREACHABLE', 'ERROR', 'UNKNOWN'].includes(currentStatus)
  const canStop = ['WORKING', 'SCAN_QR_CODE', 'STARTING', 'FAILED'].includes(currentStatus)

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                WhatsApp Cloud Integration
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">WAHA</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">Connect WAHA to send interview invitations & enable the AI WhatsApp agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted" /> : <StatusBadge status={currentStatus} />}
            <button onClick={() => fetchStatus()} disabled={statusLoading} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground transition-colors" title="Refresh status">
              <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error / Info banners */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-600 text-xs animate-fade-in">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {info && !error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/20 text-blue-600 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{info}</span>
          </div>
        )}

        {/* ── Config Form ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-primary" />Connection Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="waha-host">WAHA Host URL</label>
              <div className="relative">
                <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                <input id="waha-host" type="url" value={host} onChange={e => setHost(e.target.value)}
                  placeholder="http://1.2.3.4:3000"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="waha-apikey">API Key</label>
              <div className="relative">
                <input id="waha-apikey" type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder="your-waha-api-key"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
                <button type="button" onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-muted">Sent as <code className="text-primary/80">X-Api-Key</code> header</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted" htmlFor="waha-session">Session Name</label>
              <input id="waha-session" type="text" value={sessionName} onChange={e => setSessionName(e.target.value)}
                placeholder="default"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
            </div>
          </div>
          <button onClick={handleSaveConfig} disabled={configSaving} id="waha-save-config"
            className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 ${configSaved ? 'bg-emerald-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'} disabled:opacity-50`}>
            {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {configSaving ? 'Saving…' : configSaved ? 'Saved ✓' : 'Save Configuration'}
          </button>
        </div>

        <div className="border-t border-border" />

        {/* ── Session Management ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-primary" />Session Management
            </h3>
            {sessionStatus?.host && (
              <a href={`${sessionStatus.host}/dashboard`} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-1">
                Open WAHA Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted font-medium">Active Session</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{sessionStatus?.name ?? sessionName ?? 'default'}</p>
              {sessionStatus?.error && <p className="text-[11px] text-rose-500 mt-1 truncate">{sessionStatus.error}</p>}
            </div>
            <StatusBadge status={currentStatus} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleStartSession} disabled={!canStart || actionLoading !== null} id="waha-start-session"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95">
              {actionLoading === 'start' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Start Session
            </button>
            <button onClick={handleStopSession} disabled={!canStop || actionLoading !== null} id="waha-stop-session"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95">
              {actionLoading === 'stop' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              Stop Session
            </button>
            <button onClick={() => fetchStatus()} id="waha-refresh-status"
              className="flex items-center gap-1.5 px-4 py-2 border border-border bg-surface hover:bg-surface-2 text-foreground text-xs font-semibold rounded-xl transition-all active:scale-95">
              <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>

          {/* QR Code Panel */}
          {(needsQR || (sessionStatus?.status === 'STARTING' && qrFetched)) && (
            <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-5 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-600">
                <QrCode className="w-5 h-5" />
                <p className="text-sm font-bold">Scan QR Code to Connect WhatsApp</p>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Open <strong>WhatsApp</strong> on your phone →{' '}
                <strong>Settings → Linked Devices → Link a Device</strong> → scan below.
              </p>

              <div className="flex flex-col items-center gap-4">
                {qrLoading && !qrCode ? (
                  <div className="w-56 h-56 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-xs text-muted">Loading QR code…</p>
                  </div>
                ) : qrCode ? (
                  <div className="relative p-3 bg-white rounded-2xl shadow-lg border-2 border-amber-500/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56 rounded-xl" />
                    {qrLoading && (
                      <div className="absolute inset-3 rounded-xl bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={fetchQR}
                    className="w-56 h-56 rounded-2xl bg-surface border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center gap-3 text-amber-500 hover:bg-amber-500/5 transition-colors">
                    <QrCode className="w-10 h-10" />
                    <span className="text-xs font-semibold">Click to Load QR Code</span>
                  </button>
                )}

                {qrCode && (
                  <QRCountdown key={qrExpireKey} seconds={28} onExpire={fetchQR} />
                )}

                <button onClick={fetchQR} disabled={qrLoading}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500 font-semibold transition-colors">
                  <RefreshCw className={`w-3 h-3 ${qrLoading ? 'animate-spin' : ''}`} />
                  Refresh QR Code
                </button>
              </div>
            </div>
          )}

          {/* Connected Banner */}
          {isWorking && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-600">WhatsApp Connected & Active</p>
                <p className="text-xs text-muted">Session is live and ready to send / receive messages</p>
              </div>
            </div>
          )}

          {/* Offline Banner */}
          {(currentStatus === 'UNREACHABLE' || currentStatus === 'FAILED') && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/20 animate-fade-in">
              <WifiOff className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-600">
                  {currentStatus === 'UNREACHABLE' ? 'Cannot Reach WAHA Host' : 'Session Failed'}
                </p>
                <p className="text-xs text-muted">Check the host URL and API key, then start the session again</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* ── Test Message ── */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-primary" />Send Test Message
          </h3>
          <p className="text-xs text-muted">Verify the integration by sending a live WhatsApp message to a phone number.</p>
          <div className="flex gap-2">
            <input type="tel" value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="94771234567"
              id="waha-test-phone"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted/50" />
            <button onClick={handleSendTest} disabled={testLoading || !isWorking} id="waha-send-test"
              title={!isWorking ? 'Session must be WORKING to send messages' : undefined}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap">
              {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Test
            </button>
          </div>
          {!isWorking && <p className="text-[11px] text-muted">Start and authenticate the session first.</p>}
        </div>
      </div>
    </div>
  )
}
