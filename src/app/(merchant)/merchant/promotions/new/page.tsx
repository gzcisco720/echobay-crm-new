import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { StoreModel } from '@/lib/db/models/store.model'
import { PromotionForm } from '@/components/shared/merchant/promotion-form'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function MerchantNewPromotionPage() {
  const session = await auth()
  if (!session?.user.id) redirect('/login')
  await connectDB()
  const t = await getTranslations('merchant.promotions')

  const brand = await BrandModel.findOne({ userId: session.user.id }).lean()
  if (!brand) {
    return (
      <div className="w-full">
        <p className="text-zinc-400 text-sm">{t('noBrand')}</p>
      </div>
    )
  }

  const store = await StoreModel.findOne({ userId: session.user.id }).lean()

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/merchant/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm">{t('backToList')}</Link>
      </div>
      <PromotionForm
        userId={session.user.id}
        brandId={brand._id.toString()}
        storeId={store?._id.toString()}
      />
    </div>
  )
}
