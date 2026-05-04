import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotionEditForm } from '@/components/shared/admin/promotion-edit-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function AdminPromotionEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  await auth()
  await connectDB()
  const promo = await PromotionModel.findById(id).lean()
  if (!promo) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/admin/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">← 返回推广列表</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">编辑推广活动</CardTitle></CardHeader>
        <CardContent>
          <PromotionEditForm
            promotionId={id}
            defaultValues={{
              promotionRule: promo.promotionRule,
              fromDate: new Date(promo.fromDate).toISOString().split('T')[0],
              toDate: new Date(promo.toDate).toISOString().split('T')[0],
              exclusions: promo.exclusions ?? '',
            }}
            cancelHref="/admin/promotions"
            successRedirect="/admin/promotions"
          />
        </CardContent>
      </Card>
    </div>
  )
}
