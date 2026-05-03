import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', inactive: 'secondary', scheduled: 'outline', expired: 'destructive',
}
const STATUS_LABEL: Record<string, string> = {
  active: '活跃', inactive: '停用', scheduled: '计划中', expired: '已过期',
}

export default async function MerchantPromotionsPage() {
  const session = await auth()
  await connectDB()
  const promotions = session?.user.id
    ? await PromotionModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()
    : []

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">推广活动 · Promotions</h1>
        <Link href="/merchant/promotions/new">
          <Button size="sm">+ 新增推广</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">我的推广活动</CardTitle></CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无推广活动。点击「新增推广」创建第一条推广。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {promotions.map((promo) => (
                <div key={promo._id.toString()} className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 text-sm">{promo.promotionRule}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {new Date(promo.fromDate).toLocaleDateString('zh-CN')} — {new Date(promo.toDate).toLocaleDateString('zh-CN')}
                    </p>
                    {promo.exclusions && <p className="text-zinc-400 text-xs mt-0.5">排除：{promo.exclusions}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={STATUS_VARIANT[promo.status] ?? 'outline'} className="text-xs">
                      {STATUS_LABEL[promo.status] ?? promo.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{promo.level === 'brand' ? '品牌级' : '门店级'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
