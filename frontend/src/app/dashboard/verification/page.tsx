'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, FileText, Eye } from 'lucide-react'
import VerificationReviewModal from '@/components/modals/VerificationReviewModal'
import { wahaApi } from '@/lib/api'

const initialVerificationQueue = [
  { id: 'v-hd', name: 'Hasini Dikkumbura', docType: 'NIC + Degree Certificate (PDF CV Verified)', submitted: 'Just now (WhatsApp Agent)', status: 'Verified', nic: '199878901234' },
  { id: '1', name: 'Kasun Perera', docType: 'NIC + Professional Certification', submitted: '3 days ago', status: 'Pending', nic: '952451234V' },
  { id: '2', name: 'Sanduni Jayawardena', docType: 'NIC', submitted: '2 days ago', status: 'Pending', nic: '199854210012' },
  { id: '3', name: 'Priyanka Jayasuriya', docType: 'NIC + Police Report', submitted: '6 days ago', status: 'Verified', nic: '912345678V' },
  { id: '4', name: 'Dilshan Fernando', docType: 'NIC + Driving License', submitted: '1 day ago', status: 'Pending', nic: '199584739201' },
  { id: '5', name: 'Nirosha Silva', docType: 'Police Report', submitted: '5 days ago', status: 'Rejected', nic: '895471203V' },
]

export default function VerificationPage() {
  const [list, setList] = useState(initialVerificationQueue)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  useEffect(() => {
    const fetchLiveVerifications = async () => {
      try {
        const res = await wahaApi.conversations()
        const convs = res.data || []
        const waItems: any[] = []

        convs.forEach((c: any) => {
          if (c.pdf_received || c.cv_media_url || c.collected_name) {
            const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
            waItems.push({
              id: `wa-ver-${c.phone}`,
              name,
              docType: c.pdf_received ? 'NIC + Degree Certificate (PDF CV Verified)' : 'Identity & Credential Verification',
              submitted: 'Recently via WhatsApp',
              status: c.pdf_received ? 'Verified' : 'Pending',
              nic: `WA-${c.phone.slice(-9)}`,
            })
          }
        })

        if (waItems.length > 0) {
          setList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const filteredNew = waItems.filter((item) => !existingIds.has(item.id))
            return [...filteredNew, ...prev]
          })
        }
      } catch (_) {}
    }

    fetchLiveVerifications()
  }, [])

  const handleDecision = (candidateId: string, status: 'Verified' | 'Rejected', notes: string) => {
    setList((prev) => prev.map((item) => (item.id === candidateId ? { ...item, status } : item)))
  }

  return (

    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Candidate Verification Queue
        </h1>
        <p className="text-sm text-muted">Review submitted national identity cards, police certificates, and educational qualifications.</p>
      </div>


      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-xs font-semibold text-muted uppercase tracking-wider">
              <th className="p-4">Candidate</th>
              <th className="p-4">Document Types</th>
              <th className="p-4">NIC / Reg No</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-surface-2/40 transition-colors">
                <td className="p-4 font-semibold text-foreground">{item.name}</td>
                <td className="p-4 text-muted">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span>{item.docType}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-foreground">{item.nic}</td>
                <td className="p-4 text-muted">{item.submitted}</td>
                <td className="p-4">
                  <span
                    className={
                      item.status === 'Pending'
                        ? 'badge-pending font-semibold px-2.5 py-1 text-xs'
                        : item.status === 'Verified'
                        ? 'badge-verified font-semibold px-2.5 py-1 text-xs'
                        : 'badge-rejected font-semibold px-2.5 py-1 text-xs'
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedCandidate(item)
                        setIsReviewModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-surface-2 hover:bg-border text-foreground rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-border"
                      id={`inspect-doc-btn-${item.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'Verified', '')}
                      disabled={item.status === 'Verified'}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'Rejected', '')}
                      disabled={item.status === 'Rejected'}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VerificationReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        candidate={selectedCandidate}
        onDecision={handleDecision}
      />
    </div>
  )
}
