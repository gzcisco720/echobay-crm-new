# Sub-project E: i18n 中英双语 — Implementation Plan

> **For agentic workers:** Use superpowers:test-driven-development for action tests. Steps use checkbox syntax for tracking.

**Goal:** Add Chinese/English language switching to EchoBay CRM using next-intl with cookie-based locale (no URL restructuring).

**Architecture:** next-intl v3 reads locale from `NEXT_LOCALE` cookie; `NextIntlClientProvider` in root layout supplies translations to all Client Components; Server Components call `getTranslations()`; a `LocaleSwitcher` in AppHeader toggles via Server Action.

**Tech Stack:** next-intl v3, Next.js 16 App Router, TypeScript.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add next-intl |
| `i18n/request.ts` | Create | next-intl server config (reads NEXT_LOCALE cookie) |
| `next.config.ts` | Modify | Wrap with createNextIntlPlugin |
| `src/lib/actions/locale.actions.ts` | Create | Server Action to set NEXT_LOCALE cookie |
| `src/components/shared/layout/locale-switcher.tsx` | Create | Client Component toggle button |
| `src/app/layout.tsx` | Modify | Add NextIntlClientProvider + dynamic lang attr |
| `src/components/shared/layout/app-header.tsx` | Modify | Add LocaleSwitcher; use useTranslations for ROUTE_TITLES |
| `src/components/shared/layout/admin-sidebar.tsx` | Modify | Use useTranslations for NAV_ITEMS |
| `src/components/shared/merchant-portal/sidebar-nav.tsx` | Modify | Use useTranslations for NAV_ITEMS |
| `src/components/shared/status-badge.tsx` | Modify | Use useTranslations for STATUS_LABEL |
| `messages/zh.json` | Create | Chinese translations (default) |
| `messages/en.json` | Create | English translations |
| Admin pages (8) | Modify | Replace hardcoded strings with t() calls |
| Merchant pages (6) | Modify | Replace hardcoded strings with t() calls |
| Auth/apply pages (5) | Modify | Replace hardcoded strings with t() calls |

---

## Task 1: Install next-intl

- [ ] **Step 1.1: Install**
```bash
pnpm add next-intl
```

- [ ] **Step 1.2: Verify**
```bash
node -e "require('next-intl'); console.log('ok')"
```

---

## Task 2: Infrastructure files

**Files:**
- Create: `i18n/request.ts`
- Modify: `next.config.ts`

- [ ] **Step 2.1: Create i18n/request.ts**

```typescript
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value ?? 'zh'
  const locale = (['zh', 'en'] as const).includes(raw as 'zh' | 'en') ? (raw as 'zh' | 'en') : 'zh'
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 2.2: Update next.config.ts**

```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {}
export default withNextIntl(nextConfig)
```

- [ ] **Step 2.3: Run build to verify config loads**
```bash
pnpm build 2>&1 | grep -E "error|Error" | grep -v node_modules | head -5 && echo "ok"
```

---

## Task 3: Locale Server Action + LocaleSwitcher

**Files:**
- Create: `src/lib/actions/locale.actions.ts`
- Create: `src/components/shared/layout/locale-switcher.tsx`

- [ ] **Step 3.1: Create locale.actions.ts**

```typescript
'use server'

import { cookies } from 'next/headers'

export async function setLocale(locale: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
}
```

- [ ] **Step 3.2: Create locale-switcher.tsx**

```typescript
'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLocale } from '@/lib/actions/locale.actions'
import { useLocale } from 'next-intl'

export function LocaleSwitcher(): React.JSX.Element {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = locale === 'zh' ? 'en' : 'zh'
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-400 disabled:opacity-50"
      aria-label="Switch language"
    >
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  )
}
```

- [ ] **Step 3.3: Run lint**
```bash
pnpm lint 2>&1 | tail -5
```

---

## Task 4: Update Root Layout + AppHeader

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/shared/layout/app-header.tsx`

- [ ] **Step 4.1: Update layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'EchoBay CRM',
  description: 'EchoBay CRM',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4.2: Update app-header.tsx**

Replace the full file content:

```typescript
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
  routeTitles: Record<string, string>
): { title: string; parentHref?: string; parentLabel?: string } {
  if (routeTitles[pathname]) return { title: routeTitles[pathname] }

  const parent = Object.entries(routeTitles)
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
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')

  const routeTitles: Record<string, string> = {
    '/admin/dashboard': t('admin.dashboard'),
    '/admin/invitations': t('admin.invitations'),
    '/admin/applications': t('admin.applications'),
    '/admin/merchants': t('admin.merchants'),
    '/admin/brands': t('admin.brands'),
    '/admin/stores': t('admin.stores'),
    '/admin/promotions': t('admin.promotions'),
    '/admin/hero-products': t('admin.heroProducts'),
    '/merchant/dashboard': t('merchant.dashboard'),
    '/merchant/application': t('merchant.application'),
    '/merchant/documents': t('merchant.documents'),
    '/merchant/brand': t('merchant.brand'),
    '/merchant/store': t('merchant.store'),
    '/merchant/promotions': t('merchant.promotions'),
  }

  const { title, parentHref, parentLabel } = getRouteInfo(pathname, routeTitles)

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
```

---

## Task 5: Create translation files (zh.json + en.json)

**Files:**
- Create: `messages/zh.json`
- Create: `messages/en.json`

- [ ] **Step 5.1: Create messages/zh.json**

(Written separately due to size — see plan execution step)

- [ ] **Step 5.2: Create messages/en.json**

(Written separately due to size — see plan execution step)

- [ ] **Step 5.3: Verify files load**
```bash
node -e "const zh = require('./messages/zh.json'); console.log(Object.keys(zh))"
```

---

## Task 6: Update AdminSidebar + MerchantSidebar + StatusBadge

**Files:**
- Modify: `src/components/shared/layout/admin-sidebar.tsx`
- Modify: `src/components/shared/merchant-portal/sidebar-nav.tsx`
- Modify: `src/components/shared/status-badge.tsx`

These use `useTranslations` (Client Components / converted to Client Component for StatusBadge).

- [ ] **Step 6.1: Update admin-sidebar.tsx**
Replace NAV_ITEMS labels with t() calls from `useTranslations('nav.admin')`.

- [ ] **Step 6.2: Update sidebar-nav.tsx**
Replace NAV_ITEMS labels with t() calls from `useTranslations('nav.merchant')`.

- [ ] **Step 6.3: Update status-badge.tsx**
Add 'use client', import useTranslations, replace STATUS_LABEL map with t() calls.

- [ ] **Step 6.4: Run lint + build**
```bash
pnpm lint && pnpm build 2>&1 | grep -E "Type error" | head -5 && echo "ok"
```

- [ ] **Step 6.5: Commit infrastructure**
```bash
git add -A && git commit -m "feat: i18n infrastructure — next-intl + cookie switcher + shared components"
```

---

## Task 7: Update admin pages

Update the following pages to use `getTranslations` (Server Components):
- `src/app/(admin)/admin/dashboard/page.tsx`
- `src/app/(admin)/admin/applications/page.tsx`
- `src/app/(admin)/admin/applications/[id]/page.tsx`
- `src/app/(admin)/admin/invitations/page.tsx`
- `src/app/(admin)/admin/merchants/page.tsx`
- `src/app/(admin)/admin/brands/page.tsx`
- `src/app/(admin)/admin/stores/page.tsx`
- `src/app/(admin)/admin/promotions/page.tsx`
- `src/app/(admin)/admin/hero-products/page.tsx`

Pattern for each:
```typescript
import { getTranslations } from 'next-intl/server'
// In page function:
const t = await getTranslations('admin.pageName')
// Then use t('key') for each hardcoded Chinese string
```

- [ ] **Step 7.1–7.9:** Update each page (implemented during execution)
- [ ] **Step 7.10: Run lint + build**
- [ ] **Step 7.11: Commit**
```bash
git add -A && git commit -m "feat: i18n admin pages"
```

---

## Task 8: Update merchant pages

Pages:
- `src/app/(merchant)/merchant/dashboard/page.tsx`
- `src/app/(merchant)/merchant/application/page.tsx`
- `src/app/(merchant)/merchant/documents/page.tsx`
- `src/app/(merchant)/merchant/brand/page.tsx`
- `src/app/(merchant)/merchant/store/page.tsx`
- `src/app/(merchant)/merchant/promotions/page.tsx`

- [ ] **Step 8.1–8.6:** Update each page
- [ ] **Step 8.7: Commit**
```bash
git add -A && git commit -m "feat: i18n merchant pages"
```

---

## Task 9: Update auth + apply pages

Pages:
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/forgot-password/page.tsx`
- `src/app/apply/[token]/page.tsx`
- `src/app/apply/[token]/invalid/page.tsx`

- [ ] **Step 9.1–9.4:** Update each page
- [ ] **Step 9.5: Commit**
```bash
git add -A && git commit -m "feat: i18n auth + apply pages"
```

---

## Task 10: Update shared form/action components

Client Components with hardcoded strings:
- `src/components/shared/delete-button.tsx`
- `src/components/shared/document-list-item.tsx`
- `src/components/merchant/document-uploader-client.tsx`
- `src/components/merchant/pending-request-card.tsx`
- `src/components/admin/admin-document-request-form.tsx`
- Admin/merchant form components in `src/components/forms/`
- `src/components/shared/admin/application-review-panel.tsx`
- `src/components/shared/admin/admin-notes-form.tsx`

- [ ] **Step 10.1–10.N:** Update each component
- [ ] **Step 10.N+1: Commit**
```bash
git add -A && git commit -m "feat: i18n shared form components"
```

---

## Task 11: Quality gates

- [ ] **Step 11.1: Full test suite**
```bash
pnpm lint && pnpm test 2>&1 | tail -6 && pnpm build 2>&1 | grep "error" | head -5 && echo "all ok"
```

- [ ] **Step 11.2: Update task_plan.md + progress.md**

- [ ] **Step 11.3: Final commit**
```bash
git add -A && git commit -m "feat: Sub-project E complete — i18n Chinese/English switching"
```
