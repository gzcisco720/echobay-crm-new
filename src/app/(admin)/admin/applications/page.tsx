import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'
import { ApplicationsSearch } from '@/components/shared/admin/applications-search'
import { Pagination } from '@/components/shared/admin/pagination'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const STATUS_KEYS = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_info']

const FILTER_STATUS_KEYS = [
  'submitted',
  'under_review',
  'requires_info',
  'approved',
  'rejected',
] as const

interface Props {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await auth()
  await connectDB()
  const t = await getTranslations('admin.applications')

  const { status: statusFilter, q: searchQuery, page: pageParam } = await searchParams
  const trimmedQuery = searchQuery?.trim() ?? ''
  const validStatuses = STATUS_KEYS
  const activeFilter = statusFilter && validStatuses.includes(statusFilter)
    ? statusFilter as ApplicationStatus
    : undefined
  const pageNum = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const query: Record<string, unknown> = {}
  if (activeFilter) query.status = activeFilter
  if (trimmedQuery) {
    query.registeredCompanyName = { $regex: trimmedQuery, $options: 'i' }
  }

  const total = await MerchantApplicationModel.countDocuments(query)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(pageNum, totalPages)

  const apps = await MerchantApplicationModel.find(query)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean()

  const userIds = apps.map((a) => a.userId)
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('_id email')
    .lean()
  const emailMap = new Map(users.map((u) => [u._id.toString(), u.email]))

  const allApps = await MerchantApplicationModel.find()
    .select('status')
    .lean()

  const counts: Record<string, number> = {}
  for (const s of validStatuses) {
    counts[s] = allApps.filter((a) => a.status === s).length
  }

  function buildHref(params: { status?: string; q?: string; page?: number }): string {
    const p = new URLSearchParams()
    if (params.status) p.set('status', params.status)
    if (params.q) p.set('q', params.q)
    if (params.page && params.page > 1) p.set('page', String(params.page))
    const qs = p.toString()
    return qs ? `/admin/applications?${qs}` : '/admin/applications'
  }

  const filterTabLabels: Record<string, string> = {
    submitted: t('filterSubmitted'),
    under_review: t('filterUnderReview'),
    requires_info: t('filterRequiresInfo'),
    approved: t('filterApproved'),
    rejected: t('filterRejected'),
  }

  const filterTabs = [
    { key: 'all', label: t('filterAll'), count: allApps.length },
    ...FILTER_STATUS_KEYS.map((key) => ({ key, label: filterTabLabels[key] ?? key, count: counts[key] ?? 0 })),
  ]

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ApplicationsSearch initialQuery={trimmedQuery} />
        </div>
        {(trimmedQuery || activeFilter) && (
          <Link href="/admin/applications" className="text-sm text-slate-400 hover:text-slate-600 whitespace-nowrap">
            {t('clearFilter')}
          </Link>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {filterTabs.map(({ key, label, count }) => {
          const isActive = key === 'all' ? !activeFilter : activeFilter === key
          return (
            <Link
              key={key}
              href={key === 'all'
                ? buildHref({ q: trimmedQuery || undefined })
                : buildHref({ status: key, q: trimmedQuery || undefined })}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                isActive
                  ? 'border-[#0BB5C4] text-[#0BB5C4]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {label} <span className="ml-1 text-xs text-slate-400">({count})</span>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('companyName')}</TableHead>
                <TableHead>{t('contactEmail')}</TableHead>
                <TableHead>{t('submitDate')}</TableHead>
                <TableHead>{t('reviewDate')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-slate-400 py-12" colSpan={6}>{t('noApplications')}</TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app._id.toString()}>
                    <TableCell className="font-medium text-slate-900">{app.registeredCompanyName}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{emailMap.get(app.userId.toString()) ?? '—'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/applications/${app._id.toString()}`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                        {t('view')}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        buildHref={(p) => buildHref({ status: activeFilter, q: trimmedQuery || undefined, page: p })}
      />
    </div>
  )
}
