import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotionEditForm } from '@/components/shared/admin/promotion-edit-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function MerchantPromotionEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  const session = await auth()
  await connectDB()
  const t = await getTranslations('merchant.promotions')
  const tAdmin = await getTranslations('admin.promotions')

  const promo = await PromotionModel.findById(id).lean()
  if (!promo) notFound()
  if (promo.userId.toString() !== session!.user.id) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/merchant/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">{t('backToList')}</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">{tAdmin('editTitle')}</CardTitle></CardHeader>
        <CardContent>
          <PromotionEditForm
            promotionId={id}
            defaultValues={{
              promotionRule: promo.promotionRule,
              fromDate: new Date(promo.fromDate).toISOString().split('T')[0] ?? '',
              toDate: new Date(promo.toDate).toISOString().split('T')[0] ?? '',
              exclusions: promo.exclusions ?? '',
            }}
            cancelHref="/merchant/promotions"
            successRedirect="/merchant/promotions"
          />
        </CardContent>
      </Card>
    </div>
  )
}
