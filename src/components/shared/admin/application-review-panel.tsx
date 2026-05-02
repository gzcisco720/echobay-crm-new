'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateApplicationStatus } from '@/lib/actions/admin.actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'

interface Props {
  applicationId: string
  currentStatus: ApplicationStatus
  adminUserId: string
}

export function ApplicationReviewPanel({ applicationId, currentStatus, adminUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [infoReason, setInfoReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isReviewable = ['submitted', 'under_review', 'requires_info'].includes(currentStatus)

  async function handleAction(status: ApplicationStatus) {
    if (status === 'requires_info' && !showReasonInput) {
      setShowReasonInput(true)
      return
    }
    if (status === 'requires_info' && !infoReason.trim()) {
      setError('请填写需要补充的资料说明')
      return
    }
    setLoading(true)
    setError(null)
    const result = await updateApplicationStatus(
      applicationId,
      status,
      status === 'requires_info' ? infoReason : undefined,
      adminUserId
    )
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  async function handleUnderReview() {
    setLoading(true)
    await updateApplicationStatus(applicationId, 'under_review', undefined, adminUserId)
    setLoading(false)
    router.refresh()
  }

  if (!isReviewable) {
    return (
      <p className="text-zinc-400 text-sm">
        当前状态 <strong>{currentStatus}</strong> 不可审核操作。
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStatus === 'submitted' && (
        <Button size="sm" variant="outline" onClick={handleUnderReview} disabled={loading}>
          标记为审核中
        </Button>
      )}

      {showReasonInput && (
        <div className="flex flex-col gap-2">
          <Label>请填写需要补充的说明</Label>
          <Textarea
            rows={3}
            placeholder="例如：请提供营业执照副本..."
            value={infoReason}
            onChange={(e) => setInfoReason(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleAction('approved')}
          disabled={loading}
        >
          ✓ 批准
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction('rejected')}
          disabled={loading}
        >
          ✗ 拒绝
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('requires_info')}
          disabled={loading}
        >
          需补充资料
        </Button>
      </div>
    </div>
  )
}
