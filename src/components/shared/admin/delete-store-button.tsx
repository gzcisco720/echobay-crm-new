'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteStore } from '@/lib/actions/store.actions'
import { DeleteButton } from '@/components/shared/delete-button'

export function DeleteStoreButton({ storeId, storeName }: { storeId: string; storeName: string }): JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deleteStore(storeId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('门店已删除')
    router.push('/admin/stores')
    router.refresh()
  }

  return (
    <DeleteButton
      label="删除门店"
      description={`门店「${storeName}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
