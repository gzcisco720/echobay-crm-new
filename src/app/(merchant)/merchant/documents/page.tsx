import React from 'react'
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentListItem } from '@/components/shared/document-list-item'
import { PendingRequestCard } from '@/components/merchant/pending-request-card'
import { DocumentUploaderClient } from '@/components/merchant/document-uploader-client'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'

export default async function DocumentsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('_id status')
    .lean()
    .exec()

  if (!app) {
    return (
      <div className="w-full">
        <p className="text-zinc-500">请先提交申请。</p>
      </div>
    )
  }

  const rawDocs = await MerchantDocumentModel.find({ applicationId: app._id })
    .sort({ uploadedAt: -1 })
    .lean()
    .exec()

  const docs = rawDocs as (IMerchantDocument & { _id: { toString(): string } })[]
  const pendingRequests = docs.filter((d) => !d.cloudinaryPublicId)
  const uploadedDocs = docs.filter((d) => !!d.cloudinaryPublicId)

  return (
    <div className="w-full flex flex-col gap-5">
      {pendingRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700">待补充材料</h2>
          {pendingRequests.map((req) => (
            <PendingRequestCard
              key={req._id.toString()}
              request={req}
              applicationId={app._id.toString()}
              userId={session!.user.id}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">主动上传文件</CardTitle>
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
          <CardTitle className="text-base">已上传文件</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedDocs.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无已上传文件。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {uploadedDocs.map((doc) => (
                <DocumentListItem key={doc._id.toString()} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
