import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { LoginForm } from '@/components/shared/auth/login-form'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    const role = session.user.role
    if (role === 'admin' || role === 'super_admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/merchant/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            EB
          </div>
          <span className="font-semibold text-zinc-900">EchoBay</span>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
