'use client'
import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBrand } from '@/lib/actions/brand.actions'

type BrandStatus = 'active' | 'inactive' | 'suspended'

const STATUS_OPTIONS: { value: BrandStatus; label: string }[] = [
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '停用' },
  { value: 'suspended', label: '暂停' },
]

export function BrandStatusSelect({ brandId, currentStatus }: { brandId: string; currentStatus: BrandStatus }): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BrandStatus>(currentStatus)

  async function handleChange(newStatus: BrandStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBrand(brandId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error('状态更新失败: ' + result.error); return }
    setStatus(newStatus)
    toast.success('品牌状态已更新')
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BrandStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label="品牌状态"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
