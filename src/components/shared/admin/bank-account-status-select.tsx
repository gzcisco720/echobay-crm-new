'use client'
import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBankAccount } from '@/lib/actions/bank-account.actions'
import { useTranslations } from 'next-intl'

type BankAccountStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended'

export function BankAccountStatusSelect({ accountId, currentStatus }: { accountId: string; currentStatus: BankAccountStatus }): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.brands')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BankAccountStatus>(currentStatus)

  const statusOptions: { value: BankAccountStatus; label: string }[] = [
    { value: 'active', label: t('accountActive') },
    { value: 'inactive', label: t('accountInactive') },
    { value: 'pending_verification', label: t('pendingVerification') },
    { value: 'suspended', label: t('accountSuspended') },
  ]

  async function handleChange(newStatus: BankAccountStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBankAccount(accountId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error(t('accountUpdateStatusFailed') + result.error); return }
    setStatus(newStatus)
    toast.success(t('accountStatusUpdated'))
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BankAccountStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label={t('accountStatusLabel')}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
