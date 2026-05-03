import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { StoreModel } from '@/lib/db/models/store.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export default async function AdminStoreDetailPage({ params }: Props) {
  const { id } = await params
  await auth()
  await connectDB()
  const store = await StoreModel.findById(id).lean()
  if (!store) notFound()

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/stores" className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回门店列表</Link>
        <h1 className="text-xl font-bold flex-1">{store.nameEnglishBranch}</h1>
        <Link href={`/admin/stores/${id}/edit`} className="text-sm text-zinc-500 hover:text-zinc-800 underline">编辑</Link>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">门店名称</p><p className="font-medium">{store.nameEnglishBranch}</p></div>
          <div><p className="text-zinc-400 text-xs">电话</p><p className="font-medium">{store.phone}</p></div>
          <div className="col-span-2"><p className="text-zinc-400 text-xs">地址</p><p className="font-medium">{store.addressEnglish}</p></div>
          <div><p className="text-zinc-400 text-xs">门店类型</p><p className="font-medium">{store.storeType}</p></div>
          <div><p className="text-zinc-400 text-xs">业务类别</p><p className="font-medium">{store.businessCategory}</p></div>
          <div className="col-span-2"><p className="text-zinc-400 text-xs">营业时间</p><p className="font-medium">{store.businessHours}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">门店介绍</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">简介</p><p className="leading-relaxed text-zinc-700">{store.introduction}</p></div>
          {store.highlights.length > 0 && (
            <div>
              <p className="text-zinc-400 text-xs mb-1">亮点</p>
              <ul className="list-disc list-inside space-y-0.5">
                {store.highlights.map((h, i) => <li key={i} className="text-zinc-700">{h}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {store.photos.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">门店照片</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {store.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`Store photo ${i + 1}`} className="w-full aspect-square object-cover rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
