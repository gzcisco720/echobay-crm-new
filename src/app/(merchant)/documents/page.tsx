import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DocumentsPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('_id status')
    .lean()
    .exec()

  const documents = app
    ? await MerchantDocumentModel.find({ applicationId: app._id }).lean().exec()
    : []

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <h1 className="text-xl font-bold tracking-tight">文件上传 · Documents</h1>

      {!app && <p className="text-zinc-500">请先提交申请。</p>}

      {app && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">已上传文件 Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-zinc-400 text-sm">暂无上传文件。如 Admin 要求补充资料，将在此处显示。</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {documents.map((doc) => (
                    <li key={doc._id.toString()} className="flex items-center justify-between text-sm p-2 bg-zinc-50 rounded border border-zinc-100">
                      <span>{doc.fileName}</span>
                      <span className="text-zinc-400 text-xs">{doc.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <p className="text-zinc-500 text-sm">
            如需上传补充文件，请联系 EchoBay 团队获取上传指引。
          </p>
        </>
      )}
    </div>
  )
}
