import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'

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

const FILTER_STATUSES = [
  { key: 'submitted', label: '已提交' },
  { key: 'under_review', label: '审核中' },
  { key: 'requires_info', label: '需补充' },
  { key: 'approved', label: '已批准' },
  { key: 'rejected', label: '已拒绝' },
] as const

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await auth()
  await connectDB()

  const { status: statusFilter } = await searchParams
  const validStatuses = Object.keys(STATUS_LABEL)
  const activeFilter = statusFilter && validStatuses.includes(statusFilter)
    ? statusFilter as ApplicationStatus
    : undefined

  const query = activeFilter ? { status: activeFilter } : {}
  const apps = await MerchantApplicationModel.find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  const allApps = await MerchantApplicationModel.find()
    .select('status')
    .lean()

  const counts: Record<string, number> = {}
  for (const s of validStatuses) {
    counts[s] = allApps.filter((a) => a.status === s).length
  }

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">申请审核 · Applications</h1>
        {activeFilter && (
          <Link href="/admin/applications" className="text-sm text-zinc-400 hover:text-zinc-600">
            清除过滤 ✕
          </Link>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {FILTER_STATUSES.map(({ key, label }) => {
          const isActive = activeFilter === key
          return (
            <Link
              key={key}
              href={isActive ? '/admin/applications' : `/admin/applications?status=${key}`}
              className={`rounded-lg p-3 text-center border transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                {counts[key] ?? 0}
              </p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-zinc-300' : 'text-zinc-400'}`}>
                {label}
              </p>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {activeFilter ? `${STATUS_LABEL[activeFilter]} (${apps.length})` : `全部申请 (${apps.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无{activeFilter ? `「${STATUS_LABEL[activeFilter]}」` : ''}申请。</p>
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
