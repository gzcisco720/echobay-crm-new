import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { SidebarNav } from '@/components/shared/merchant-portal/sidebar-nav'
import { AppHeader } from '@/components/shared/layout/app-header'

export default async function MerchantLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const session = await auth()
  if (!session || session.user.role !== 'merchant') redirect('/login')

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto bg-[#F1F5F9] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
