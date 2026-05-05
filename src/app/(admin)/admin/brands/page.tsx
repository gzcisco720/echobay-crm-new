import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  suspended: 'destructive',
}

export default async function AdminBrandsPage() {
  await auth()
  await connectDB()
  const t = await getTranslations('admin.brands')
  const tCommon = await getTranslations('common')

  const brands = await BrandModel.find().sort({ createdAt: -1 }).lean()

  const statusLabels: Record<string, string> = {
    active: t('active'),
    inactive: t('inactive'),
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{brands.length}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('brandName')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {brands.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">{t('noBrands')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('brandName')}</TableHead>
                  <TableHead>{t('merchant')}</TableHead>
                  <TableHead>{tCommon('address')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand._id.toString()}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-zinc-900">{brand.brandNameEnglish}</p>
                        {brand.brandNameChinese && <p className="text-zinc-400 text-xs">{brand.brandNameChinese}</p>}
                        <p className="text-zinc-500 text-xs">{brand.registeredCompanyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{brand.primaryContactEmail}</TableCell>
                    <TableCell>{brand.storesInAustralia}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[brand.status] ?? 'outline'} className="text-xs">
                        {statusLabels[brand.status] ?? brand.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/brands/${brand._id.toString()}`}
                        className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                      >
                        {tCommon('view')}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
