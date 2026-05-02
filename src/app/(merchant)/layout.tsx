import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { SidebarNav } from '@/components/shared/merchant-portal/sidebar-nav'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'merchant') redirect('/login')

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
