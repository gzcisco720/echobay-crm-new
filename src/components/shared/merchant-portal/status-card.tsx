'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'
import { useTranslations } from 'next-intl'

const STATUS_VARIANT: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft:         'outline',
  submitted:     'secondary',
  under_review:  'default',
  approved:      'default',
  rejected:      'destructive',
  requires_info: 'destructive',
}

interface Props {
  status: ApplicationStatus
  companyName: string
  submittedAt?: Date
}

export function StatusCard({ status, companyName, submittedAt }: Props) {
  const t = useTranslations('merchant.dashboard')
  const tStatus = useTranslations('status')

  const statusLabels: Record<ApplicationStatus, string> = {
    draft: tStatus('draft'),
    submitted: tStatus('submitted'),
    under_review: tStatus('underReview'),
    approved: tStatus('approved'),
    rejected: tStatus('rejected'),
    requires_info: tStatus('requiresInfo'),
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('applicationStatusTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900">{companyName}</p>
            {submittedAt && (
              <p className="text-zinc-500 text-xs mt-0.5">
                {t('submittedAt')} {submittedAt.toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge variant={STATUS_VARIANT[status]} className="text-sm px-3 py-1">
            {statusLabels[status]}
          </Badge>
        </div>

        {status === 'requires_info' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {t('requiresInfoAlert')}
          </div>
        )}
        {status === 'approved' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            {t('approvedAlert')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
