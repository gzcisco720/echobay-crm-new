'use client'
import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updatePromotion } from '@/lib/actions/promotion.actions'

interface DefaultValues {
  promotionRule: string
  fromDate: string
  toDate: string
  exclusions: string
}

interface Props {
  promotionId: string
  defaultValues: DefaultValues
  cancelHref: string
  successRedirect: string
}

export function PromotionEditForm({ promotionId, defaultValues, cancelHref, successRedirect }: Props): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promotionRule, setPromotionRule] = useState(defaultValues.promotionRule)
  const [fromDate, setFromDate] = useState(defaultValues.fromDate)
  const [toDate, setToDate] = useState(defaultValues.toDate)
  const [exclusions, setExclusions] = useState(defaultValues.exclusions)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await updatePromotion(promotionId, {
      promotionRule,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      exclusions: exclusions || undefined,
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push(successRedirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="promotionRule">推广规则</Label>
        <Textarea id="promotionRule" value={promotionRule} onChange={(e) => setPromotionRule(e.target.value)} rows={3} required />
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
        <Textarea id="exclusions" value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={2} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存推广活动'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(cancelHref)}>取消</Button>
      </div>
    </form>
  )
}
