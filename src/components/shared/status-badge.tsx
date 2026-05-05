'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type KnownStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_info'

const STATUS_STYLES: Record<KnownStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  requires_info: 'bg-amber-100 text-amber-700',
}

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const t = useTranslations('status')
  const key = status as KnownStatus

  const labelMap: Record<KnownStatus, string> = {
    draft: t('draft'),
    submitted: t('submitted'),
    under_review: t('underReview'),
    approved: t('approved'),
    rejected: t('rejected'),
    requires_info: t('requiresInfo'),
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-600',
      )}
    >
      {labelMap[key] ?? status}
    </span>
  )
}
