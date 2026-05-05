import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeletePromotionButton } from '@/components/shared/admin/delete-promotion-button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', inactive: 'secondary', scheduled: 'outline', expired: 'destructive',
}

export default async function MerchantPromotionsPage() {
  const session = await auth()
  await connectDB()
  const t = await getTranslations('merchant.promotions')
  const tStatus = await getTranslations('status')
  const promotions = session?.user.id
    ? await PromotionModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    : []

  const statusLabels: Record<string, string> = {
    active: tStatus('active'),
    inactive: tStatus('inactive'),
    expired: tStatus('expired'),
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Link href="/merchant/promotions/new">
          <Button size="sm">+ {t('createPromotion')}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('promotionName')}</CardTitle></CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">{t('noPromotions')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {promotions.map((promo) => (
                <div key={promo._id.toString()} className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 text-sm">{promo.promotionRule}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {new Date(promo.fromDate).toLocaleDateString()} — {new Date(promo.toDate).toLocaleDateString()}
                    </p>
                    {promo.exclusions && <p className="text-zinc-400 text-xs mt-0.5">{promo.exclusions}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={STATUS_VARIANT[promo.status] ?? 'outline'} className="text-xs">
                      {statusLabels[promo.status] ?? promo.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{promo.level}</Badge>
                    <div className="flex gap-2 mt-1 items-center">
                      <Link href={`/merchant/promotions/${promo._id.toString()}/edit`} className="text-xs text-[#0BB5C4] hover:underline">
                        {t('editPromotion')}
                      </Link>
                      <DeletePromotionButton
                        promotionId={promo._id.toString()}
                        promotionRule={promo.promotionRule}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
