'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelInvitation } from '@/lib/actions/invitation.actions'
import { Button } from '@/components/ui/button'

export function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('确认取消此邀请？该操作不可恢复。')) return
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
      {loading ? '取消中...' : '取消'}
    </Button>
  )
}
