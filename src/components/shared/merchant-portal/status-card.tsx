import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; labelEn: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:         { label: '草稿',   labelEn: 'Draft',          variant: 'outline' },
  submitted:     { label: '已提交', labelEn: 'Submitted',      variant: 'secondary' },
  under_review:  { label: '审核中', labelEn: 'Under Review',   variant: 'default' },
  approved:      { label: '已批准', labelEn: 'Approved',       variant: 'default' },
  rejected:      { label: '已拒绝', labelEn: 'Rejected',       variant: 'destructive' },
  requires_info: { label: '需补充', labelEn: 'Info Required',  variant: 'destructive' },
}

interface Props {
  status: ApplicationStatus
  companyName: string
  submittedAt?: Date
}

export function StatusCard({ status, companyName, submittedAt }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">申请状态 · Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900">{companyName}</p>
            {submittedAt && (
              <p className="text-zinc-500 text-xs mt-0.5">
                提交于 {submittedAt.toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
          <Badge variant={config.variant} className="text-sm px-3 py-1">
            {config.label} · {config.labelEn}
          </Badge>
        </div>

        {status === 'requires_info' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            您的申请需要补充资料。请前往「申请详情」查看具体说明。
          </div>
        )}
        {status === 'approved' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            🎉 恭喜！您的入驻申请已批准。请前往「品牌信息」查看合作详情。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
