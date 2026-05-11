import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandStatusSelect } from '@/components/shared/admin/brand-status-select'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminBrandDetailPage({ params }: Props) {
  const { id } = await params
  await auth()
  await connectDB()
  const t = await getTranslations('admin.brands')

  const brand = await BrandModel.findById(id).lean()
  if (!brand) notFound()

  const statusLabel: Record<string, string> = {
    active: t('active'),
    inactive: t('inactive'),
    suspended: t('suspended'),
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/brands" className="text-zinc-400 hover:text-zinc-600 text-sm">{t('backToList')}</Link>
        <Badge>{statusLabel[brand.status] ?? brand.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 — brand detail */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('companyInfo')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">{t('registeredCompanyName')}</p><p className="font-medium">{brand.registeredCompanyName}</p></div>
              {brand.tradingName && <div><p className="text-zinc-400 text-xs">{t('tradingName')}</p><p className="font-medium">{brand.tradingName}</p></div>}
              <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{brand.abn}</p></div>
              <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{brand.acn}</p></div>
              <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('registeredAddress')}</p><p className="font-medium">{brand.registeredAddress}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('brandInfo')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-zinc-400 text-xs">{t('brandNameEnglish')}</p><p className="font-medium">{brand.brandNameEnglish}</p></div>
              {brand.brandNameChinese && <div><p className="text-zinc-400 text-xs">{t('brandNameChinese')}</p><p className="font-medium">{brand.brandNameChinese}</p></div>}
              {brand.website && <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('website')}</p><p className="font-medium">{brand.website}</p></div>}
              <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('brandIntroduction')}</p><p className="leading-relaxed text-zinc-700">{brand.brandIntroductionEnglish}</p></div>
              <div><p className="text-zinc-400 text-xs">{t('storesInAustralia')}</p><p className="font-medium">{brand.storesInAustralia}</p></div>
              <div><p className="text-zinc-400 text-xs">{t('storesToList')}</p><p className="font-medium">{brand.storesToList}</p></div>
              <div className="col-span-2">
                <p className="text-zinc-400 text-xs">{t('mainCategories')}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brand.mainCategories.map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('contacts')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">{t('primaryContact')}</p>
                <p className="font-medium">{brand.primaryContactName}</p>
                <p className="text-zinc-500">{brand.primaryContactPosition}</p>
                <p className="text-zinc-500">{brand.primaryContactEmail}</p>
                <p className="text-zinc-500">{brand.primaryContactPhone}</p>
              </div>
              {brand.financeContactName && (
                <div>
                  <p className="text-zinc-400 text-xs font-medium mb-1">{t('financeContact')}</p>
                  <p className="font-medium">{brand.financeContactName}</p>
                  <p className="text-zinc-500">{brand.financeContactPosition}</p>
                  <p className="text-zinc-500">{brand.financeContactEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('paymentPlatforms')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-zinc-400 text-xs">{t('paymentMethods')}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brand.paymentMethods.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                </div>
              </div>
              {brand.selectedPlatforms.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('selectedPlatforms')}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {brand.selectedPlatforms.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1/3 — actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('quickActions')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Link
                href={`/admin/applications/${brand.merchantApplicationId.toString()}`}
                className="text-sm text-zinc-500 hover:text-zinc-800 underline"
              >
                {t('viewApplication')}
              </Link>
              <Link
                href={`/admin/brands/${id}/bank-accounts`}
                className="text-sm text-zinc-500 hover:text-zinc-800 underline"
              >
                {t('manageBankAccounts')}
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 font-medium">{t('brandStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BrandStatusSelect
                brandId={id}
                currentStatus={brand.status as 'active' | 'inactive' | 'suspended'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
