import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  active: '活跃', inactive: '停用', suspended: '暂停',
}

export default async function AdminBrandDetailPage({ params }: Props) {
  const { id } = await params
  await auth()
  await connectDB()

  const brand = await BrandModel.findById(id).lean()
  if (!brand) notFound()

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/brands" className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回品牌列表</Link>
        <h1 className="text-xl font-bold flex-1">{brand.brandNameEnglish}</h1>
        <Badge>{STATUS_LABEL[brand.status] ?? brand.status}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">公司信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">注册公司名称</p><p className="font-medium">{brand.registeredCompanyName}</p></div>
          {brand.tradingName && <div><p className="text-zinc-400 text-xs">商业名称</p><p className="font-medium">{brand.tradingName}</p></div>}
          <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{brand.abn}</p></div>
          <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{brand.acn}</p></div>
          <div className="col-span-2"><p className="text-zinc-400 text-xs">注册地址</p><p className="font-medium">{brand.registeredAddress}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">品牌信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">品牌英文名</p><p className="font-medium">{brand.brandNameEnglish}</p></div>
          {brand.brandNameChinese && <div><p className="text-zinc-400 text-xs">品牌中文名</p><p className="font-medium">{brand.brandNameChinese}</p></div>}
          {brand.website && <div className="col-span-2"><p className="text-zinc-400 text-xs">网站</p><p className="font-medium">{brand.website}</p></div>}
          <div className="col-span-2"><p className="text-zinc-400 text-xs">品牌介绍</p><p className="leading-relaxed text-zinc-700">{brand.brandIntroductionEnglish}</p></div>
          <div><p className="text-zinc-400 text-xs">澳洲门店数</p><p className="font-medium">{brand.storesInAustralia}</p></div>
          <div><p className="text-zinc-400 text-xs">参与门店数</p><p className="font-medium">{brand.storesToList}</p></div>
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs">主营类目</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {brand.mainCategories.map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">联系人</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-400 text-xs font-medium mb-1">主联系人</p>
            <p className="font-medium">{brand.primaryContactName}</p>
            <p className="text-zinc-500">{brand.primaryContactPosition}</p>
            <p className="text-zinc-500">{brand.primaryContactEmail}</p>
            <p className="text-zinc-500">{brand.primaryContactPhone}</p>
          </div>
          {brand.financeContactName && (
            <div>
              <p className="text-zinc-400 text-xs font-medium mb-1">财务联系人</p>
              <p className="font-medium">{brand.financeContactName}</p>
              <p className="text-zinc-500">{brand.financeContactPosition}</p>
              <p className="text-zinc-500">{brand.financeContactEmail}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">支付与平台</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs">支付方式</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {brand.paymentMethods.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
            </div>
          </div>
          {brand.selectedPlatforms.length > 0 && (
            <div className="col-span-2">
              <p className="text-zinc-400 text-xs">合作平台</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {brand.selectedPlatforms.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 text-sm">
        <Link href={`/admin/applications/${brand.merchantApplicationId.toString()}`} className="text-zinc-500 hover:text-zinc-800 underline">
          查看原始申请 →
        </Link>
      </div>
    </div>
  )
}
