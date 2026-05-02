import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResubmitButton } from '@/components/shared/merchant-portal/resubmit-button'

export default async function ApplicationPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id }).lean().exec()

  if (!app) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-4">申请详情 · Application</h1>
        <p className="text-zinc-500">暂无申请记录。</p>
      </div>
    )
  }

  const canEdit = ['submitted', 'requires_info'].includes(app.status)

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">申请详情 · Application</h1>
        <Badge>{app.status}</Badge>
      </div>

      {app.requiresInfoReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>需补充说明：</strong> {app.requiresInfoReason}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">公司信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">注册公司名称</p><p className="font-medium">{app.registeredCompanyName}</p></div>
          <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
          <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
          <div><p className="text-zinc-400 text-xs">注册地址</p><p className="font-medium">{app.registeredAddress}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">品牌信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">品牌英文名</p><p className="font-medium">{app.brandNameEnglish}</p></div>
          {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">品牌中文名</p><p className="font-medium">{app.brandNameChinese}</p></div>}
          <div className="col-span-2"><p className="text-zinc-400 text-xs">品牌介绍</p><p className="font-medium leading-relaxed">{app.brandIntroductionEnglish}</p></div>
        </CardContent>
      </Card>

      {app.status === 'requires_info' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-3">
          <p className="text-amber-800 text-sm font-medium">
            请根据上方说明补充资料后，点击下方按钮重新提交。
          </p>
          <ResubmitButton applicationId={app._id.toString()} />
        </div>
      )}
      {canEdit && app.status !== 'requires_info' && (
        <p className="text-zinc-500 text-sm">
          如需修改申请信息，请联系 EchoBay 团队：
          <a href="mailto:support@echobay.com.au" className="text-zinc-900 underline ml-1">
            support@echobay.com.au
          </a>
        </p>
      )}
    </div>
  )
}
