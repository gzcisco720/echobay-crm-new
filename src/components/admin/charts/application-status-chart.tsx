'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslations } from 'next-intl'

interface StatusCounts {
  submitted: number
  under_review: number
  approved: number
  rejected: number
  requires_info: number
}

interface ApplicationStatusChartProps {
  counts: StatusCounts
}

const STATUS_KEYS_CONFIG = [
  { key: 'approved' as const, statusKey: 'approved' as const, color: '#10b981' },
  { key: 'submitted' as const, statusKey: 'submitted' as const, color: '#0BB5C4' },
  { key: 'under_review' as const, statusKey: 'underReview' as const, color: '#3b82f6' },
  { key: 'requires_info' as const, statusKey: 'requiresInfo' as const, color: '#f59e0b' },
  { key: 'rejected' as const, statusKey: 'rejected' as const, color: '#ef4444' },
]

export function ApplicationStatusChart({ counts }: ApplicationStatusChartProps): React.JSX.Element {
  const tStatus = useTranslations('status')
  const tCommon = useTranslations('common')
  const tDashboard = useTranslations('admin.dashboard')

  const data = STATUS_KEYS_CONFIG
    .map(({ key, statusKey, color }) => ({ name: tStatus(statusKey), value: counts[key], color }))
    .filter((d) => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-zinc-400 text-sm">
        {tCommon('noData')}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={64}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-zinc-400">{tDashboard('totalLabel')}</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-zinc-500">{name}</span>
            </div>
            <span className="text-xs font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
