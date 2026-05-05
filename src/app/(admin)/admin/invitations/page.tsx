import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { SendInvitationForm } from '@/components/shared/admin/send-invitation-form'
import { CancelInvitationButton } from '@/components/shared/admin/cancel-invitation-button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const session = await auth()
  await connectDB()
  const t = await getTranslations('admin.invitations')
  const tStatus = await getTranslations('status')

  const invitations = await MerchantInvitationModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return (
    <div className="w-full flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('sendInvitation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SendInvitationForm adminUserId={session!.user.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <p className="text-zinc-400 text-sm p-6">{t('noInvitations')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('emailLabel')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('expiresAt')}</TableHead>
                  <TableHead>{t('cancelInvitation')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv._id.toString()}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      {inv.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{tStatus('pending')}</span>
                      )}
                      {inv.status === 'used' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">{tStatus('used')}</span>
                      )}
                      {inv.status === 'expired' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">{tStatus('expired')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-400 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString()} → {new Date(inv.expiresAt).toLocaleDateString()}
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
