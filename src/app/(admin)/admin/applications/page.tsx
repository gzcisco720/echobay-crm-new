import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  submitted: 'default',
  under_review: 'default',
  approved: 'secondary',
  rejected: 'destructive',
  requires_info: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已批准',
  rejected: '已拒绝',
  requires_info: '需补充',
}

export default async function AdminApplicationsPage() {
  await auth()
  await connectDB()

  const apps = await MerchantApplicationModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
    .exec()

  const counts = {
    submitted: apps.filter((a) => a.status === 'submitted').length,
    under_review: apps.filter((a) => a.status === 'under_review').length,
    requires_info: apps.filter((a) => a.status === 'requires_info').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <h1 className="text-xl font-bold">申请审核 · Applications</h1>

      <div className="grid grid-cols-5 gap-3">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="bg-white border border-zinc-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-zinc-900">{count}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{STATUS_LABEL[status]}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">全部申请 All Applications ({apps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无申请。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {apps.map((app) => (
                <Link
                  key={app._id.toString()}
                  href={`/admin/applications/${app._id.toString()}`}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{app.registeredCompanyName}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      {app.reviewedAt && ` · 审核于 ${new Date(app.reviewedAt).toLocaleDateString('zh-CN')}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[app.status] ?? 'outline'}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
