import { auth } from '@/lib/auth/auth.config'
import { getStoresForAdmin } from '@/lib/actions/store.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage() {
  await auth()
  const t = await getTranslations('admin.stores')
  const tCommon = await getTranslations('common')
  const result = await getStoresForAdmin()
  const stores = result.success ? result.data : []

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{stores.length}</Badge>
        <Link href="/admin/stores/new">
          <Button size="sm">+ {tCommon('new')}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('storeName')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stores.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">{t('noStores')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('storeName')}</TableHead>
                  <TableHead>{t('address')}</TableHead>
                  <TableHead>{tCommon('phone')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{tCommon('actions')}</TableHead>
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
                          {tCommon('view')}
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
