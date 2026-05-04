import { auth } from '@/lib/auth/auth.config'
import { getAllPromotionsForAdmin } from '@/lib/actions/promotion.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import { DeletePromotionButton } from '@/components/shared/admin/delete-promotion-button'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', inactive: 'secondary', scheduled: 'outline', expired: 'destructive',
}
const STATUS_LABEL: Record<string, string> = {
  active: '活跃', inactive: '停用', scheduled: '计划中', expired: '已过期',
}
const LEVEL_LABEL: Record<string, string> = { brand: '品牌级', store: '门店级' }

export default async function AdminPromotionsPage() {
  await auth()
  const result = await getAllPromotionsForAdmin()
  const promotions = result.success ? result.data : []

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{promotions.length} 条推广</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">全部推广活动</CardTitle></CardHeader>
        <CardContent className="p-0">
          {promotions.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无推广活动。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>推广规则</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>级别</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const id = (promo as { _id?: { toString(): string } })._id?.toString() ?? ''
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900">{promo.promotionRule}</p>
                          {promo.exclusions && <p className="text-zinc-400 text-xs mt-0.5">排除：{promo.exclusions}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs">
                        {new Date(promo.fromDate).toLocaleDateString('zh-CN')} — {new Date(promo.toDate).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{LEVEL_LABEL[promo.level] ?? promo.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[promo.status] ?? 'outline'} className="text-xs">
                          {STATUS_LABEL[promo.status] ?? promo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/admin/promotions/${id}/edit`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                            编辑
                          </Link>
                          <DeletePromotionButton promotionId={id} promotionRule={promo.promotionRule} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
