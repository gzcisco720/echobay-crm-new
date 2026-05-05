import { auth } from '@/lib/auth/auth.config'
import { getAllPromotionsForAdmin } from '@/lib/actions/promotion.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'
import { DeletePromotionButton } from '@/components/shared/admin/delete-promotion-button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', inactive: 'secondary', scheduled: 'outline', expired: 'destructive',
}

export default async function AdminPromotionsPage() {
  await auth()
  const t = await getTranslations('admin.promotions')
  const tCommon = await getTranslations('common')
  const tStatus = await getTranslations('status')
  const result = await getAllPromotionsForAdmin()
  const promotions = result.success ? result.data : []

  const statusLabels: Record<string, string> = {
    active: tStatus('active'),
    inactive: tStatus('inactive'),
    expired: tStatus('expired'),
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{promotions.length}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('promotionName')}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {promotions.length === 0 ? (
            <p className="text-zinc-400 text-sm py-8 text-center">{t('noPromotions')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('promotionName')}</TableHead>
                  <TableHead>{t('startDate')} — {t('endDate')}</TableHead>
                  <TableHead>{t('merchant')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const id = (promo as { _id?: { toString(): string } })._id?.toString() ?? ''
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900">{promo.promotionRule}</p>
                          {promo.exclusions && <p className="text-zinc-400 text-xs mt-0.5">{promo.exclusions}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs">
                        {new Date(promo.fromDate).toLocaleDateString()} — {new Date(promo.toDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{promo.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[promo.status] ?? 'outline'} className="text-xs">
                          {statusLabels[promo.status] ?? promo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/admin/promotions/${id}/edit`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                            {tCommon('edit')}
                          </Link>
                          <DeletePromotionButton promotionId={id} promotionRule={promo.promotionRule} />
                        </div>
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
