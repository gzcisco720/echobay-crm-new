import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { StoreModel } from '@/lib/db/models/store.model'
import { PromotionForm } from '@/components/shared/merchant/promotion-form'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MerchantNewPromotionPage() {
  const session = await auth()
  if (!session?.user.id) redirect('/login')
  await connectDB()

  const brand = await BrandModel.findOne({ userId: session.user.id }).lean()
  if (!brand) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-bold mb-4">新增推广活动</h1>
        <p className="text-zinc-400 text-sm">您的品牌尚未设置，无法创建推广活动。请联系管理员。</p>
      </div>
    )
  }

  const store = await StoreModel.findOne({ userId: session.user.id }).lean()

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/merchant/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回推广列表</Link>
        <h1 className="text-xl font-bold">新增推广活动</h1>
      </div>
      <PromotionForm
        userId={session.user.id}
        brandId={brand._id.toString()}
        storeId={store?._id.toString()}
      />
    </div>
  )
}
