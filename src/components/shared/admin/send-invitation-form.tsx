'use client'

import { useState } from 'react'
import { sendMerchantInvitation } from '@/lib/actions/invitation.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

interface Props {
  adminUserId: string
}

export function SendInvitationForm({ adminUserId }: Props) {
  const t = useTranslations('admin.invitations')
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
      setResult({ success: true, message: t('successMsg', { email }) })
      setEmail('')
    } else {
      setResult({ success: false, message: res.error })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-email">{t('emailLabel')}</Label>
        <Input
          id="inv-email"
          type="email"
          placeholder={t('emailPlaceholder')}
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
        {loading ? t('sending') : t('send')}
      </Button>
    </form>
  )
}
