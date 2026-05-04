'use client'

import React, { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadDocumentAction } from '@/lib/actions/document.actions'

interface DocumentUploaderClientProps {
  applicationId: string
  userId: string
  requestId?: string
  defaultType?: string
  onSuccess?: () => void
}

export function DocumentUploaderClient({
  applicationId,
  userId,
  requestId,
  defaultType = '',
  onSuccess,
}: DocumentUploaderClientProps): React.JSX.Element {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState(defaultType)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('请选择文件'); return }
    if (!type.trim()) { setError('请填写文件类别'); return }
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'echobay-crm/documents')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json() as { publicId?: string; url?: string; error?: string }

    if (!res.ok || !json.url || !json.publicId) {
      setError(json.error ?? '上传失败，请重试')
      return
    }

    startTransition(async () => {
      const result = await uploadDocumentAction({
        applicationId,
        userId,
        type: type.trim(),
        fileName: file.name,
        cloudinaryPublicId: json.publicId!,
        url: json.url!,
        requestId,
      })
      if (result.success) {
        if (fileRef.current) fileRef.current.value = ''
        setType(defaultType)
        router.refresh()
        onSuccess?.()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {requestId == null && (
        <div>
          <Label htmlFor="doc-type-new" className="text-xs text-zinc-500 mb-1 block">
            文件类别
          </Label>
          <Input
            id="doc-type-new"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="例如：营业执照、银行对账单"
            className="h-8 text-sm"
          />
        </div>
      )}
      <div>
        <Label htmlFor={`doc-file-${requestId ?? 'new'}`} className="text-xs text-zinc-500 mb-1 block">
          选择文件（PDF / Word / Excel / 图片，最大 20 MB）
        </Label>
        <input
          id={`doc-file-${requestId ?? 'new'}`}
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
          className="text-sm text-zinc-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
        />
      </div>
      {error != null && <p className="text-red-500 text-xs">{error}</p>}
      <Button onClick={handleUpload} disabled={isPending} size="sm" className="w-fit">
        {isPending ? '上传中…' : '上传文件'}
      </Button>
    </div>
  )
}
