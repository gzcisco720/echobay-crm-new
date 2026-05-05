'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUploaderClient } from './document-uploader-client'
import { useTranslations } from 'next-intl'

interface PendingRequest {
  _id: string
  type: string
}

interface PendingRequestCardProps {
  request: PendingRequest
  applicationId: string
  userId: string
}

export function PendingRequestCard({
  request,
  applicationId,
  userId,
}: PendingRequestCardProps): React.JSX.Element {
  const t = useTranslations('merchant.documents')
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-amber-800">{request.type}</CardTitle>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#0BB5C4] hover:underline"
          >
            {expanded ? t('collapse') : t('expandUpload')}
          </button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <DocumentUploaderClient
            applicationId={applicationId}
            userId={userId}
            requestId={request._id}
            defaultType={request.type}
            onSuccess={() => { setExpanded(false); router.refresh() }}
          />
        </CardContent>
      )}
    </Card>
  )
}
