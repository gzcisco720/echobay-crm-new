import { auth } from '@/lib/auth/auth.config'
import { getStoresForAdmin } from '@/lib/actions/store.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage() {
  await auth()
  const result = await getStoresForAdmin()
  const stores = result.success ? result.data : []

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">门店管理 · Stores</h1>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{stores.length} 家门店</Badge>
          <Link href="/admin/stores/new">
            <Button size="sm">+ 新增门店</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">所有门店</CardTitle>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无门店数据。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stores.map((store) => {
                const id = (store as { _id?: { toString(): string } })._id?.toString() ?? ''
                return (
                  <Link
                    key={id}
                    href={`/admin/stores/${id}`}
                    className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 text-sm">{store.nameEnglishBranch}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{store.addressEnglish}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{store.phone}</p>
                    </div>
                    <div className="shrink-0">
                      <Badge variant="outline" className="text-xs">{store.businessCategory}</Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
