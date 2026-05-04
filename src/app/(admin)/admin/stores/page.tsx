import { auth } from '@/lib/auth/auth.config'
import { getStoresForAdmin } from '@/lib/actions/store.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage() {
  await auth()
  const result = await getStoresForAdmin()
  const stores = result.success ? result.data : []

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{stores.length} 家门店</Badge>
        <Link href="/admin/stores/new">
          <Button size="sm">+ 新增门店</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">所有门店</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stores.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">暂无门店数据。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>门店名称</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>业务类别</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => {
                  const id = (store as { _id?: { toString(): string } })._id?.toString() ?? ''
                  return (
                    <TableRow key={id}>
                      <TableCell className="font-semibold">{store.nameEnglishBranch}</TableCell>
                      <TableCell className="text-zinc-500 text-xs">{store.addressEnglish}</TableCell>
                      <TableCell className="text-zinc-500 text-xs">{store.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{store.businessCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/stores/${id}`}
                          className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                        >
                          查看
                        </Link>
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
