'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPromotion } from '@/lib/actions/promotion.actions'
import type { PromotionLevel } from '@/lib/db/models/promotion.model'
import { useTranslations } from 'next-intl'

interface Props {
  userId: string
  brandId: string
  storeId?: string
}

export function PromotionForm({ userId, brandId, storeId }: Props) {
  const router = useRouter()
  const t = useTranslations('merchant.promotions')
  const tCommon = useTranslations('common')
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
        <Label htmlFor="level">{t('promotionLevel')}</Label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value as PromotionLevel)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="brand">{t('brandLevel')}</option>
          {storeId && <option value="store">{t('storeLevel')}</option>}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="promotionRule">{t('promotionRule')}</Label>
        <Textarea
          id="promotionRule"
          value={promotionRule}
          onChange={(e) => setPromotionRule(e.target.value)}
          placeholder={t('promotionRulePlaceholder')}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fromDate">{t('startDate')}</Label>
          <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="toDate">{t('endDate')}</Label>
          <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exclusions">{t('exclusions')}</Label>
        <Textarea
          id="exclusions"
          value={exclusions}
          onChange={(e) => setExclusions(e.target.value)}
          placeholder={t('exclusionsPlaceholder')}
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? t('submitting') : t('createPromotion')}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/merchant/promotions')}>{tCommon('cancel')}</Button>
      </div>
    </form>
  )
}
