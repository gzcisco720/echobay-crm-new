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
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'

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

  const app = await MerchantApplicationModel.findById(id).lean()
  if (!app) notFound()

  const merchant = await UserModel.findById(app.userId).select('email name createdAt').lean()

  const rawDocs = await MerchantDocumentModel.find({ applicationId: id })
    .sort({ uploadedAt: -1 })
    .lean()
    .exec()
  const docs = rawDocs as (IMerchantDocument & { _id: { toString(): string } })[]

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
              <p className="font-semibold mb-1">需补充信息：</p>
              <p>{app.requiresInfoReason}</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-800">公司基本信息</CardTitle>
                <StatusBadge status={app.status} />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="注册公司名称" value={app.registeredCompanyName} />
              <Row label="商业名称（Trading Name）" value={app.tradingName} />
              <Row label="ACN" value={app.acn} />
              <Row label="ABN" value={app.abn} />
              <Row label="注册地址" value={app.registeredAddress} />
              <Row label="邮寄地址" value={app.sameAsRegistered ? '同注册地址' : app.postalAddress} />
              <Row label="注册国家" value={app.countryOfIncorporation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">联系人</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">主联系人</p>
                <p className="font-medium">{app.primaryContact.name}</p>
                <p className="text-zinc-500">{app.primaryContact.position}</p>
                <p className="text-zinc-500">{app.primaryContact.email}</p>
                <p className="text-zinc-500">{app.primaryContact.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">财务联系人</p>
                <p className="font-medium">{app.financeContact.name}</p>
                <p className="text-zinc-500">{app.financeContact.position}</p>
                <p className="text-zinc-500">{app.financeContact.email}</p>
              </div>
              {!app.isAuthorizedSignatory && app.authorizedDirector && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs font-medium mb-1">授权董事（非主联系人授权）</p>
                  <p className="font-medium">{app.authorizedDirector.name}</p>
                  <p className="text-zinc-500">{app.authorizedDirector.position}</p>
                  <p className="text-zinc-500">{app.authorizedDirector.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">品牌与门店</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="品牌英文名" value={app.brandNameEnglish} />
              <Row label="品牌中文名" value={app.brandNameChinese} />
              <Row label="品牌网站" value={app.website} />
              <Row label="澳洲门店数" value={app.storesInAustralia} />
              <Row label="参与门店数" value={app.storesToList} />
              <Row label="其他国家门店" value={app.otherCountries} />
              {app.mainCategories.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">主营类目</p>
                  <p className="font-medium">{app.mainCategories.join(', ')}</p>
                </div>
              )}
              {app.brandIntroductionEnglish && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">品牌介绍</p>
                  <p className="text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p>
                </div>
              )}
              {app.socialMediaAccounts && app.socialMediaAccounts.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">社交媒体账号</p>
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
                <CardTitle className="text-sm font-semibold text-slate-800">Logo 文件</CardTitle>
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
              <CardTitle className="text-sm font-semibold text-slate-800">支付与银行</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="银行账户名称" value={app.bankAccountName} />
              <Row label="银行名称" value={app.bankName} />
              <Row label="BSB" value={app.bankBsb} />
              <div>
                <p className="text-zinc-400 text-xs">账户号码</p>
                <p className="font-medium font-mono">{maskAccountNumber(app.bankAccountNumber)}</p>
              </div>
              <Row label="感兴趣中国支付" value={app.interestedInChinesePayments ? '是' : '否'} />
              <Row label="支付推广说明" value={app.paymentPromotions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">平台与推广</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              {app.selectedPlatforms.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">选择平台</p>
                  <p className="font-medium">{app.selectedPlatforms.join(', ')}</p>
                </div>
              )}
              <Row label="其他平台" value={app.otherPlatforms} />
              <Row label="通知新平台" value={app.notifyForFuturePlatforms ? '是' : '否'} />
              <Row label="前期利益说明" value={app.upfrontBenefits} />
              <Row label="用户返现比例 (%)" value={app.customerCashback} />
              <Row label="推广开始日" value={app.promotionStartDate ? new Date(app.promotionStartDate).toLocaleDateString('zh-CN') : undefined} />
              <Row label="推广结束日" value={app.promotionEndDate ? new Date(app.promotionEndDate).toLocaleDateString('zh-CN') : undefined} />
              <Row label="持续性推广" value={app.ongoingPromotion ? '是' : '否'} />
              <Row label="联盟营销" value={app.affiliateMarketing ? '是' : '否'} />
              <Row label="排除情况" value={app.exclusions} />
              {app.additionalServices.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-400 text-xs">附加服务</p>
                  <p className="font-medium">{app.additionalServices.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">协议签署</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="协议已接受" value={app.agreementAccepted ? '是' : '否'} />
              <Row label="设置费已确认" value={app.setupFeeAccepted ? '是' : '否'} />
              <Row label="申请人姓名" value={app.applicantName} />
              <Row label="申请人职位" value={app.applicantPosition} />
              <Row label="申请日期" value={app.applicantDate} />
              <Row label="见证人姓名" value={app.witnessName} />
              <Row label="见证日期" value={app.witnessDate} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Review Panel (1/3 width) */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">商户信息</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label="注册邮箱" value={merchant?.email} />
              <Row label="提交时间" value={new Date(app.createdAt).toLocaleDateString('zh-CN')} />
              {app.reviewedAt && (
                <Row label="审核时间" value={new Date(app.reviewedAt).toLocaleDateString('zh-CN')} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">审核操作</CardTitle>
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
              <CardTitle className="text-sm font-semibold text-slate-800">内部备注</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminNotesForm applicationId={app._id.toString()} initialNote={app.adminNotes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">补充文件</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <AdminDocumentRequestForm
                applicationId={app._id.toString()}
                adminUserId={session!.user.id}
              />
              <div className="flex flex-col gap-2">
                {docs.length === 0 ? (
                  <p className="text-zinc-400 text-xs">暂无文件记录。</p>
                ) : (
                  docs.map((doc) => (
                    <DocumentListItem key={doc._id.toString()} doc={doc} />
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
