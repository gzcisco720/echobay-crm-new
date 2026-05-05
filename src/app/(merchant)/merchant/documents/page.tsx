import React from 'react'
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentListItem } from '@/components/shared/document-list-item'
import { PendingRequestCard } from '@/components/merchant/pending-request-card'
import { DocumentUploaderClient } from '@/components/merchant/document-uploader-client'
import type { SerializableDoc } from '@/components/shared/document-list-item'
import { getTranslations } from 'next-intl/server'

export default async function DocumentsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  await connectDB()
  const t = await getTranslations('merchant.documents')
  const tCommon = await getTranslations('common')

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('_id status')
    .lean()
    .exec()

  if (!app) {
    return (
      <div className="w-full">
        <p className="text-zinc-500">{tCommon('noApplicationFirst')}</p>
      </div>
    )
  }

  const rawDocs = await MerchantDocumentModel.find({ applicationId: app._id })
    .sort({ uploadedAt: -1 })
    .lean()
    .exec()

  const docs: SerializableDoc[] = rawDocs.map((d) => ({
    _id: d._id.toString(),
    type: d.type,
    fileName: d.fileName,
    cloudinaryPublicId: d.cloudinaryPublicId,
    url: d.url,
    requestedBy: d.requestedBy?.toString() ?? null,
    uploadedAt: d.uploadedAt.toISOString(),
  }))

  const pendingRequests = docs.filter((d) => !d.cloudinaryPublicId)
  const uploadedDocs = docs.filter((d) => !!d.cloudinaryPublicId)

  return (
    <div className="w-full flex flex-col gap-5">
      {pendingRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700">{t('pendingRequests')}</h2>
          {pendingRequests.map((req) => (
            <PendingRequestCard
              key={req._id}
              request={req}
              applicationId={app._id.toString()}
              userId={session!.user.id}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('selfUpload')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploaderClient
            applicationId={app._id.toString()}
            userId={session!.user.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('uploadedFiles')}</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedDocs.length === 0 ? (
            <p className="text-zinc-400 text-sm">{t('noUploads')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {uploadedDocs.map((doc) => (
                <DocumentListItem key={doc._id} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
