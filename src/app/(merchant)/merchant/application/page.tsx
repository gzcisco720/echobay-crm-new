import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResubmitButton } from '@/components/shared/merchant-portal/resubmit-button'
import { getTranslations } from 'next-intl/server'

export default async function ApplicationPage() {
  const session = await auth()
  await connectDB()
  const t = await getTranslations('merchant.application')

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id }).lean().exec()

  if (!app) {
    return (
      <div className="w-full">
        <p className="text-zinc-500">{t('noApplication')}</p>
      </div>
    )
  }

  const canEdit = ['submitted', 'requires_info'].includes(app.status)

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge>{app.status}</Badge>
      </div>

      {app.requiresInfoReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>{t('requiresInfoHeader')}：</strong> {app.requiresInfoReason}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">{t('companyInfo')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">{t('registeredCompanyName')}</p><p className="font-medium">{app.registeredCompanyName}</p></div>
          <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
          <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
          <div><p className="text-zinc-400 text-xs">{t('registeredAddress')}</p><p className="font-medium">{app.registeredAddress}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">{t('brandInfo')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">{t('brandNameEnglish')}</p><p className="font-medium">{app.brandNameEnglish}</p></div>
          {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">{t('brandNameChinese')}</p><p className="font-medium">{app.brandNameChinese}</p></div>}
          <div className="col-span-2"><p className="text-zinc-400 text-xs">{t('brandIntroduction')}</p><p className="font-medium leading-relaxed">{app.brandIntroductionEnglish}</p></div>
        </CardContent>
      </Card>

      {app.status === 'requires_info' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-3">
          <p className="text-amber-800 text-sm font-medium">
            {t('requiresInfoMessage')}
          </p>
          <ResubmitButton applicationId={app._id.toString()} />
        </div>
      )}
      {canEdit && app.status !== 'requires_info' && (
        <p className="text-zinc-500 text-sm">
          {t('contactTeam')}
          <a href="mailto:support@echobay.com.au" className="text-zinc-900 underline ml-1">
            support@echobay.com.au
          </a>
        </p>
      )}
    </div>
  )
}
