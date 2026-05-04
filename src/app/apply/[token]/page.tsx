import Image from 'next/image'
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
    redirect(`/apply/${token}/invalid`)
  }

  const { email } = result.data

  return (
    <main className="min-h-screen bg-[#F1F5F9] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/logo.png" alt="EchoBay" width={40} height={40} className="object-contain" />
          <div>
            <h1 className="text-lg font-bold text-[#1B3F72]">EchoBay CRM</h1>
            <p className="text-sm text-slate-500">商户入驻申请</p>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            商家入驻申请{' '}
            <span className="text-zinc-500 font-normal text-lg">Merchant Application</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            邀请邮箱：<span className="font-medium text-zinc-700">{email}</span>
          </p>
        </div>
        <ApplicationForm token={token} email={email} />
      </div>
    </main>
  )
}
