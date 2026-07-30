'use client'

import { useState } from 'react'
import { Users, Plus, Search, Mail, UserCheck, Trash2, Briefcase, UserPlus, Eye, Phone, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import AddTeamMemberModal from '@/components/modals/AddTeamMemberModal'

const initialStaff = [
  {
    id: '1',
    name: 'Malini Perera',
    email: 'malini@company.lk',
    phone: '+94 77 111 2233',
    location: 'Colombo 03, Sri Lanka',
    role: 'Head of Talent Acquisition',
    department: 'HR & People Ops',
    assignedJobs: 5,
    candidatePipeline: 28,
    interviewsConducted: 42,
    hireSuccessRate: '92%',
    status: 'Active Staff',
    jobsList: ['Senior React Developer', 'Lead UI/UX Designer', 'DevOps Architect', 'QA Manager', 'Cloud Specialist'],
  },
  {
    id: '2',
    name: 'Kavinda Gunasekara',
    email: 'kavinda@company.lk',
    phone: '+94 71 444 5566',
    location: 'Kandy, Sri Lanka',
    role: 'Senior Technical Recruiter',
    department: 'Engineering Hiring',
    assignedJobs: 3,
    candidatePipeline: 19,
    interviewsConducted: 31,
    hireSuccessRate: '88%',
    status: 'Active Staff',
    jobsList: ['Full Stack Engineer', 'Backend Go Developer', 'Data Engineer'],
  },
  {
    id: '3',
    name: 'Dinithi Abeysekara',
    email: 'dinithi@company.lk',
    phone: '+94 75 777 8899',
    location: 'Colombo 05, Sri Lanka',
    role: 'Talent Sourcing Specialist',
    department: 'Design & Product',
    assignedJobs: 2,
    candidatePipeline: 14,
    interviewsConducted: 18,
    hireSuccessRate: '85%',
    status: 'Active Staff',
    jobsList: ['Product Designer', 'UX Researcher'],
  },
]

export default function RecruitersPage() {
  const [staffList, setStaffList] = useState(initialStaff)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [search, setSearch] = useState('')

  const handleAddSubmit = (data: any) => {
    const newStaff = {
      id: String(Date.now()),
      name: data.name || 'New Recruiter',
      email: data.email || 'recruiter@company.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      role: data.role === 'admin' ? 'HR Manager' : 'Technical Recruiter',
      department: 'Internal HR Team',
      assignedJobs: 1,
      candidatePipeline: 0,
      interviewsConducted: 0,
      hireSuccessRate: '100%',
      status: 'Active Staff',
      jobsList: ['Associate Software Engineer'],
    }
    setStaffList([newStaff, ...staffList])
  }

  const handleDeleteStaff = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStaffList((prev) => prev.filter((s) => s.id !== id))
  }

  const filtered = staffList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Internal Hiring Team & HR Managers
          </h1>
          <p className="text-sm text-muted">View in-depth performance, assigned job listings, and candidate pipelines for each team member.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add HR Team Member</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">Recruiters Count</p>
            <p className="text-xl font-bold text-foreground">{staffList.length} Team Members</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">Assigned Job Openings</p>
            <p className="text-xl font-bold text-foreground">
              {staffList.reduce((acc, s) => acc + s.assignedJobs, 0)} Active Jobs
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">Total Candidates Screened</p>
            <p className="text-xl font-bold text-foreground">
              {staffList.reduce((acc, s) => acc + s.candidatePipeline, 0)} Candidates
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search recruiters by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
              <th className="p-4">Recruiter / HR Member</th>
              <th className="p-4">Role & Department</th>
              <th className="p-4">Assigned Jobs</th>
              <th className="p-4">Active Pipeline</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filtered.map((staff) => (
              <tr
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="hover:bg-surface-2/50 transition-colors cursor-pointer"
              >
                <td className="p-4 font-semibold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted">{staff.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground font-medium">
                  <p>{staff.role}</p>
                  <p className="text-xs text-muted">{staff.department}</p>
                </td>
                <td className="p-4 font-semibold text-foreground">{staff.assignedJobs} active jobs</td>
                <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{staff.candidatePipeline} candidates</td>
                <td className="p-4">
                  <span className="badge-verified">{staff.status}</span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={(e) => handleDeleteStaff(staff.id, e)}
                    className="p-1.5 rounded-lg border border-border bg-surface-2 hover:bg-rose-500/10 text-rose-600 transition-colors cursor-pointer"
                    title="Remove Recruiter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSubmit={handleAddSubmit}
      />

      {/* Recruiter Detail View Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4" onClick={() => setSelectedStaff(null)}>
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{selectedStaff.name}</h3>
                  <p className="text-xs text-primary font-medium">{selectedStaff.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-2 border border-border/60">
                <p className="text-[10px] text-muted font-medium">Assigned Jobs</p>
                <p className="text-base font-bold text-foreground">{selectedStaff.assignedJobs}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2 border border-border/60">
                <p className="text-[10px] text-muted font-medium">Candidates</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{selectedStaff.candidatePipeline}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2 border border-border/60">
                <p className="text-[10px] text-muted font-medium">Interviews Held</p>
                <p className="text-base font-bold text-primary">{selectedStaff.interviewsConducted}</p>
              </div>
            </div>

            {/* Contact & Meta Details */}
            <div className="space-y-2 text-xs pt-1 border-t border-border">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Work Email</span>
                <span className="font-semibold text-foreground">{selectedStaff.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                <span className="font-semibold text-foreground">{selectedStaff.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Department</span>
                <span className="font-semibold text-foreground">{selectedStaff.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Hire Success Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStaff.hireSuccessRate}</span>
              </div>
            </div>

            {/* Assigned Jobs List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" /> Active Managed Jobs:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStaff.jobsList?.map((jobName: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-xs border border-primary/20">
                    {jobName}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedStaff(null)}
              className="w-full py-2.5 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close Recruiter Profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
