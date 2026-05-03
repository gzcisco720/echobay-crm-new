'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPromotion } from '@/lib/actions/promotion.actions'
import type { PromotionLevel } from '@/lib/db/models/promotion.model'

interface Props {
  userId: string
  brandId: string
  storeId?: string
}

export function PromotionForm({ userId, brandId, storeId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<PromotionLevel>('brand')
  const [promotionRule, setPromotionRule] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exclusions, setExclusions] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createPromotion({
      userId, brandId,
      storeId: level === 'store' && storeId ? storeId : undefined,
      level, promotionRule,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      exclusions: exclusions || undefined,
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push('/merchant/promotions')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="level">推广级别</Label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value as PromotionLevel)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="brand">品牌级（适用所有门店）</option>
          {storeId && <option value="store">门店级（仅适用本门店）</option>}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="promotionRule">推广规则</Label>
        <Textarea
          id="promotionRule"
          value={promotionRule}
          onChange={(e) => setPromotionRule(e.target.value)}
          placeholder="例如：全场九折，满$100 送$10 礼券..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fromDate">开始日期</Label>
          <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="toDate">结束日期</Label>
          <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exclusions">排除条款（可选）</Label>
        <Textarea
          id="exclusions"
          value={exclusions}
          onChange={(e) => setExclusions(e.target.value)}
          placeholder="例如：不适用于已打折商品..."
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? '提交中...' : '创建推广活动'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/merchant/promotions')}>取消</Button>
      </div>
    </form>
  )
}
