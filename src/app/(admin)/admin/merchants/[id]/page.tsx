import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminMerchantDetailPage({ params }: Props) {
  const { id: userId } = await params
  await auth()
  await connectDB()

  const user = await UserModel.findById(userId).select('email name isActive createdAt').lean()
  if (!user || user.role === 'admin' || user.role === 'super_admin') notFound()

  const app = await MerchantApplicationModel.findOne({ userId, status: 'approved' })
    .lean()

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/merchants" className="text-zinc-400 hover:text-zinc-600 text-sm">
          ← 返回商户列表
        </Link>
        <h1 className="text-xl font-bold flex-1">
          {app?.brandNameEnglish ?? user.name}
        </h1>
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? '已激活' : '已停用'}
        </Badge>
      </div>

      {/* Account */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">账号信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">邮箱</p><p className="font-medium">{user.email}</p></div>
          <div><p className="text-zinc-400 text-xs">姓名</p><p className="font-medium">{user.name}</p></div>
          <div>
            <p className="text-zinc-400 text-xs">注册日期</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
          </div>
        </CardContent>
      </Card>

      {app ? (
        <>
          {/* Business */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">公司信息</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">注册公司名称</p><p className="font-medium">{app.registeredCompanyName}</p></div>
              {app.tradingName && <div><p className="text-zinc-400 text-xs">商业名称</p><p className="font-medium">{app.tradingName}</p></div>}
              <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
              <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
              <div className="col-span-2"><p className="text-zinc-400 text-xs">注册地址</p><p className="font-medium">{app.registeredAddress}</p></div>
            </CardContent>
          </Card>

          {/* Brand */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">品牌信息</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">品牌英文名</p><p className="font-medium">{app.brandNameEnglish}</p></div>
              {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">品牌中文名</p><p className="font-medium">{app.brandNameChinese}</p></div>}
              {app.website && <div className="col-span-2"><p className="text-zinc-400 text-xs">网站</p><p className="font-medium">{app.website}</p></div>}
              <div><p className="text-zinc-400 text-xs">澳洲门店数</p><p className="font-medium">{app.storesInAustralia}</p></div>
              <div><p className="text-zinc-400 text-xs">参与门店数</p><p className="font-medium">{app.storesToList}</p></div>
              <div className="col-span-2">
                <p className="text-zinc-400 text-xs">主营类目</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {app.mainCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">联系人</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">主联系人</p>
                <p className="font-medium">{app.primaryContact.name}</p>
                <p className="text-zinc-500">{app.primaryContact.position}</p>
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

          {/* Approval */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">审核信息</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">申请状态</p><p className="font-medium text-green-600">已批准</p></div>
              {app.reviewedAt && (
                <div><p className="text-zinc-400 text-xs">批准日期</p><p className="font-medium">{new Date(app.reviewedAt).toLocaleDateString('zh-CN')}</p></div>
              )}
              <div className="col-span-2">
                <Link
                  href={`/admin/applications/${app._id.toString()}`}
                  className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                >
                  查看完整申请详情 →
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-zinc-400 text-sm py-10">
            该商户暂无已批准的申请记录。
          </CardContent>
        </Card>
      )}
    </div>
  )
}
