import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    const role = session.user.role
    if (role === 'admin' || role === 'super_admin') {
      redirect('/admin/dashboard')
    }
    redirect('/merchant/dashboard')
  }
  redirect('/login')
}
