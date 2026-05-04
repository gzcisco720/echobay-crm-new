import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { SendInvitationForm } from '@/components/shared/admin/send-invitation-form'
import { CancelInvitationButton } from '@/components/shared/admin/cancel-invitation-button'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const session = await auth()
  await connectDB()

  const invitations = await MerchantInvitationModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return (
    <div className="w-full flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">发送新邀请 Send Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <SendInvitationForm adminUserId={session!.user.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">邀请记录 History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <p className="text-zinc-400 text-sm p-6">暂无邀请记录。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>邮箱</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv._id.toString()}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      {inv.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">待使用</span>
                      )}
                      {inv.status === 'used' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">已使用</span>
                      )}
                      {inv.status === 'expired' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">已过期</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-400 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString('zh-CN')} → {new Date(inv.expiresAt).toLocaleDateString('zh-CN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inv.status === 'pending' && (
                        <CancelInvitationButton invitationId={inv._id.toString()} />
                      )}
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
