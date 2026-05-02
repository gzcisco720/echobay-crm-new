'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FileText, Upload, Store, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/merchant/dashboard', icon: LayoutDashboard, label: '仪表盘', labelEn: 'Dashboard' },
  { href: '/merchant/application', icon: FileText, label: '申请详情', labelEn: 'Application' },
  { href: '/merchant/documents', icon: Upload, label: '文件上传', labelEn: 'Documents' },
  { href: '/merchant/brand', icon: Store, label: '品牌信息', labelEn: 'Brand' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r border-zinc-200 bg-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-zinc-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
          EB
        </div>
        <span className="font-semibold text-sm">EchoBay</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-zinc-100">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-zinc-500"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut size={15} />
          退出登录
        </Button>
      </div>
    </aside>
  )
}
