import { auth } from '@/lib/auth/auth.config'
import { getTranslations } from 'next-intl/server'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminMerchantsPage() {
  await auth()
  await connectDB()
  const t = await getTranslations('admin.merchants')
  const tCommon = await getTranslations('common')

  const apps = await MerchantApplicationModel.find({ status: 'approved' })
    .select('userId registeredCompanyName brandNameEnglish brandNameChinese mainCategories storesInAustralia reviewedAt')
    .sort({ reviewedAt: -1 })
    .lean()
    .exec()

  const userIds = apps.map((a) => a.userId)
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('_id email name')
    .lean()
    .exec()

  const userMap = new Map(users.map((u) => [u._id.toString(), u]))

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{apps.length}</Badge>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-zinc-400 text-sm py-12">
            {t('noMerchants')}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{tCommon('noData')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('company')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('brand')}</TableHead>
                  <TableHead>{t('approvedAt')}</TableHead>
                  <TableHead>{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => {
                  const user = userMap.get(app.userId.toString())
                  return (
                    <TableRow key={app._id.toString()}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-zinc-900">{app.brandNameEnglish}</p>
                          {app.brandNameChinese && (
                            <p className="text-zinc-400 text-xs">{app.brandNameChinese}</p>
                          )}
                          <p className="text-zinc-500 text-xs">{app.registeredCompanyName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user?.email ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {app.mainCategories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs py-0 px-1.5">{cat}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.reviewedAt
                          ? new Date(app.reviewedAt).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/merchants/${app.userId.toString()}`}
                          className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                        >
                          {tCommon('view')}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
