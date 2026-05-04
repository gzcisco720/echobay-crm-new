'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteHeroProduct } from '@/lib/actions/hero-product.actions'
import { DeleteButton } from '@/components/shared/delete-button'

export function DeleteHeroProductButton({ productId, productName }: { productId: string; productName: string }): React.JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deleteHeroProduct(productId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('特色产品已删除')
    router.refresh()
  }

  return (
    <DeleteButton
      label="删除"
      description={`特色产品「${productName}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
