'use client'

import { useState } from 'react'
import { sendMerchantInvitation } from '@/lib/actions/invitation.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  adminUserId: string
  onSuccess: () => void
}

export function SendInvitationForm({ adminUserId, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setResult(null)
    const res = await sendMerchantInvitation(email, adminUserId)
    setLoading(false)
    if (res.success) {
      setResult({ success: true, message: `邀请已成功发送至 ${email}` })
      setEmail('')
      onSuccess()
    } else {
      setResult({ success: false, message: res.error })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-email">商家邮箱 Merchant Email</Label>
        <Input
          id="inv-email"
          type="email"
          placeholder="merchant@shop.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={loading || !email} className="w-fit">
        {loading ? '发送中...' : '发送邀请 Send Invitation'}
      </Button>
    </form>
  )
}
