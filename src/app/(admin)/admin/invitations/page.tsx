import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SendInvitationForm } from '@/components/shared/admin/send-invitation-form'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const session = await auth()
  await connectDB()

  const invitations = await MerchantInvitationModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'default',
    used: 'secondary',
    expired: 'outline',
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="text-xl font-bold">邀请管理 · Invitations</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">发送新邀请 Send Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <SendInvitationForm adminUserId={session!.user.id} onSuccess={() => {}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">邀请记录 History</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无邀请记录。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div
                  key={inv._id.toString()}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-sm"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{inv.email}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {new Date(inv.createdAt).toLocaleDateString('zh-CN')} ·
                      到期 {new Date(inv.expiresAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[inv.status] ?? 'outline'}>
                    {inv.status === 'pending' ? '待使用' : inv.status === 'used' ? '已使用' : '已过期'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
