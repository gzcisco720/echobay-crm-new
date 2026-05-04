'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePromotion } from '@/lib/actions/promotion.actions'
import { DeleteButton } from '@/components/shared/delete-button'

interface Props {
  promotionId: string
  promotionRule: string
  redirectTo?: string
}

export function DeletePromotionButton({ promotionId, promotionRule, redirectTo }: Props): React.JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deletePromotion(promotionId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('推广活动已删除')
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  const shortRule = promotionRule.length > 30 ? promotionRule.slice(0, 30) + '…' : promotionRule

  return (
    <DeleteButton
      label="删除"
      description={`推广活动「${shortRule}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
