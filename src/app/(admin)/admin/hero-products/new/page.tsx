import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { HeroProductForm } from '@/components/shared/admin/hero-product-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminNewHeroProductPage() {
  await auth()
  await connectDB()
  const brands = await BrandModel.find({ status: 'active' }).select('_id brandNameEnglish').lean()
  const brandOptions = brands.map((b) => ({ id: b._id.toString(), name: b.brandNameEnglish }))

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/hero-products" className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回特色产品</Link>
        <h1 className="text-xl font-bold">新增特色产品</h1>
      </div>
      <HeroProductForm brands={brandOptions} />
    </div>
  )
}
