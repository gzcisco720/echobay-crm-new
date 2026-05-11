'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePromotion } from '@/lib/actions/promotion.actions'
import { DeleteButton } from '@/components/shared/delete-button'
import { useTranslations } from 'next-intl'

interface Props {
  promotionId: string
  promotionRule: string
  redirectTo?: string
}

export function DeletePromotionButton({ promotionId, promotionRule, redirectTo }: Props): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.promotions')

  async function handleConfirm() {
    const result = await deletePromotion(promotionId)
    if (!result.success) { toast.error(t('deleteFailed') + result.error); return }
    toast.success(t('deleted'))
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  const shortRule = promotionRule.length > 30 ? promotionRule.slice(0, 30) + '…' : promotionRule

  return (
    <DeleteButton
      label={t('deleteLabel')}
      description={t('deleteDescription', { name: shortRule })}
      onConfirm={handleConfirm}
    />
  )
}
