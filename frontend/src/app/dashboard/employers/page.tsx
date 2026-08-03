'use client'

import { useState } from 'react'
import { Building2, Plus, Search, Filter, CheckCircle } from 'lucide-react'
import EmployerRegistrationModal from '@/components/modals/EmployerRegistrationModal'

const initialEmployers = [
  { id: '1', name: 'WSO2 Lanka', industry: 'Software / Enterprise Middleware', size: '500–1000 employees', jobs: 8, recruiters: 'Kavinda Fernando, Nalaka Bandara', plan: 'Enterprise' },
  { id: '2', name: 'Dialog Axiata', industry: 'Telecommunications', size: '1000+ employees', jobs: 12, recruiters: 'Chaminda Silva', plan: 'Enterprise' },
  { id: '3', name: 'Sysco LABS', industry: 'Information Technology', size: '500+ employees', jobs: 15, recruiters: 'Dinithi Abeysekara', plan: 'Enterprise' },
  { id: '4', name: 'Brandix Tech', industry: 'Apparel Tech & Innovation', size: '1000+ employees', jobs: 5, recruiters: 'Malini Perera', plan: 'Growth' },
  { id: '5', name: 'MAS Holdings', industry: 'Apparel & Innovation', size: '1000+ employees', jobs: 10, recruiters: 'Dilshan Perera', plan: 'Growth' },
]

export default function EmployersPage() {
  const [employers, setEmployers] = useState(initialEmployers)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const handleAddEmployer = (formData: any) => {
    const newEmp = {
      id: String(Date.now()),
      name: formData.companyName,
      industry: formData.industry,
      size: formData.companySize,
      jobs: 0,
      recruiters: 'Kavinda Fernando',
      plan: formData.plan === 'enterprise' ? 'Enterprise' : formData.plan === 'growth' ? 'Growth' : 'Starter',
    }
    setEmployers([newEmp, ...employers])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employers Directory</h1>
          <p className="text-sm text-muted">Manage employer accounts, assigned recruiter teams, and subscription tiers.</p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          id="add-employer-modal-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Employer</span>
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search employers by name, industry, or recruiters..."
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
              <th className="p-4">Employer</th>
              <th className="p-4">Industry</th>
              <th className="p-4">Company Size</th>
              <th className="p-4">Assigned Recruiters</th>
              <th className="p-4">Active Jobs</th>
              <th className="p-4">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {employers.map((emp) => (
              <tr key={emp.id} className="hover:bg-surface-2/40 transition-colors">
                <td className="p-4 font-semibold text-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {emp.name[0]}
                  </div>
                  {emp.name}
                </td>
                <td className="p-4 text-muted">{emp.industry}</td>
                <td className="p-4 text-muted">{emp.size}</td>
                <td className="p-4">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    {emp.recruiters}
                  </span>
                </td>
                <td className="p-4 font-semibold text-foreground">{emp.jobs} jobs</td>
                <td className="p-4">
                  <span className="badge-info font-medium px-2.5 py-1 text-xs">{emp.plan}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmployerRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSubmit={handleAddEmployer}
      />
    </div>
  )
}
