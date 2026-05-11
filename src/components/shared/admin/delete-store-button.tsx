'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteStore } from '@/lib/actions/store.actions'
import { DeleteButton } from '@/components/shared/delete-button'
import { useTranslations } from 'next-intl'

export function DeleteStoreButton({ storeId, storeName }: { storeId: string; storeName: string }): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.stores')

  async function handleConfirm() {
    const result = await deleteStore(storeId)
    if (!result.success) { toast.error(t('deleteFailed') + result.error); return }
    toast.success(t('deleted'))
    router.push('/admin/stores')
    router.refresh()
  }

  return (
    <DeleteButton
      label={t('deleteLabel')}
      description={t('deleteDescription', { name: storeName })}
      onConfirm={handleConfirm}
    />
  )
}
