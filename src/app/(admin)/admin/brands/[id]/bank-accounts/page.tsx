import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import { BankAccountModel } from '@/lib/db/models/bank-account.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BankAccountForm } from '@/components/shared/admin/bank-account-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', inactive: 'secondary', pending_verification: 'outline', suspended: 'destructive',
}
const STATUS_LABEL: Record<string, string> = {
  active: '已激活', inactive: '停用', pending_verification: '待核实', suspended: '暂停',
}

function maskAccount(encrypted: string): string {
  return `****${encrypted.slice(-4)}`
}

export default async function BrandBankAccountsPage({ params }: Props) {
  const { id: brandId } = await params
  await auth()
  await connectDB()

  const brand = await BrandModel.findById(brandId).lean()
  if (!brand) notFound()

  const accounts = await BankAccountModel.find({ brandId }).sort({ createdAt: -1 }).lean()

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/brands/${brandId}`} className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回品牌详情</Link>
        <h1 className="text-xl font-bold flex-1">银行账户 — {brand.brandNameEnglish}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">现有账户</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-zinc-400 text-sm py-4 text-center">暂无银行账户记录。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {accounts.map((acc) => (
                <div key={acc._id.toString()} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <div>
                    <p className="font-medium text-sm">{acc.accountName}</p>
                    <p className="text-zinc-500 text-xs">{acc.bankName} · BSB {acc.bsb} · {maskAccount(acc.accountNumber)}</p>
                    {acc.isPrimary && <span className="text-xs text-blue-600 font-medium">主账户</span>}
                  </div>
                  <Badge variant={STATUS_VARIANT[acc.status] ?? 'outline'} className="text-xs">
                    {STATUS_LABEL[acc.status] ?? acc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">添加新银行账户</CardTitle></CardHeader>
        <CardContent>
          <BankAccountForm brandId={brandId} merchantApplicationId={brand.merchantApplicationId.toString()} />
        </CardContent>
      </Card>
    </div>
  )
}
