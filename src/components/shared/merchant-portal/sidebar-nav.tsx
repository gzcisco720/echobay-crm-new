'use client'
import React from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FileText, Upload, Store, LogOut, Building2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function SidebarNav(): React.JSX.Element {
  const pathname = usePathname()
  const t = useTranslations('nav.merchant')
  const tCommon = useTranslations('common')

  const navItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/merchant/application', icon: FileText, label: t('application') },
    { href: '/merchant/documents', icon: Upload, label: t('documents') },
    { href: '/merchant/brand', icon: Store, label: t('brand') },
    { href: '/merchant/store', icon: Building2, label: t('store') },
    { href: '/merchant/promotions', icon: Tag, label: t('promotions') },
  ]

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[#1B3F72] h-screen sticky top-0">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#2A5496]">
        <Image src="/logo.png" alt="EchoBay" width={32} height={32} className="object-contain" />
        <span className="font-semibold text-white text-sm tracking-wide">EchoBay</span>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors duration-150 border-l-[3px]',
                active
                  ? 'bg-[rgba(11,181,196,0.15)] text-white border-[#0BB5C4] pl-[calc(0.75rem-3px)]'
                  : 'text-slate-400 hover:bg-[#152F56] hover:text-white border-transparent pl-[calc(0.75rem-3px)]'
              )}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[#2A5496]">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-slate-400 hover:bg-[#152F56] hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>{tCommon('logout')}</span>
        </button>
      </div>
    </aside>
  )
}
