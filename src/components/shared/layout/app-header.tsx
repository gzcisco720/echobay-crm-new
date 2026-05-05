'use client'
import React from 'react'

import { usePathname } from 'next/navigation'
import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './locale-switcher'

interface AppHeaderUser {
  name?: string | null
  email?: string | null
  role: string
}

function getRouteInfo(
  pathname: string,
  routeTitles: Record<string, string>,
  breadcrumb: { new: string; edit: string; detail: string }
): { title: string; parentHref?: string; parentLabel?: string } {
  if (routeTitles[pathname]) return { title: routeTitles[pathname] }

  const parent = Object.entries(routeTitles)
    .filter(([route]) => pathname.startsWith(route + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]

  if (parent) {
    const isNew = pathname.endsWith('/new')
    const isEdit = pathname.endsWith('/edit')
    const suffix = isNew ? breadcrumb.new : isEdit ? breadcrumb.edit : breadcrumb.detail
    return { title: suffix, parentHref: parent[0], parentLabel: parent[1] }
  }

  return { title: 'EchoBay CRM' }
}

export function AppHeader({ user }: { user: AppHeaderUser }): React.JSX.Element {
  const pathname = usePathname()
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')

  const routeTitles: Record<string, string> = {
    '/admin/dashboard': tNav('admin.dashboard'),
    '/admin/invitations': tNav('admin.invitations'),
    '/admin/applications': tNav('admin.applications'),
    '/admin/merchants': tNav('admin.merchants'),
    '/admin/brands': tNav('admin.brands'),
    '/admin/stores': tNav('admin.stores'),
    '/admin/promotions': tNav('admin.promotions'),
    '/admin/hero-products': tNav('admin.heroProducts'),
    '/merchant/dashboard': tNav('merchant.dashboard'),
    '/merchant/application': tNav('merchant.application'),
    '/merchant/documents': tNav('merchant.documents'),
    '/merchant/brand': tNav('merchant.brand'),
    '/merchant/store': tNav('merchant.store'),
    '/merchant/promotions': tNav('merchant.promotions'),
  }

  const breadcrumb = {
    new: tNav('breadcrumb.new'),
    edit: tNav('breadcrumb.edit'),
    detail: tNav('breadcrumb.detail'),
  }

  const { title, parentHref, parentLabel } = getRouteInfo(pathname, routeTitles, breadcrumb)

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
        <LocaleSwitcher />
        <button
          type="button"
          aria-label={tCommon('notification')}
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
              {isAdmin ? tCommon('admin') : tCommon('merchant')}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
