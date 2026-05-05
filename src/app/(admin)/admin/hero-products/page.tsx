import { auth } from '@/lib/auth/auth.config'
import { getAllHeroProductsForAdmin } from '@/lib/actions/hero-product.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteHeroProductButton } from '@/components/shared/admin/delete-hero-product-button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminHeroProductsPage() {
  await auth()
  const t = await getTranslations('admin.heroProducts')
  const tCommon = await getTranslations('common')
  const result = await getAllHeroProductsForAdmin()
  const products = result.success ? result.data : []

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{products.length}</Badge>
        <Link href="/admin/hero-products/new">
          <Button size="sm">+ {t('createProduct')}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('productName')}</CardTitle></CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">{t('noProducts')}</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const id = (product as { _id?: { toString(): string } })._id?.toString() ?? ''
                return (
                  <div key={id} className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    {product.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded-md" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 text-sm truncate">{product.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 truncate">{product.subtitle}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{product.imageWidth}×{product.imageHeight}px</p>
                    </div>
                    <div className="flex gap-2 mt-1 items-center flex-wrap">
                      <Link href={`/admin/hero-products/${id}/edit`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                        {tCommon('edit')}
                      </Link>
                      <DeleteHeroProductButton productId={id} productName={product.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
