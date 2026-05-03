import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApplicationReviewPanel } from '@/components/shared/admin/application-review-panel'
import { AdminNotesForm } from '@/components/shared/admin/admin-notes-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', submitted: '已提交', under_review: '审核中',
  approved: '已批准', rejected: '已拒绝', requires_info: '需补充',
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

  const logoEntries = app.logoUploads instanceof Map
    ? Array.from(app.logoUploads.entries())
    : Object.entries(app.logoUploads as Record<string, string>)

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/applications" className="text-zinc-400 hover:text-zinc-600 text-sm">
          ← 返回列表
        </Link>
        <h1 className="text-xl font-bold flex-1">{app.registeredCompanyName}</h1>
        <Badge>{STATUS_LABEL[app.status] ?? app.status}</Badge>
      </div>

      {app.requiresInfoReason && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>需补充说明：</strong> {app.requiresInfoReason}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">审核操作</CardTitle></CardHeader>
        <CardContent>
          <ApplicationReviewPanel
            applicationId={id}
            currentStatus={app.status}
            adminUserId={session!.user.id}
          />
        </CardContent>
      </Card>

      {/* Merchant account */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">商户账号</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Row label="邮箱" value={merchant?.email} />
          <Row label="姓名" value={merchant?.name} />
        </CardContent>
      </Card>

      {/* Company info */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">公司信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Row label="注册公司名称" value={app.registeredCompanyName} />
          <Row label="商业名称（Trading Name）" value={app.tradingName} />
          <Row label="ACN" value={app.acn} />
          <Row label="ABN" value={app.abn} />
          <Row label="注册地址" value={app.registeredAddress} />
          <Row label="邮寄地址" value={app.sameAsRegistered ? '同注册地址' : app.postalAddress} />
          <Row label="注册国家" value={app.countryOfIncorporation} />
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">联系人</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
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

      {/* Brand */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">品牌信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Row label="品牌英文名" value={app.brandNameEnglish} />
          <Row label="品牌中文名" value={app.brandNameChinese} />
          <Row label="品牌网站" value={app.website} />
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs">品牌介绍</p>
            <p className="text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p>
          </div>
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
          {logoEntries.length > 0 && (
            <div className="col-span-2">
              <p className="text-zinc-400 text-xs mb-1">Logo 上传</p>
              <div className="flex flex-wrap gap-3">
                {logoEntries.map(([key, url]) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={key} className="w-16 h-16 object-contain border rounded" />
                    <span className="text-xs text-zinc-400">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">门店信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Row label="澳洲门店数" value={app.storesInAustralia} />
          <Row label="参与门店数" value={app.storesToList} />
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs">主营类目</p>
            <p className="font-medium">{app.mainCategories.join(', ')}</p>
          </div>
          <Row label="其他国家门店" value={app.otherCountries} />
        </CardContent>
      </Card>

      {/* Payment & Banking */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">支付与银行</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs">支付方式</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {app.paymentMethods.map((m) => (
                <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
              ))}
            </div>
          </div>
          <Row label="感兴趣中国支付" value={app.interestedInChinesePayments ? '是' : '否'} />
          <Row label="支付推广说明" value={app.paymentPromotions} />
          <Row label="银行账户名称" value={app.bankAccountName} />
          <Row label="银行名称" value={app.bankName} />
          <Row label="BSB" value={app.bankBsb} />
          <div>
            <p className="text-zinc-400 text-xs">账户号码</p>
            <p className="font-medium font-mono">{maskAccountNumber(app.bankAccountNumber)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">平台与推广</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          {app.selectedPlatforms.length > 0 && (
            <div className="col-span-2">
              <p className="text-zinc-400 text-xs">选择平台</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {app.selectedPlatforms.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                ))}
              </div>
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

      {/* Agreement */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">协议签署</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Row label="协议已接受" value={app.agreementAccepted ? '是' : '否'} />
          <Row label="设置费已确认" value={app.setupFeeAccepted ? '是' : '否'} />
          <Row label="申请人姓名" value={app.applicantName} />
          <Row label="申请人职位" value={app.applicantPosition} />
          <Row label="申请日期" value={app.applicantDate} />
          <Row label="见证人姓名" value={app.witnessName} />
          <Row label="见证日期" value={app.witnessDate} />
        </CardContent>
      </Card>

      {/* Admin notes */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">内部备注 Admin Notes（仅 Admin 可见）</CardTitle></CardHeader>
        <CardContent>
          <AdminNotesForm applicationId={id} initialNote={app.adminNotes} />
        </CardContent>
      </Card>
    </div>
  )
}
