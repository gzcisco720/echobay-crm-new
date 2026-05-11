'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteHeroProduct } from '@/lib/actions/hero-product.actions'
import { DeleteButton } from '@/components/shared/delete-button'
import { useTranslations } from 'next-intl'

export function DeleteHeroProductButton({ productId, productName }: { productId: string; productName: string }): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.heroProducts')

  async function handleConfirm() {
    const result = await deleteHeroProduct(productId)
    if (!result.success) { toast.error(t('deleteFailed') + result.error); return }
    toast.success(t('deleted'))
    router.refresh()
  }

  return (
    <DeleteButton
      label={t('deleteLabel')}
      description={t('deleteDescription', { name: productName })}
      onConfirm={handleConfirm}
    />
  )
}
