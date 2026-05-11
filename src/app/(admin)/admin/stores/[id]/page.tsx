import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { StoreModel } from '@/lib/db/models/store.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteStoreButton } from '@/components/shared/admin/delete-store-button'
import { getTranslations } from 'next-intl/server'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export default async function AdminStoreDetailPage({ params }: Props) {
  const { id } = await params
  await auth()
  await connectDB()
  const t = await getTranslations('admin.stores')
  const tCommon = await getTranslations('common')

  const store = await StoreModel.findById(id).lean()
  if (!store) notFound()

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/stores" className="text-zinc-400 hover:text-zinc-600 text-sm">{t('backToList')}</Link>
        <div className="flex-1" />
        <Link href={`/admin/stores/${id}/edit`} className="text-sm text-zinc-500 hover:text-zinc-800 underline">{tCommon('edit')}</Link>
        <DeleteStoreButton storeId={id} storeName={store.nameEnglishBranch} />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('basicInfo')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">{t('storeName')}</p><p className="font-medium">{store.nameEnglishBranch}</p></div>
          <div><p className="text-zinc-400 text-xs">{tCommon('phone')}</p><p className="font-medium">{store.phone}</p></div>
          <div className="col-span-2"><p className="text-zinc-400 text-xs">{tCommon('address')}</p><p className="font-medium">{store.addressEnglish}</p></div>
          <div><p className="text-zinc-400 text-xs">{t('storeType')}</p><p className="font-medium">{store.storeType}</p></div>
          <div><p className="text-zinc-400 text-xs">{t('category')}</p><p className="font-medium">{store.businessCategory}</p></div>
          <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('businessHours')}</p><p className="font-medium">{store.businessHours}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('storeDescription')}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">{t('introduction')}</p><p className="leading-relaxed text-zinc-700">{store.introduction}</p></div>
          {store.highlights.length > 0 && (
            <div>
              <p className="text-zinc-400 text-xs mb-1">{t('highlights')}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {store.highlights.map((h, i) => <li key={i} className="text-zinc-700">{h}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {store.photos.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('photos')}</CardTitle></CardHeader>
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
