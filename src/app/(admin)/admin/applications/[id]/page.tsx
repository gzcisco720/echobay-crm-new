import React from 'react'
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ApplicationReviewPanel } from '@/components/shared/admin/application-review-panel'
import { AdminNotesForm } from '@/components/shared/admin/admin-notes-form'
import { DocumentListItem } from '@/components/shared/document-list-item'
import { AdminDocumentRequestForm } from '@/components/admin/admin-document-request-form'
import { notFound } from 'next/navigation'
import type { SerializableDoc } from '@/components/shared/document-list-item'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ id: string }>
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className="font-medium">{String(value)}</p>
    </div>
  )
}

function maskAccountNumber(encrypted: string): string {
  if (!encrypted || encrypted.length < 4) return '****'
  return `****${encrypted.slice(-4)}`
}

export default async function AdminApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  await connectDB()
  const t = await getTranslations('admin.applicationDetail')
  const tCommon = await getTranslations('common')

  const app = await MerchantApplicationModel.findById(id).lean()
  if (!app) notFound()

  const merchant = await UserModel.findById(app.userId).select('email name createdAt').lean()

  const rawDocs = await MerchantDocumentModel.find({ applicationId: id })
    .sort({ uploadedAt: -1 })
    .lean()
    .exec()
  const docs: SerializableDoc[] = rawDocs.map((d) => ({
    _id: d._id.toString(),
    type: d.type,
    fileName: d.fileName,
    cloudinaryPublicId: d.cloudinaryPublicId,
    url: d.url,
    requestedBy: d.requestedBy?.toString() ?? null,
    uploadedAt: d.uploadedAt.toISOString(),
  }))

  const logoEntries = app.logoUploads instanceof Map
    ? Array.from(app.logoUploads.entries())
    : Object.entries(app.logoUploads as Record<string, string>)

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Application Detail (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {app.requiresInfoReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">{t('requiresInfoHeader')}</p>
              <p>{app.requiresInfoReason}</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-800">{t('companyInfo')}</CardTitle>
                <StatusBadge status={app.status} />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label={t('registeredCompanyName')} value={app.registeredCompanyName} />
              <Row label={t('tradingName')} value={app.tradingName} />
              <Row label="ACN" value={app.acn} />
              <Row label="ABN" value={app.abn} />
              <Row label={t('registeredAddress')} value={app.registeredAddress} />
              <Row label={t('postalAddress')} value={app.sameAsRegistered ? t('sameAsRegistered') : app.postalAddress} />
              <Row label={t('country')} value={app.countryOfIncorporation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('contacts')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">{t('primaryContact')}</p>
                <p className="font-medium">{app.primaryContact.name}</p>
                <p className="text-zinc-500">{app.primaryContact.position}</p>
                <p className="text-zinc-500">{app.primaryContact.email}</p>
                <p className="text-zinc-500">{app.primaryContact.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">{t('financeContact')}</p>
                <p className="font-medium">{app.financeContact.name}</p>
                <p className="text-zinc-500">{app.financeContact.position}</p>
                <p className="text-zinc-500">{app.financeContact.email}</p>
              </div>
              {!app.isAuthorizedSignatory && app.authorizedDirector && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs font-medium mb-1">{t('authorizedDirector')}</p>
                  <p className="font-medium">{app.authorizedDirector.name}</p>
                  <p className="text-zinc-500">{app.authorizedDirector.position}</p>
                  <p className="text-zinc-500">{app.authorizedDirector.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('brandStore')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label={t('brandNameEnglish')} value={app.brandNameEnglish} />
              <Row label={t('brandNameChinese')} value={app.brandNameChinese} />
              <Row label={t('website')} value={app.website} />
              <Row label={t('storesInAustralia')} value={app.storesInAustralia} />
              <Row label={t('storesToList')} value={app.storesToList} />
              <Row label={t('otherCountries')} value={app.otherCountries} />
              {app.mainCategories.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('mainCategories')}</p>
                  <p className="font-medium">{app.mainCategories.join(', ')}</p>
                </div>
              )}
              {app.brandIntroductionEnglish && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('brandIntroduction')}</p>
                  <p className="text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p>
                </div>
              )}
              {app.socialMediaAccounts && app.socialMediaAccounts.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('socialMedia')}</p>
                  <ul className="mt-0.5 space-y-0.5">
                    {app.socialMediaAccounts.map((acc, i) => (
                      <li key={i} className="font-medium">{acc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {logoEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-800">{t('logoFiles')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {logoEntries.map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#0BB5C4] hover:underline">
                    {key}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('paymentBanking')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label={t('bankAccountName')} value={app.bankAccountName} />
              <Row label={t('bankName')} value={app.bankName} />
              <Row label="BSB" value={app.bankBsb} />
              <div>
                <p className="text-zinc-400 text-xs">{t('accountNumber')}</p>
                <p className="font-medium font-mono">{maskAccountNumber(app.bankAccountNumber)}</p>
              </div>
              <Row label={t('chinesePayments')} value={app.interestedInChinesePayments ? tCommon('yes') : tCommon('no')} />
              <Row label={t('paymentPromotions')} value={app.paymentPromotions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('platformPromotion')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              {app.selectedPlatforms.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('platforms')}</p>
                  <p className="font-medium">{app.selectedPlatforms.join(', ')}</p>
                </div>
              )}
              <Row label={t('otherPlatforms')} value={app.otherPlatforms} />
              <Row label={t('notifyNewPlatforms')} value={app.notifyForFuturePlatforms ? tCommon('yes') : tCommon('no')} />
              <Row label={t('upfrontBenefits')} value={app.upfrontBenefits} />
              <Row label={t('customerCashback')} value={app.customerCashback} />
              <Row label={t('promotionStartDate')} value={app.promotionStartDate ? new Date(app.promotionStartDate).toLocaleDateString() : undefined} />
              <Row label={t('promotionEndDate')} value={app.promotionEndDate ? new Date(app.promotionEndDate).toLocaleDateString() : undefined} />
              <Row label={t('ongoingPromotion')} value={app.ongoingPromotion ? tCommon('yes') : tCommon('no')} />
              <Row label={t('affiliateMarketing')} value={app.affiliateMarketing ? tCommon('yes') : tCommon('no')} />
              <Row label={t('exclusions')} value={app.exclusions} />
              {app.additionalServices.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">{t('additionalServices')}</p>
                  <p className="font-medium">{app.additionalServices.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('agreement')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label={t('agreementAccepted')} value={app.agreementAccepted ? tCommon('yes') : tCommon('no')} />
              <Row label={t('setupFeeAccepted')} value={app.setupFeeAccepted ? tCommon('yes') : tCommon('no')} />
              <Row label={t('applicantName')} value={app.applicantName} />
              <Row label={t('applicantPosition')} value={app.applicantPosition} />
              <Row label={t('applicationDate')} value={app.applicantDate} />
              <Row label={t('witnessName')} value={app.witnessName} />
              <Row label={t('witnessDate')} value={app.witnessDate} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Review Panel (1/3 width) */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('merchantInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label={t('registeredEmail')} value={merchant?.email} />
              <Row label={t('submitTime')} value={new Date(app.createdAt).toLocaleDateString()} />
              {app.reviewedAt && (
                <Row label={t('reviewTime')} value={new Date(app.reviewedAt).toLocaleDateString()} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('reviewPanel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationReviewPanel
                applicationId={app._id.toString()}
                currentStatus={app.status}
                adminUserId={session!.user.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('adminNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminNotesForm applicationId={app._id.toString()} initialNote={app.adminNotes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">{t('supplementaryFiles')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <AdminDocumentRequestForm
                applicationId={app._id.toString()}
                adminUserId={session!.user.id}
              />
              <div className="flex flex-col gap-2">
                {docs.length === 0 ? (
                  <p className="text-zinc-400 text-xs">{t('noFileRecords')}</p>
                ) : (
                  docs.map((doc) => (
                    <DocumentListItem key={doc._id} doc={doc} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
