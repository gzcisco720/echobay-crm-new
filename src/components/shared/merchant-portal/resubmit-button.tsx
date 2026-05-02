'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resubmitApplication } from '@/lib/actions/application.actions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  applicationId: string
}

export function ResubmitButton({ applicationId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResubmit() {
    setLoading(true)
    setError(null)
    const result = await resubmitApplication(applicationId)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleResubmit}
        disabled={loading}
        className="w-fit"
      >
        {loading ? '提交中...' : '重新提交申请 Resubmit'}
      </Button>
    </div>
  )
}
