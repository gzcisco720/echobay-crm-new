'use client'
import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBankAccount } from '@/lib/actions/bank-account.actions'

type BankAccountStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended'

const STATUS_OPTIONS: { value: BankAccountStatus; label: string }[] = [
  { value: 'active', label: '已激活' },
  { value: 'inactive', label: '停用' },
  { value: 'pending_verification', label: '待核实' },
  { value: 'suspended', label: '暂停' },
]

export function BankAccountStatusSelect({ accountId, currentStatus }: { accountId: string; currentStatus: BankAccountStatus }): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BankAccountStatus>(currentStatus)

  async function handleChange(newStatus: BankAccountStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBankAccount(accountId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error('状态更新失败: ' + result.error); return }
    setStatus(newStatus)
    toast.success('账户状态已更新')
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BankAccountStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label="账户状态"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
