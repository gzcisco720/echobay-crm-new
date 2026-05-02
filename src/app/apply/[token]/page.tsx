import { redirect } from 'next/navigation'
import { validateInvitationToken } from '@/lib/actions/invitation.actions'
import { ApplicationForm } from '@/components/shared/merchant-form/application-form'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ApplyPage({ params }: Props) {
  const { token } = await params
  const result = await validateInvitationToken(token)

  if (!result.success) {
    redirect('/apply/invalid')
  }

  const { email } = result.data

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
            EB
          </div>
          <span className="font-semibold text-zinc-900">EchoBay</span>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            商家入驻申请{' '}
            <span className="text-zinc-500 font-normal text-lg">Merchant Application</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            邀请邮箱：<span className="font-medium text-zinc-700">{email}</span>
          </p>
        </div>
        <ApplicationForm token={token} email={email} />
      </div>
    </main>
  )
}
