'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelInvitation } from '@/lib/actions/invitation.actions'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const t = useTranslations('admin.invitations')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm(t('confirmCancel'))) return
    setLoading(true)
    await cancelInvitation(invitationId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? t('cancelling') : t('cancelInvitation')}
    </Button>
  )
}
