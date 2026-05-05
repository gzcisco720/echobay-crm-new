import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import { ClipboardList, CheckCircle, Clock, AlertCircle, XCircle, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getApplicationTrend, getInvitationFunnel } from '@/lib/actions/dashboard.actions'
import { ApplicationTrendChart } from '@/components/admin/charts/application-trend-chart'
import { ApplicationStatusChart } from '@/components/admin/charts/application-status-chart'
import { InvitationFunnelChart } from '@/components/admin/charts/invitation-funnel-chart'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  await auth()
  await connectDB()
  const t = await getTranslations('admin.dashboard')

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

  const [trendResult, funnelResult] = await Promise.all([
    getApplicationTrend(12),
    getInvitationFunnel(),
  ])
  const trendData = trendResult.success ? trendResult.data : []
  const funnelData = funnelResult.success
    ? funnelResult.data
    : { sent: 0, applied: 0, approved: 0 }

  const stats = [
    { label: t('totalApplications'), value: total, icon: ClipboardList, iconBg: 'bg-blue-50 text-[#0BB5C4]' },
    { label: t('pending'), value: submitted + under_review, icon: Clock, iconBg: 'bg-amber-50 text-amber-600' },
    { label: t('approved'), value: approved, icon: CheckCircle, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: t('requiresReject'), value: `${requires_info} / ${rejected}`, icon: AlertCircle, iconBg: 'bg-red-50 text-red-500' },
    { label: t('invitationsSent'), value: totalInvitations, icon: Mail, iconBg: 'bg-purple-50 text-purple-600' },
    { label: t('invitationsPending'), value: pendingInvitations, icon: XCircle, iconBg: 'bg-slate-50 text-slate-500' },
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

      {/* Charts row 1: Trend (2/3) + Donut (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              每周申请量（最近 12 周）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">申请状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationStatusChart
              counts={{ submitted, under_review, approved, rejected, requires_info }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Funnel full width */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800">邀请转化漏斗</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationFunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800">{t('recentApplications')}</CardTitle>
            <Link href="/admin/applications" className="text-xs text-[#0BB5C4] hover:underline">{t('recentApplications')}</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('companyName')}</TableHead>
                <TableHead>{t('submitDate')}</TableHead>
                <TableHead>Status</TableHead>
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
