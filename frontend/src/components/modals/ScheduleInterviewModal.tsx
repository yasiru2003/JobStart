'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Video, UserCheck, Send } from 'lucide-react'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName?: string
  jobTitle?: string
  onScheduleSubmit: (interviewData: any) => void
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  candidateName = 'Kasun Perera',
  jobTitle = 'Senior Full Stack Engineer',
  onScheduleSubmit,
}: ScheduleInterviewModalProps) {
  const [formData, setFormData] = useState({
    candidateSearch: candidateName,
    candidatePhone: '+94 77 123 4567',
    interviewType: 'technical',
    date: '2026-07-28',
    startTime: '10:30',
    endTime: '11:30',
    locationType: 'virtual',
    meetingLink: 'https://meet.google.com/jobstart-interview-01',
    address: 'WSO2 HQ, 20 Palm Grove, Colombo 03',
    interviewers: 'Nalaka Bandara (Lead Architect)',
    notes: 'Please review technical submission prior to the session.',
    sendWahaWhatsApp: true,
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onScheduleSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent text-amber-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Schedule Candidate Interview</h2>
              <p className="text-xs text-muted">Send automated calendar invite & SMS notification</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Candidate & Job Info */}
          <div className="p-3 bg-surface-2/60 border border-border rounded-xl space-y-1">
            <p className="text-xs font-bold text-foreground">Candidate: <span className="text-primary">{candidateName}</span></p>
            <p className="text-xs text-muted">Role: {jobTitle}</p>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Interview Round *</label>
            <select
              value={formData.interviewType}
              onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="screening">Initial HR Screening</option>
              <option value="technical">Technical Architecture Assessment</option>
              <option value="managerial">Managerial & Culture Fit</option>
              <option value="final">Final Executive Offer Discussion</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Location / Meeting Mode */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Meeting Location Mode</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="virtual"
                  checked={formData.locationType === 'virtual'}
                  onChange={() => setFormData({ ...formData, locationType: 'virtual' })}
                  className="accent-primary"
                />
                <Video className="w-3.5 h-3.5 text-primary" /> Google Meet / Zoom
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="locationType"
                  value="onsite"
                  checked={formData.locationType === 'onsite'}
                  onChange={() => setFormData({ ...formData, locationType: 'onsite' })}
                  className="accent-primary"
                />
                <MapPin className="w-3.5 h-3.5 text-accent" /> On-Site Office
              </label>
            </div>

            {formData.locationType === 'virtual' ? (
              <input
                type="text"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="Google Meet or Zoom link"
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Physical Office Address"
                className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>

          {/* Interviewers & Notes */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Interviewer Panel</label>
            <input
              type="text"
              value={formData.interviewers}
              onChange={(e) => setFormData({ ...formData, interviewers: e.target.value })}
              placeholder="Name of interviewing managers"
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">WhatsApp Number (WAHA API Dispatch)</label>
            <input
              type="text"
              value={formData.candidatePhone}
              onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
              placeholder="+94 77 123 4567"
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Instructions for Candidate</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Instructions or links to share with the candidate..."
              className="w-full px-3.5 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="waha-whatsapp-toggle"
                checked={formData.sendWahaWhatsApp}
                onChange={(e) => setFormData({ ...formData, sendWahaWhatsApp: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="waha-whatsapp-toggle" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                Dispatch WhatsApp Invitation via WAHA API
              </label>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              WAHA Connected
            </span>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              id="submit-schedule-interview-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Send Invite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
