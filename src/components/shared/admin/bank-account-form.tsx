'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBankAccount } from '@/lib/actions/bank-account.actions'

interface Props {
  brandId: string
  merchantApplicationId?: string
}

export function BankAccountForm({ brandId, merchantApplicationId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [bankName, setBankName] = useState('')
  const [bsb, setBsb] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createBankAccount({
      brandId, merchantApplicationId,
      accountNumber, accountName, bankName, bsb, isPrimary,
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.refresh()
    setAccountNumber(''); setAccountName(''); setBankName(''); setBsb(''); setIsPrimary(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accountName">账户名称</Label>
          <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. Test Co Pty Ltd" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bankName">银行名称</Label>
          <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. ANZ" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bsb">BSB</Label>
          <Input id="bsb" value={bsb} onChange={(e) => setBsb(e.target.value)} placeholder="e.g. 012-345" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accountNumber">账户号码</Label>
          <Input id="accountNumber" type="password" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="账户号码（加密存储）" required />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPrimary" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="rounded" />
        <Label htmlFor="isPrimary" className="cursor-pointer">设为主账户</Label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <Button type="submit" disabled={loading} size="sm">{loading ? '添加中...' : '添加银行账户'}</Button>
    </form>
  )
}
