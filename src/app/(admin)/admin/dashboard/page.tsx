import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Clock, AlertCircle, XCircle, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  await auth()
  await connectDB()

  const apps = await MerchantApplicationModel.find()
    .select('status registeredCompanyName createdAt')
    .sort({ createdAt: -1 })
    .lean()
    .exec()

  const total = apps.length
  const submitted = apps.filter((a) => a.status === 'submitted').length
  const under_review = apps.filter((a) => a.status === 'under_review').length
  const approved = apps.filter((a) => a.status === 'approved').length
  const rejected = apps.filter((a) => a.status === 'rejected').length
  const requires_info = apps.filter((a) => a.status === 'requires_info').length

  const totalInvitations = await MerchantInvitationModel.countDocuments().exec()
  const pendingInvitations = await MerchantInvitationModel.countDocuments({ status: 'pending' }).exec()

  const recent = apps.slice(0, 10)

  const stats = [
    { label: '总申请数', value: total, icon: ClipboardList, iconBg: 'bg-blue-50 text-[#0BB5C4]' },
    { label: '待审核', value: submitted + under_review, icon: Clock, iconBg: 'bg-amber-50 text-amber-600' },
    { label: '已批准', value: approved, icon: CheckCircle, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: '需补充 / 拒绝', value: `${requires_info} / ${rejected}`, icon: AlertCircle, iconBg: 'bg-red-50 text-red-500' },
    { label: '已发送邀请', value: totalInvitations, icon: Mail, iconBg: 'bg-purple-50 text-purple-600' },
    { label: '邀请待使用', value: pendingInvitations, icon: XCircle, iconBg: 'bg-slate-50 text-slate-500' },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, iconBg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800">最近申请</CardTitle>
            <Link href="/admin/applications" className="text-xs text-[#0BB5C4] hover:underline">查看全部 →</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>公司名称</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-slate-400 py-8" colSpan={3}>暂无申请</TableCell>
                </TableRow>
              ) : (
                recent.map((app) => (
                  <TableRow key={app._id.toString()}>
                    <TableCell>
                      <Link
                        href={`/admin/applications/${app._id.toString()}`}
                        className="font-medium text-slate-900 hover:text-[#0BB5C4] transition-colors"
                      >
                        {app.registeredCompanyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
