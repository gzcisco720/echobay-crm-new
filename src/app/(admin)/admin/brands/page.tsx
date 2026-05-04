import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
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
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{brands.length} 个品牌</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">已批准品牌</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {brands.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无品牌。申请审批通过后将自动创建。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>品牌名称</TableHead>
                  <TableHead>联系邮箱</TableHead>
                  <TableHead>门店数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand._id.toString()}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-zinc-900">{brand.brandNameEnglish}</p>
                        {brand.brandNameChinese && <p className="text-zinc-400 text-xs">{brand.brandNameChinese}</p>}
                        <p className="text-zinc-500 text-xs">{brand.registeredCompanyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{brand.primaryContactEmail}</TableCell>
                    <TableCell>{brand.storesInAustralia}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[brand.status] ?? 'outline'} className="text-xs">
                        {STATUS_LABEL[brand.status] ?? brand.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/brands/${brand._id.toString()}`}
                        className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                      >
                        查看
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
