import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  suspended: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  active: '活跃', inactive: '停用', suspended: '暂停',
}

export default async function AdminBrandsPage() {
  await auth()
  await connectDB()

  const brands = await BrandModel.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">品牌管理 · Brands</h1>
        <Badge variant="secondary">{brands.length} 个品牌</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">已批准品牌</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无品牌。申请审批通过后将自动创建。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {brands.map((brand) => (
                <Link
                  key={brand._id.toString()}
                  href={`/admin/brands/${brand._id.toString()}`}
                  className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-900 text-sm">{brand.brandNameEnglish}</p>
                      {brand.brandNameChinese && <p className="text-zinc-400 text-xs">{brand.brandNameChinese}</p>}
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5">{brand.registeredCompanyName}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{brand.primaryContactEmail}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <Badge variant={STATUS_VARIANT[brand.status] ?? 'outline'} className="text-xs">
                      {STATUS_LABEL[brand.status] ?? brand.status}
                    </Badge>
                    <p className="text-xs text-zinc-400">{brand.storesInAustralia} 家门店</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
