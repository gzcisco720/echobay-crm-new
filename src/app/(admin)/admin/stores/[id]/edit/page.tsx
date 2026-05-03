import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { StoreModel } from '@/lib/db/models/store.model'
import { BrandModel } from '@/lib/db/models/brand.model'
import { StoreForm } from '@/components/shared/admin/store-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export default async function AdminEditStorePage({ params }: Props) {
  const { id } = await params
  await auth()
  await connectDB()
  const store = await StoreModel.findById(id).lean()
  if (!store) notFound()
  const brands = await BrandModel.find({ status: 'active' }).select('_id brandNameEnglish').lean()
  const brandOptions = brands.map((b) => ({ id: b._id.toString(), name: b.brandNameEnglish }))

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/stores/${id}`} className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回详情</Link>
        <h1 className="text-xl font-bold">编辑门店</h1>
      </div>
      <StoreForm brands={brandOptions} storeId={id} initialData={store} />
    </div>
  )
}
