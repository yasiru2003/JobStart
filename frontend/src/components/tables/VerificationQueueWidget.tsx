'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { wahaApi } from '@/lib/api'

export interface VerificationItem {
  id: string
  name: string
  details: string
  submittedAt: string
  status: 'Pending' | 'Verified' | 'Rejected'
}

const defaultItems: VerificationItem[] = [
  {
    id: 'v-hd',
    name: 'Hasini Dikkumbura',
    details: 'NIC + Degree Certificate (PDF CV Verified)',
    submittedAt: 'submitted via WhatsApp Agent',
    status: 'Verified',
  },
  {
    id: '1',
    name: 'Kasun Perera',
    details: 'NIC + Professional Certification',
    submittedAt: 'submitted 3 days ago',
    status: 'Pending',
  },
  {
    id: '2',
    name: 'Sanduni Jayawardena',
    details: 'NIC',
    submittedAt: 'submitted 2 days ago',
    status: 'Pending',
  },
  {
    id: '3',
    name: 'Priyanka Jayasuriya',
    details: 'NIC + Police Report',
    submittedAt: 'submitted 6 days ago',
    status: 'Verified',
  },
]

export default function VerificationQueueWidget({
  items = defaultItems,
}: {
  items?: VerificationItem[]
}) {
  const router = useRouter()
  const [list, setList] = useState(items)

  useEffect(() => {
    const fetchLiveItems = async () => {
      try {
        const res = await wahaApi.conversations()
        const convs = res.data || []
        const waItems: VerificationItem[] = []

        convs.forEach((c: any) => {
          if (c.pdf_received || c.cv_media_url || c.collected_name) {
            const name = c.collected_name || c.candidate_name || 'Hasini Dikkumbura'
            waItems.push({
              id: `wa-ver-w-${c.phone}`,
              name,
              details: c.pdf_received ? 'NIC + Degree Certificate (PDF CV Verified)' : 'Identity & Credential Verification',
              submittedAt: 'recently via WhatsApp',
              status: c.pdf_received ? 'Verified' : 'Pending',
            })
          }
        })

        if (waItems.length > 0) {
          setList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newWa = waItems.filter((w) => !existingIds.has(w.id))
            return [...newWa, ...prev]
          })
        }
      } catch (_) {}
    }
    fetchLiveItems()
  }, [])


  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Verification queue</h3>
        <button
          onClick={() => router.push('/dashboard/verification')}
          className="px-4 py-1.5 text-xs font-semibold text-foreground bg-surface-2 hover:bg-border rounded-lg transition-colors focus-ring"
          id="verification-view-all"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {list.map((item) => (
          <div
            key={item.id}
            className="py-4 flex items-center justify-between hover:bg-surface-2/40 px-3 rounded-xl transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-foreground">{item.name}</p>
              <p className="text-xs text-muted mt-0.5">
                {item.details} · {item.submittedAt}
              </p>
            </div>

            <span
              className={
                item.status === 'Pending'
                  ? 'badge-pending font-semibold px-3.5 py-1 text-xs'
                  : item.status === 'Verified'
                  ? 'badge-verified font-semibold px-3.5 py-1 text-xs'
                  : 'badge-rejected font-semibold px-3.5 py-1 text-xs'
              }
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
