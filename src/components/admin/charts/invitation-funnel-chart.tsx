import React from 'react'

interface FunnelData {
  sent: number
  applied: number
  approved: number
}

interface InvitationFunnelChartProps {
  data: FunnelData
}

export function InvitationFunnelChart({ data }: InvitationFunnelChartProps): React.JSX.Element {
  const { sent, applied, approved } = data
  const appliedPct = sent > 0 ? Math.round((applied / sent) * 100) : 0
  const approvedPct = sent > 0 ? Math.round((approved / sent) * 100) : 0

  const rows = [
    { label: '已发送邀请', value: sent, pct: 100, color: 'bg-[#0BB5C4]' },
    { label: '已提交申请', value: applied, pct: appliedPct, color: 'bg-[#1B3F72]' },
    { label: '已批准', value: approved, pct: approvedPct, color: 'bg-emerald-500' },
  ]

  return (
    <div className="flex flex-col gap-3 max-w-lg">
      {rows.map(({ label, value, pct, color }) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="text-xs font-semibold text-slate-800">
              {value} <span className="text-zinc-400 font-normal">({pct}%)</span>
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
