import Image from 'next/image'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/shared/auth/forgot-password-form'
import { getTranslations } from 'next-intl/server'

export default async function ForgotPasswordPage(): Promise<React.ReactElement> {
  const t = await getTranslations('auth.forgotPassword')
  const tLogin = await getTranslations('auth.login')

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">{tLogin('title')}</h1>
        <p className="text-blue-200 text-sm text-center">{tLogin('tagline')}</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{t('title')}</h2>
            <p className="text-slate-500 text-sm">{t('description')}</p>
          </div>
          <ForgotPasswordForm />
          <p className="text-center mt-6 text-sm text-slate-500">
            <Link href="/login" className="text-[#0BB5C4] hover:underline">{t('backToLogin')}</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
