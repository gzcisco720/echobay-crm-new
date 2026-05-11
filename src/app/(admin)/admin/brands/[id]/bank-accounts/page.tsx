import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { BankAccountModel } from '@/lib/db/models/bank-account.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BankAccountForm } from '@/components/shared/admin/bank-account-form'
import { BankAccountStatusSelect } from '@/components/shared/admin/bank-account-status-select'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

function maskAccount(encrypted: string): string {
  return `****${encrypted.slice(-4)}`
}

export default async function BrandBankAccountsPage({ params }: Props) {
  const { id: brandId } = await params
  await auth()
  await connectDB()
  const t = await getTranslations('admin.brands')

  const brand = await BrandModel.findById(brandId).lean()
  if (!brand) notFound()

  const accounts = await BankAccountModel.find({ brandId }).sort({ createdAt: -1 }).lean()

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/brands/${brandId}`} className="text-zinc-400 hover:text-zinc-600 text-sm">{t('backToDetail')}</Link>
        <span className="text-sm text-zinc-600 font-medium">{brand.brandNameEnglish}</span>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('existingAccounts')}</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-zinc-400 text-sm py-4 text-center">{t('noAccounts')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {accounts.map((acc) => (
                <div key={acc._id.toString()} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <div>
                    <p className="font-medium text-sm">{acc.accountName}</p>
                    <p className="text-zinc-500 text-xs">{acc.bankName} · BSB {acc.bsb} · {maskAccount(acc.accountNumber)}</p>
                    {acc.isPrimary && <span className="text-xs text-blue-600 font-medium">{t('primaryAccount')}</span>}
                  </div>
                  <BankAccountStatusSelect
                    accountId={acc._id.toString()}
                    currentStatus={acc.status as 'active' | 'inactive' | 'pending_verification' | 'suspended'}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">{t('addAccount')}</CardTitle></CardHeader>
        <CardContent>
          <BankAccountForm brandId={brandId} merchantApplicationId={brand.merchantApplicationId.toString()} />
        </CardContent>
      </Card>
    </div>
  )
}
