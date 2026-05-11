'use client'
import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBrand } from '@/lib/actions/brand.actions'
import { useTranslations } from 'next-intl'

type BrandStatus = 'active' | 'inactive' | 'suspended'

export function BrandStatusSelect({ brandId, currentStatus }: { brandId: string; currentStatus: BrandStatus }): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.brands')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BrandStatus>(currentStatus)

  const statusOptions: { value: BrandStatus; label: string }[] = [
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
    { value: 'suspended', label: t('suspended') },
  ]

  async function handleChange(newStatus: BrandStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBrand(brandId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error(t('updateStatusFailed') + result.error); return }
    setStatus(newStatus)
    toast.success(t('statusUpdated'))
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BrandStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label={t('brandStatus')}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
