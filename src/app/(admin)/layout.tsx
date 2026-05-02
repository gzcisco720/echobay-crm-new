import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-48 border-r border-zinc-200 bg-white flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
            EB
          </div>
          <span className="font-semibold text-sm">Admin</span>
        </div>
        <nav className="flex-1 p-3">
          <Link
            href="/admin/invitations"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-100"
          >
            邀请管理
          </Link>
        </nav>
        <div className="p-3 border-t border-zinc-100 text-xs text-zinc-400">
          {session.user.email}
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
