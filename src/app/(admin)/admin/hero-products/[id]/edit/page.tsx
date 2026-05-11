import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { HeroProductModel, IHeroProduct } from '@/lib/db/models/hero-product.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeroProductForm } from '@/components/shared/admin/hero-product-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { FlattenMaps, Types } from 'mongoose'
import { getTranslations } from 'next-intl/server'

type LeanHeroProduct = FlattenMaps<IHeroProduct> & { _id: Types.ObjectId }

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function AdminHeroProductEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  await auth()
  await connectDB()
  const t = await getTranslations('admin.heroProducts')

  const product = (await HeroProductModel.findById(id).lean()) as LeanHeroProduct | null
  if (!product) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/admin/hero-products" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">{t('backToList')}</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">{t('editTitle')}</CardTitle></CardHeader>
        <CardContent>
          <HeroProductForm
            brands={[]}
            productId={id}
            initialData={{
              name: product.name,
              subtitle: product.subtitle,
              imageUrl: product.imageUrl,
              imageWidth: product.imageWidth,
              imageHeight: product.imageHeight,
              brandId: product.brandId.toString(),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
