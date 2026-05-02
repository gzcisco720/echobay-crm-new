import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', submitted: '已提交', under_review: '审核中',
  approved: '已批准', rejected: '已拒绝', requires_info: '需补充',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline', submitted: 'default', under_review: 'default',
  approved: 'secondary', rejected: 'destructive', requires_info: 'destructive',
}

export default async function AdminDashboardPage() {
  await auth()
  await connectDB()

  const apps = await MerchantApplicationModel.find()
    .select('status registeredCompanyName createdAt')
    .sort({ createdAt: -1 })
    .lean()

  const total = apps.length
  const submitted = apps.filter((a) => a.status === 'submitted').length
  const under_review = apps.filter((a) => a.status === 'under_review').length
  const approved = apps.filter((a) => a.status === 'approved').length
  const rejected = apps.filter((a) => a.status === 'rejected').length
  const requires_info = apps.filter((a) => a.status === 'requires_info').length

  const totalInvitations = await MerchantInvitationModel.countDocuments()
  const pendingInvitations = await MerchantInvitationModel.countDocuments({ status: 'pending' })

  const recent = apps.slice(0, 8)

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <h1 className="text-xl font-bold">数据概览 · Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-zinc-900">{total}</p>
            <p className="text-sm text-zinc-400 mt-1">总申请数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{submitted + under_review}</p>
            <p className="text-sm text-zinc-400 mt-1">待审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-green-600">{approved}</p>
            <p className="text-sm text-zinc-400 mt-1">已批准</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '需补充', value: requires_info, color: 'text-red-600' },
          { label: '已拒绝', value: rejected, color: 'text-zinc-400' },
          { label: '邀请（待使用）', value: `${pendingInvitations} / ${totalInvitations}`, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-zinc-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">最近申请</CardTitle>
            <Link href="/admin/applications" className="text-xs text-zinc-400 hover:text-zinc-600">查看全部 →</Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {recent.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无申请。</p>
          ) : (
            recent.map((app) => (
              <Link
                key={app._id.toString()}
                href={`/admin/applications/${app._id.toString()}`}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{app.registeredCompanyName}</p>
                  <p className="text-xs text-zinc-400">{new Date(app.createdAt).toLocaleDateString('zh-CN')}</p>
                </div>
                <Badge variant={STATUS_VARIANT[app.status] ?? 'outline'} className="text-xs">
                  {STATUS_LABEL[app.status] ?? app.status}
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
