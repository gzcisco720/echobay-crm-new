import { auth } from '@/lib/auth/auth.config'
import { getAllHeroProductsForAdmin } from '@/lib/actions/hero-product.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminHeroProductsPage() {
  await auth()
  const result = await getAllHeroProductsForAdmin()
  const products = result.success ? result.data : []

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">特色产品 · Hero Products</h1>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{products.length} 个产品</Badge>
          <Link href="/admin/hero-products/new">
            <Button size="sm">+ 新增特色产品</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">全部特色产品</CardTitle></CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无特色产品。</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => {
                const id = (product as { _id?: { toString(): string } })._id?.toString() ?? ''
                return (
                  <div key={id} className="flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    {product.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 text-sm truncate">{product.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 truncate">{product.subtitle}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{product.imageWidth}×{product.imageHeight}px</p>
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
