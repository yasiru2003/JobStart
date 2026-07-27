'use client'

import { useState } from 'react'
import { X, Building2, User, Mail, Phone, Lock, FileText, Send } from 'lucide-react'

interface EmployerRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onRegisterSubmit: (companyData: any) => void
}

export default function EmployerRegistrationModal({
  isOpen,
  onClose,
  onRegisterSubmit,
}: EmployerRegistrationModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    regNumber: '',
    industry: 'Software / Technology',
    companySize: '50-200 employees',
    address: '',
    city: 'Colombo',
    contactName: '',
    phone: '',
    email: '',
    password: '',
    plan: 'growth',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegisterSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Register Employer Account</h2>
              <p className="text-xs text-muted">Join Sri Lanka's leading enterprise recruitment network</p>
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
          {/* Company Name & BR Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Company Registered Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. WSO2 Lanka (Pvt) Ltd"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">BR Registration Number *</label>
              <input
                type="text"
                required
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                placeholder="e.g. PV 12345 / PV 9876"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Industry & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Industry Sector</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Software / Technology</option>
                <option>Telecommunications</option>
                <option>Apparel & Textiles</option>
                <option>Banking & Financial Services</option>
                <option>BPO & Customer Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Company Size</label>
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>1-20 employees</option>
                <option>20-50 employees</option>
                <option>50-200 employees</option>
                <option>200-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Head Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 20 Palm Grove, Galle Road"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Colombo, Kandy, Galle"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Contact Person Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g. Chamari Perera (HR Director)"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Work Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="hr@company.lk"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Account Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Subscription Tier Choice */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Select Initial Subscription Tier</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="p-2.5 border border-border rounded-xl flex flex-col items-center text-center cursor-pointer hover:bg-surface-2">
                <input
                  type="radio"
                  name="plan"
                  value="starter"
                  checked={formData.plan === 'starter'}
                  onChange={() => setFormData({ ...formData, plan: 'starter' })}
                  className="accent-primary mb-1"
                />
                <span className="text-xs font-bold text-foreground">Starter</span>
                <span className="text-[10px] text-muted">LKR 45,000/mo</span>
              </label>

              <label className="p-2.5 border-2 border-primary rounded-xl flex flex-col items-center text-center cursor-pointer bg-primary/5">
                <input
                  type="radio"
                  name="plan"
                  value="growth"
                  checked={formData.plan === 'growth'}
                  onChange={() => setFormData({ ...formData, plan: 'growth' })}
                  className="accent-primary mb-1"
                />
                <span className="text-xs font-bold text-foreground">Growth</span>
                <span className="text-[10px] text-primary font-bold">LKR 95,000/mo</span>
              </label>

              <label className="p-2.5 border border-border rounded-xl flex flex-col items-center text-center cursor-pointer hover:bg-surface-2">
                <input
                  type="radio"
                  name="plan"
                  value="enterprise"
                  checked={formData.plan === 'enterprise'}
                  onChange={() => setFormData({ ...formData, plan: 'enterprise' })}
                  className="accent-primary mb-1"
                />
                <span className="text-xs font-bold text-foreground">Enterprise</span>
                <span className="text-[10px] text-muted">LKR 250,000/mo</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
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
              id="submit-employer-reg-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
