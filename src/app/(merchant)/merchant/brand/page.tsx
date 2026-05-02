import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function BrandPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('status brandNameEnglish brandNameChinese brandIntroductionEnglish website socialMediaAccounts logoUploads mainCategories storesInAustralia storesToList')
    .lean()
    .exec()

  if (!app || app.status !== 'approved') {
    return (
      <div className="max-w-2xl flex flex-col gap-5">
        <h1 className="text-xl font-bold tracking-tight">品牌信息 · Brand</h1>
        <Card>
          <CardContent className="pt-6 text-center text-zinc-400 text-sm py-12">
            <p className="text-2xl mb-3">&#x23F3;</p>
            <p className="font-medium text-zinc-600">品牌信息审核中</p>
            <p className="mt-1">申请批准后，您的品牌信息将在此处展示。</p>
            <p className="text-xs mt-1 text-zinc-400">Current status: <Badge variant="outline">{app?.status ?? 'unknown'}</Badge></p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <h1 className="text-xl font-bold tracking-tight">品牌信息 · Brand</h1>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{app.brandNameEnglish}</CardTitle>
              {app.brandNameChinese && <p className="text-zinc-500 text-sm mt-0.5">{app.brandNameChinese}</p>}
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">已批准 Approved</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p>
          {app.website && (
            <div>
              <p className="text-xs text-zinc-400 mb-1">官网</p>
              <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-900 underline">{app.website}</a>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-zinc-400 text-xs">澳洲门店数</p><p className="font-medium">{app.storesInAustralia}</p></div>
            <div><p className="text-zinc-400 text-xs">参与门店数</p><p className="font-medium">{app.storesToList}</p></div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs mb-1.5">主营类目</p>
            <div className="flex flex-wrap gap-1.5">
              {app.mainCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
