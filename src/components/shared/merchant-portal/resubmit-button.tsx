'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resubmitApplication } from '@/lib/actions/application.actions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

interface Props {
  applicationId: string
}

export function ResubmitButton({ applicationId }: Props) {
  const router = useRouter()
  const t = useTranslations('merchant.application')
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
        {loading ? t('resubmitting') : t('resubmit')}
      </Button>
    </div>
  )
}
