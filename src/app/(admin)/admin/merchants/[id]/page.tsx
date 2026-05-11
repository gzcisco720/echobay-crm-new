import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/shared/status-badge'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminMerchantDetailPage({ params }: Props) {
  const { id: userId } = await params
  await auth()
  await connectDB()
  const t = await getTranslations('admin.merchants')
  const tCommon = await getTranslations('common')

  const user = await UserModel.findById(userId).select('email name isActive createdAt').lean()
  if (!user || user.role === 'admin' || user.role === 'super_admin') notFound()

  const app = await MerchantApplicationModel.findOne({ userId, status: 'approved' })
    .lean()

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/merchants" className="text-zinc-400 hover:text-zinc-600 text-sm">
          {t('backToList')}
        </Link>
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? t('activeStatus') : t('inactiveStatus')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 — detail */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Account */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('accountInfo')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">{tCommon('email')}</p><p className="font-medium">{user.email}</p></div>
              <div><p className="text-zinc-400 text-xs">{tCommon('name')}</p><p className="font-medium">{user.name}</p></div>
              <div>
                <p className="text-zinc-400 text-xs">{t('registrationDate')}</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {app ? (
            <>
              {/* Business */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('companyInfo')}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-zinc-400 text-xs">{t('registeredCompanyName')}</p><p className="font-medium">{app.registeredCompanyName}</p></div>
                  {app.tradingName && <div><p className="text-zinc-400 text-xs">{t('tradingName')}</p><p className="font-medium">{app.tradingName}</p></div>}
                  <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
                  <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
                  <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('registeredAddress')}</p><p className="font-medium">{app.registeredAddress}</p></div>
                </CardContent>
              </Card>

              {/* Brand */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('brandInfo')}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-zinc-400 text-xs">{t('brandNameEnglish')}</p><p className="font-medium">{app.brandNameEnglish}</p></div>
                  {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">{t('brandNameChinese')}</p><p className="font-medium">{app.brandNameChinese}</p></div>}
                  {app.website && <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('website')}</p><p className="font-medium">{app.website}</p></div>}
                  <div><p className="text-zinc-400 text-xs">{t('storesInAustralia')}</p><p className="font-medium">{app.storesInAustralia}</p></div>
                  <div><p className="text-zinc-400 text-xs">{t('storesToList')}</p><p className="font-medium">{app.storesToList}</p></div>
                  <div className="col-span-2">
                    <p className="text-zinc-400 text-xs">{t('mainCategories')}</p>
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
                <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('contacts')}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-400 text-xs font-medium mb-1">{t('primaryContact')}</p>
                    <p className="font-medium">{app.primaryContact.name}</p>
                    <p className="text-zinc-500">{app.primaryContact.position}</p>
                    <p className="text-zinc-500">{app.primaryContact.email}</p>
                    <p className="text-zinc-500">{app.primaryContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-medium mb-1">{t('financeContact')}</p>
                    <p className="font-medium">{app.financeContact.name}</p>
                    <p className="text-zinc-500">{app.financeContact.position}</p>
                    <p className="text-zinc-500">{app.financeContact.email}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-zinc-400 text-sm py-10">
                {t('noApprovedApplication')}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1/3 — status / actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('applicationStatus')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {app ? (
                <>
                  <div>
                    <p className="text-zinc-400 text-xs mb-1">{tCommon('status')}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.reviewedAt && (
                    <div>
                      <p className="text-zinc-400 text-xs">{t('approvalDate')}</p>
                      <p className="font-medium">{new Date(app.reviewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  <Link
                    href={`/admin/applications/${app._id.toString()}`}
                    className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                  >
                    {t('viewFullApplication')}
                  </Link>
                </>
              ) : (
                <p className="text-zinc-400 text-xs">{t('noApplicationRecord')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
