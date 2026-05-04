import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { AdminSidebar } from '@/components/shared/layout/admin-sidebar'
import { AppHeader } from '@/components/shared/layout/app-header'

export default async function AdminLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const session = await auth()
  if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/login')
  }

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar email={session.user.email ?? ''} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto bg-[#F1F5F9] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
