import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { HeroProductForm } from '@/components/shared/admin/hero-product-form'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminNewHeroProductPage() {
  await auth()
  await connectDB()
  const t = await getTranslations('admin.heroProducts')

  const brands = await BrandModel.find({ status: 'active' }).select('_id brandNameEnglish').lean()
  const brandOptions = brands.map((b) => ({ id: b._id.toString(), name: b.brandNameEnglish }))

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/hero-products" className="text-zinc-400 hover:text-zinc-600 text-sm">{t('backToList')}</Link>
      </div>
      <HeroProductForm brands={brandOptions} />
    </div>
  )
}
