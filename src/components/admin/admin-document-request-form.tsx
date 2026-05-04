'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestDocumentAction } from '@/lib/actions/document.actions'

interface AdminDocumentRequestFormProps {
  applicationId: string
  adminUserId: string
}

export function AdminDocumentRequestForm({
  applicationId,
  adminUserId,
}: AdminDocumentRequestFormProps): React.JSX.Element {
  const router = useRouter()
  const [type, setType] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!type.trim()) { setError('请填写所需文件说明'); return }
    setError(null)
    startTransition(async () => {
      const result = await requestDocumentAction(applicationId, type.trim(), adminUserId)
      if (result.success) {
        setType('')
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="例如：请提供最近 3 个月银行对账单"
          className="h-8 text-sm flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />
        <Button onClick={handleSubmit} disabled={isPending} size="sm">
          {isPending ? '发送中…' : '发送请求'}
        </Button>
      </div>
      {error != null && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
