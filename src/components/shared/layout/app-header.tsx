'use client'

import { usePathname } from 'next/navigation'
import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AppHeaderUser {
  name?: string | null
  email?: string | null
  role: string
}

const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': '数据概览',
  '/admin/invitations': '邀请管理',
  '/admin/applications': '申请审核',
  '/admin/merchants': '商户管理',
  '/admin/brands': '品牌管理',
  '/admin/stores': '门店管理',
  '/admin/promotions': '推广活动',
  '/admin/hero-products': '特色产品',
  '/merchant/dashboard': '仪表盘',
  '/merchant/application': '申请详情',
  '/merchant/documents': '文件上传',
  '/merchant/brand': '品牌信息',
  '/merchant/store': '我的门店',
  '/merchant/promotions': '推广活动',
}

function getRouteInfo(pathname: string): {
  title: string
  parentHref?: string
  parentLabel?: string
} {
  if (ROUTE_TITLES[pathname]) return { title: ROUTE_TITLES[pathname] }

  const parent = Object.entries(ROUTE_TITLES)
    .filter(([route]) => pathname.startsWith(route + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]

  if (parent) {
    const isNew = pathname.endsWith('/new')
    const isEdit = pathname.endsWith('/edit')
    const suffix = isNew ? '新建' : isEdit ? '编辑' : '详情'
    return { title: suffix, parentHref: parent[0], parentLabel: parent[1] }
  }

  return { title: 'EchoBay CRM' }
}

export function AppHeader({ user }: { user: AppHeaderUser }): React.JSX.Element {
  const pathname = usePathname()
  const { title, parentHref, parentLabel } = getRouteInfo(pathname)

  const initials = user.name
    ? user.name.trim().split(/\s+/).map((n) => n[0] ?? '').join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? '?').toUpperCase()

  const isAdmin = user.role === 'admin' || user.role === 'super_admin'

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm">
        {parentHref && parentLabel && (
          <>
            <Link href={parentHref} className="text-slate-400 hover:text-slate-600 transition-colors">
              {parentLabel}
            </Link>
            <ChevronRight size={14} className="text-slate-300" />
          </>
        )}
        <span className="font-semibold text-slate-800">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="通知"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell size={18} />
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-[#0BB5C4] text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-slate-800">{user.name ?? user.email}</span>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full w-fit font-medium mt-0.5',
              isAdmin ? 'bg-[#1B3F72] text-white' : 'bg-[#0BB5C4] text-white'
            )}>
              {isAdmin ? 'Admin' : 'Merchant'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
