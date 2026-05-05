import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import Image from 'next/image'
import { LoginForm } from '@/components/shared/auth/login-form'
import { getTranslations } from 'next-intl/server'

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props): Promise<React.ReactElement> {
  const session = await auth()
  if (session?.user) {
    const { callbackUrl } = await searchParams
    const role = session.user.role
    if (callbackUrl) redirect(callbackUrl)
    if (role === 'admin' || role === 'super_admin') redirect('/admin/dashboard')
    else redirect('/merchant/dashboard')
  }

  const t = await getTranslations('auth.login')

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">{t('title')}</h1>
        <p className="text-blue-200 text-sm text-center">{t('tagline')}</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Image src="/logo.png" alt="EchoBay" width={40} height={40} className="object-contain" />
            <span className="font-bold text-slate-900">{t('title')}</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{t('loginButton')}</h2>
            <p className="text-slate-500 text-sm">{t('subtitle')}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
