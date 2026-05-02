import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApplicationReviewPanel } from '@/components/shared/admin/application-review-panel'
import { AdminNotesForm } from '@/components/shared/admin/admin-notes-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', submitted: '已提交', under_review: '审核中',
  approved: '已批准', rejected: '已拒绝', requires_info: '需补充',
}

export default async function AdminApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findById(id).lean().exec()
  if (!app) notFound()

  const merchant = await UserModel.findById(app.userId).select('email name').lean().exec()

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/applications" className="text-zinc-400 hover:text-zinc-600 text-sm">
          ← 返回列表
        </Link>
        <h1 className="text-xl font-bold flex-1">{app.registeredCompanyName}</h1>
        <Badge>{STATUS_LABEL[app.status] ?? app.status}</Badge>
      </div>

      {app.requiresInfoReason && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>需补充说明：</strong> {app.requiresInfoReason}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">审核操作</CardTitle></CardHeader>
        <CardContent>
          <ApplicationReviewPanel
            applicationId={id}
            currentStatus={app.status}
            adminUserId={session!.user.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">商户账号</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">邮箱</p><p className="font-medium">{merchant?.email ?? '—'}</p></div>
          <div><p className="text-zinc-400 text-xs">姓名</p><p className="font-medium">{merchant?.name ?? '—'}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">公司信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">注册公司名称</p><p className="font-medium">{app.registeredCompanyName}</p></div>
          <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
          <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
          <div><p className="text-zinc-400 text-xs">注册地址</p><p className="font-medium">{app.registeredAddress}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">品牌信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">品牌英文名</p><p className="font-medium">{app.brandNameEnglish}</p></div>
          {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">品牌中文名</p><p className="font-medium">{app.brandNameChinese}</p></div>}
          <div className="col-span-2"><p className="text-zinc-400 text-xs">品牌介绍</p><p className="text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p></div>
          <div><p className="text-zinc-400 text-xs">澳洲门店数</p><p className="font-medium">{app.storesInAustralia}</p></div>
          <div><p className="text-zinc-400 text-xs">参与门店数</p><p className="font-medium">{app.storesToList}</p></div>
          <div><p className="text-zinc-400 text-xs">主营类目</p><p className="font-medium">{app.mainCategories.join(', ')}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">联系人</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-400 text-xs font-medium mb-1">主联系人</p>
            <p className="font-medium">{app.primaryContact.name}</p>
            <p className="text-zinc-500">{app.primaryContact.email}</p>
            <p className="text-zinc-500">{app.primaryContact.phone}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-medium mb-1">财务联系人</p>
            <p className="font-medium">{app.financeContact.name}</p>
            <p className="text-zinc-500">{app.financeContact.position}</p>
            <p className="text-zinc-500">{app.financeContact.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">支付方式</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {app.paymentMethods.map((m) => (
            <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">内部备注 Admin Notes（仅 Admin 可见）</CardTitle></CardHeader>
        <CardContent>
          <AdminNotesForm applicationId={id} initialNote={app.adminNotes} />
        </CardContent>
      </Card>
    </div>
  )
}
