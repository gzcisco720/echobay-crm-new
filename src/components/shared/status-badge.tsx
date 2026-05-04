import React from 'react'
import { cn } from '@/lib/utils'

type KnownStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_info'

const STATUS_STYLES: Record<KnownStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  requires_info: 'bg-amber-100 text-amber-700',
}

const STATUS_LABEL: Record<KnownStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已批准',
  rejected: '已拒绝',
  requires_info: '需补充',
}

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const key = status as KnownStatus
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-600',
      )}
    >
      {STATUS_LABEL[key] ?? status}
    </span>
  )
}
