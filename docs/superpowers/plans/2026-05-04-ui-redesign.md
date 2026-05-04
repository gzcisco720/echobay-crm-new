# EchoBay CRM UI 全面重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign the visual appearance of EchoBay CRM — brand colors from the EchoBay logo (deep navy + teal), dark sidebar, fixed header bar, and full-width layouts across all pages.

**Architecture:** Foundation-first — update CSS tokens and create two shared layout components (AdminSidebar, AppHeader) first, then update each page to remove `max-w-*` constraints and apply brand colors. No business logic changes; only visual/structural JSX/CSS changes.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, ShadCN/ui, Lucide React, `next/font/google` (Inter), `@testing-library/react`

**Mongoose note:** Per CLAUDE.md, all Mongoose queries must chain `.lean()` and `.exec()`. Preserve these on all existing queries when refactoring pages.

---

## Brand Color Reference

| Purpose | Value |
|---|---|
| Sidebar background | `#1B3F72` (deep navy) |
| Sidebar hover | `#152F56` |
| Sidebar border | `#2A5496` |
| Brand teal (buttons, active states) | `#0BB5C4` |
| Brand teal hover | `#099EAB` |
| Active nav bg | `rgba(11,181,196,0.15)` |
| Content background | `#F1F5F9` |

---

## File Map

**New files:**
- `public/logo.png` — EchoBay logo copied from archive
- `src/components/shared/layout/admin-sidebar.tsx`
- `src/components/shared/layout/app-header.tsx`
- `src/components/shared/status-badge.tsx`
- `src/components/ui/data-table.tsx`
- `__tests__/unit/components/admin-sidebar.test.tsx`
- `__tests__/unit/components/app-header.test.tsx`
- `__tests__/unit/components/status-badge.test.tsx`

**Modified files:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(merchant)/layout.tsx`
- `src/components/shared/merchant-portal/sidebar-nav.tsx`
- All 34 page files (remove `max-w-*`, remove `<h1>` titles, apply brand colors)

---

### Task 1: Logo + CSS tokens + font

**Files:**
- Copy: `archive/echobay-crm/frontend/app/src/assets/images/logo-light.png` → `public/logo.png`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Copy logo to public/**

```bash
cp archive/echobay-crm/frontend/app/src/assets/images/logo-light.png public/logo.png
ls -la public/logo.png
```

Expected: file exists.

- [ ] **Step 2: Replace `:root` block and `@theme inline` in `src/app/globals.css`**

Write the full file content below. Key changes: brand teal as `--primary`, deep navy in sidebar tokens, add `--success` and `--warning` extras.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-success: var(--success);
  --color-warning: var(--warning);
}

:root {
  --primary: oklch(0.68 0.095 204);
  --primary-foreground: oklch(1 0 0);
  --background: oklch(0.97 0.004 248);
  --foreground: oklch(0.12 0.02 264);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.12 0.02 264);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.12 0.02 264);
  --secondary: oklch(0.96 0.004 248);
  --secondary-foreground: oklch(0.12 0.02 264);
  --muted: oklch(0.96 0.004 248);
  --muted-foreground: oklch(0.52 0.025 254);
  --accent: oklch(0.96 0.004 248);
  --accent-foreground: oklch(0.12 0.02 264);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.008 248);
  --input: oklch(0.92 0.008 248);
  --ring: oklch(0.68 0.095 204);
  --radius: 0.625rem;
  --chart-1: oklch(0.68 0.095 204);
  --chart-2: oklch(0.70 0.16 160);
  --chart-3: oklch(0.80 0.18 75);
  --chart-4: oklch(0.577 0.245 27.325);
  --chart-5: oklch(0.29 0.10 255);
  --sidebar: oklch(0.29 0.10 255);
  --sidebar-foreground: oklch(0.75 0.02 255);
  --sidebar-primary: oklch(0.68 0.095 204);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.22 0.09 255);
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(0.32 0.08 255);
  --sidebar-ring: oklch(0.68 0.095 204);
  --success: oklch(0.70 0.16 160);
  --warning: oklch(0.80 0.18 75);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.68 0.095 204);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.68 0.095 204);
  --chart-1: oklch(0.68 0.095 204);
  --chart-2: oklch(0.70 0.16 160);
  --chart-3: oklch(0.80 0.18 75);
  --chart-4: oklch(0.577 0.245 27.325);
  --chart-5: oklch(0.29 0.10 255);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.68 0.095 204);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.68 0.095 204);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 3: Update `src/app/layout.tsx` — Inter font + metadata**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'EchoBay CRM',
  description: 'EchoBay 商户管理平台',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Start dev server and verify it loads**

```bash
pnpm dev
```

Open http://localhost:3000 — page loads without crash. Stop server.

- [ ] **Step 5: Commit**

```bash
git add public/logo.png src/app/globals.css src/app/layout.tsx
git commit -m "feat: EchoBay brand tokens, Inter font, logo asset"
```

---

### Task 2: AdminSidebar component

**Files:**
- Create: `src/components/shared/layout/admin-sidebar.tsx`
- Create: `__tests__/unit/components/admin-sidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

`__tests__/unit/components/admin-sidebar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '@/components/shared/layout/admin-sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/dashboard' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }))

describe('AdminSidebar', () => {
  it('renders all 8 nav items', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByText('数据概览')).toBeInTheDocument()
    expect(screen.getByText('邀请管理')).toBeInTheDocument()
    expect(screen.getByText('申请审核')).toBeInTheDocument()
    expect(screen.getByText('商户管理')).toBeInTheDocument()
    expect(screen.getByText('品牌管理')).toBeInTheDocument()
    expect(screen.getByText('门店管理')).toBeInTheDocument()
    expect(screen.getByText('推广活动')).toBeInTheDocument()
    expect(screen.getByText('特色产品')).toBeInTheDocument()
  })

  it('renders EchoBay logo image', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByAltText('EchoBay')).toBeInTheDocument()
  })

  it('renders user email in footer', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('dashboard link points to correct href', () => {
    render(<AdminSidebar email="admin@test.com" />)
    const link = screen.getByText('数据概览').closest('a')
    expect(link).toHaveAttribute('href', '/admin/dashboard')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm test:unit --testPathPattern="admin-sidebar"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AdminSidebar**

`src/components/shared/layout/admin-sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Mail, ClipboardList, Users,
  Building2, Store, Tag, Star, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '数据概览' },
  { href: '/admin/invitations', icon: Mail, label: '邀请管理' },
  { href: '/admin/applications', icon: ClipboardList, label: '申请审核' },
  { href: '/admin/merchants', icon: Users, label: '商户管理' },
  { href: '/admin/brands', icon: Building2, label: '品牌管理' },
  { href: '/admin/stores', icon: Store, label: '门店管理' },
  { href: '/admin/promotions', icon: Tag, label: '推广活动' },
  { href: '/admin/hero-products', icon: Star, label: '特色产品' },
]

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[#1B3F72] h-screen sticky top-0">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#2A5496]">
        <Image src="/logo.png" alt="EchoBay" width={32} height={32} className="object-contain" />
        <span className="font-semibold text-white text-sm tracking-wide">EchoBay</span>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
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
        <p className="text-xs text-slate-500 truncate px-2 mb-2">{email}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#152F56] transition-colors duration-150 cursor-pointer"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pnpm test:unit --testPathPattern="admin-sidebar"
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/layout/admin-sidebar.tsx __tests__/unit/components/admin-sidebar.test.tsx
git commit -m "feat: AdminSidebar — navy background, teal active state, logout"
```

---

### Task 3: AppHeader component

**Files:**
- Create: `src/components/shared/layout/app-header.tsx`
- Create: `__tests__/unit/components/app-header.test.tsx`

- [ ] **Step 1: Write the failing test**

`__tests__/unit/components/app-header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { AppHeader } from '@/components/shared/layout/app-header'

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/dashboard' }))

const adminUser = { name: 'Test Admin', email: 'admin@test.com', role: 'admin' as const }
const merchantUser = { name: 'Test Merchant', email: 'm@test.com', role: 'merchant' as const }

describe('AppHeader', () => {
  it('shows page title derived from pathname', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('数据概览')).toBeInTheDocument()
  })

  it('shows user initials in avatar', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('TA')).toBeInTheDocument()
  })

  it('shows user name', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('Test Admin')).toBeInTheDocument()
  })

  it('shows Admin badge for admin role', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows Merchant badge for merchant role', () => {
    render(<AppHeader user={merchantUser} />)
    expect(screen.getByText('Merchant')).toBeInTheDocument()
  })

  it('renders notification bell button', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByLabelText('通知')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm test:unit --testPathPattern="app-header"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AppHeader**

`src/components/shared/layout/app-header.tsx`:

```tsx
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

export function AppHeader({ user }: { user: AppHeaderUser }) {
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pnpm test:unit --testPathPattern="app-header"
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/layout/app-header.tsx __tests__/unit/components/app-header.test.tsx
git commit -m "feat: AppHeader — breadcrumbs, user avatar, role badge, notification bell"
```

---

### Task 4: StatusBadge + DataTable components

**Files:**
- Create: `src/components/shared/status-badge.tsx`
- Create: `src/components/ui/data-table.tsx`
- Create: `__tests__/unit/components/status-badge.test.tsx`

- [ ] **Step 1: Write failing test**

`__tests__/unit/components/status-badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/status-badge'

describe('StatusBadge', () => {
  const cases = [
    { status: 'approved', label: '已批准', classes: ['bg-emerald-100', 'text-emerald-700'] },
    { status: 'rejected', label: '已拒绝', classes: ['bg-red-100', 'text-red-700'] },
    { status: 'requires_info', label: '需补充', classes: ['bg-amber-100', 'text-amber-700'] },
    { status: 'submitted', label: '已提交', classes: ['bg-blue-100', 'text-blue-700'] },
    { status: 'under_review', label: '审核中', classes: ['bg-blue-100', 'text-blue-700'] },
    { status: 'draft', label: '草稿', classes: ['bg-slate-100', 'text-slate-600'] },
  ]

  cases.forEach(({ status, label, classes }) => {
    it(`renders "${label}" with correct classes for status "${status}"`, () => {
      const { container } = render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      classes.forEach((cls) => expect(container.firstChild).toHaveClass(cls))
    })
  })

  it('renders unknown status as-is with fallback styling', () => {
    render(<StatusBadge status="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm test:unit --testPathPattern="status-badge"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement StatusBadge**

`src/components/shared/status-badge.tsx`:

```tsx
import { cn } from '@/lib/utils'

type KnownStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_info'

const STATUS_STYLES: Record<KnownStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  requires_info: 'bg-amber-100 text-amber-700',
}

const STATUS_LABEL: Record<KnownStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已批准',
  rejected: '已拒绝',
  requires_info: '需补充',
}

export function StatusBadge({ status }: { status: string }) {
  const key = status as KnownStatus
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-600'
    )}>
      {STATUS_LABEL[key] ?? status}
    </span>
  )
}
```

- [ ] **Step 4: Implement DataTable primitives**

`src/components/ui/data-table.tsx`:

```tsx
import { cn } from '@/lib/utils'

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-slate-50 transition-colors', className)}>{children}</tr>
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function TableCell({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', className)} colSpan={colSpan}>
      {children}
    </td>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test:unit --testPathPattern="status-badge"
```

Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/status-badge.tsx src/components/ui/data-table.tsx __tests__/unit/components/status-badge.test.tsx
git commit -m "feat: StatusBadge semantic colors, DataTable primitives"
```

---

### Task 5: Update layout files + merchant sidebar

**Files:**
- Modify: `src/app/(admin)/layout.tsx`
- Modify: `src/app/(merchant)/layout.tsx`
- Modify: `src/components/shared/merchant-portal/sidebar-nav.tsx`

- [ ] **Step 1: Rewrite `src/app/(admin)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { AdminSidebar } from '@/components/shared/layout/admin-sidebar'
import { AppHeader } from '@/components/shared/layout/app-header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
```

- [ ] **Step 2: Rewrite `src/components/shared/merchant-portal/sidebar-nav.tsx`**

Same dark sidebar pattern as AdminSidebar but with merchant nav items:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FileText, Upload, Store, LogOut, Building2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/merchant/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { href: '/merchant/application', icon: FileText, label: '申请详情' },
  { href: '/merchant/documents', icon: Upload, label: '文件上传' },
  { href: '/merchant/brand', icon: Store, label: '品牌信息' },
  { href: '/merchant/store', icon: Building2, label: '我的门店' },
  { href: '/merchant/promotions', icon: Tag, label: '推广活动' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[#1B3F72] h-screen sticky top-0">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#2A5496]">
        <Image src="/logo.png" alt="EchoBay" width={32} height={32} className="object-contain" />
        <span className="font-semibold text-white text-sm tracking-wide">EchoBay</span>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
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
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#152F56] transition-colors duration-150 cursor-pointer"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Rewrite `src/app/(merchant)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import { SidebarNav } from '@/components/shared/merchant-portal/sidebar-nav'
import { AppHeader } from '@/components/shared/layout/app-header'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
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
```

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/layout.tsx src/app/(merchant)/layout.tsx src/components/shared/merchant-portal/sidebar-nav.tsx
git commit -m "feat: admin + merchant layouts with dark sidebar and fixed header"
```

---

### Task 6: Auth pages — two-column brand layout

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/login/forgot-password/page.tsx`
- Modify: `src/app/(auth)/login/reset-password/page.tsx`

The left panel pattern for all three auth pages is identical — deep navy to teal gradient with logo. Right panel is white with the form.

- [ ] **Step 1: Create a shared left-panel pattern**

All three pages use this same left panel JSX (inline, no shared component needed):

```tsx
<div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
  <div
    className="absolute inset-0 opacity-10"
    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
  />
  <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
  <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">EchoBay CRM</h1>
  <p className="text-blue-200 text-sm text-center">商户管理平台</p>
</div>
```

- [ ] **Step 2: Rewrite `src/app/(auth)/login/page.tsx`**

Full file:

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import Image from 'next/image'
import { LoginForm } from '@/components/shared/auth/login-form'

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user) {
    const { callbackUrl } = await searchParams
    const role = session.user.role
    if (callbackUrl) redirect(callbackUrl)
    if (role === 'admin' || role === 'super_admin') redirect('/admin/dashboard')
    else redirect('/merchant/dashboard')
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">EchoBay CRM</h1>
        <p className="text-blue-200 text-sm text-center">商户管理平台</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Image src="/logo.png" alt="EchoBay" width={40} height={40} className="object-contain" />
            <span className="font-bold text-slate-900">EchoBay CRM</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">欢迎回来</h2>
            <p className="text-slate-500 text-sm">请登录您的账户</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Rewrite `src/app/(auth)/login/forgot-password/page.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/shared/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">EchoBay CRM</h1>
        <p className="text-blue-200 text-sm text-center">商户管理平台</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">找回密码</h2>
            <p className="text-slate-500 text-sm">输入注册邮箱，我们将发送重置链接</p>
          </div>
          <ForgotPasswordForm />
          <p className="text-center mt-6 text-sm text-slate-500">
            <Link href="/login" className="text-[#0BB5C4] hover:underline">返回登录</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Rewrite `src/app/(auth)/login/reset-password/page.tsx`**

Read the current file to understand the token prop usage, then apply same two-column pattern. Key difference: `{ token }` comes from `searchParams`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/shared/auth/reset-password-form'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  return (
    <main className="min-h-screen flex">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#1B3F72] via-[#1e5799] to-[#0BB5C4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <Image src="/logo.png" alt="EchoBay" width={96} height={96} className="object-contain mb-6 drop-shadow-lg" />
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">EchoBay CRM</h1>
        <p className="text-blue-200 text-sm text-center">商户管理平台</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">重置密码</h2>
            <p className="text-slate-500 text-sm">设置您的新密码</p>
          </div>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-slate-500">
              无效的重置链接。
              <Link href="/login/forgot-password" className="text-[#0BB5C4] hover:underline">重新申请</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(auth)/
git commit -m "feat: auth pages two-column brand layout with EchoBay logo"
```

---

### Task 7: Admin Dashboard page

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Rewrite dashboard page**

Read `src/app/(admin)/admin/dashboard/page.tsx` — note the current 3-column stat grid and list-based recent apps.

Replace the `return (...)` block. Keep all data fetching above unchanged. The new return:

```tsx
  const stats = [
    { label: '总申请数', value: total, icon: ClipboardList, iconBg: 'bg-blue-50 text-[#0BB5C4]' },
    { label: '待审核', value: submitted + under_review, icon: Clock, iconBg: 'bg-amber-50 text-amber-600' },
    { label: '已批准', value: approved, icon: CheckCircle, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: '需补充 / 拒绝', value: `${requires_info} / ${rejected}`, icon: AlertCircle, iconBg: 'bg-red-50 text-red-500' },
    { label: '已发送邀请', value: totalInvitations, icon: Mail, iconBg: 'bg-purple-50 text-purple-600' },
    { label: '邀请待使用', value: pendingInvitations, icon: XCircle, iconBg: 'bg-slate-50 text-slate-500' },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, iconBg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800">最近申请</CardTitle>
            <Link href="/admin/applications" className="text-xs text-[#0BB5C4] hover:underline">查看全部 →</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>公司名称</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow><TableCell className="text-center text-slate-400 py-8" colSpan={3}>暂无申请</TableCell></TableRow>
              ) : (
                recent.map((app) => (
                  <TableRow key={app._id.toString()}>
                    <TableCell>
                      <Link href={`/admin/applications/${app._id.toString()}`} className="font-medium text-slate-900 hover:text-[#0BB5C4] transition-colors">
                        {app.registeredCompanyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">{new Date(app.createdAt).toLocaleDateString('zh-CN')}</TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
```

Add imports at top:
```tsx
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { ClipboardList, CheckCircle, Clock, AlertCircle, XCircle, Mail } from 'lucide-react'
```

Remove the old `STATUS_LABEL`, `STATUS_VARIANT` constants and `Badge` import.

- [ ] **Step 2: Commit**

```bash
git add src/app/(admin)/admin/dashboard/page.tsx
git commit -m "feat: admin dashboard 6-stat grid and full-width recent apps table"
```

---

### Task 8: Admin Applications list

**Files:**
- Modify: `src/app/(admin)/admin/applications/page.tsx`

- [ ] **Step 1: Read and understand current file structure**

Read `src/app/(admin)/admin/applications/page.tsx` — note filter card buttons, `ApplicationsSearch`, and list layout. Keep all data fetching logic unchanged.

- [ ] **Step 2: Rewrite the return block**

Replace `return (...)` with:

```tsx
  function buildHref(params: { status?: string; q?: string; page?: number }) {
    const p = new URLSearchParams()
    if (params.status) p.set('status', params.status)
    if (params.q) p.set('q', params.q)
    if (params.page && params.page > 1) p.set('page', String(params.page))
    const qs = p.toString()
    return qs ? `/admin/applications?${qs}` : '/admin/applications'
  }

  const filterTabs = [
    { key: 'all', label: '全部', count: allApps.length },
    ...FILTER_STATUSES.map(({ key, label }) => ({ key, label, count: counts[key] ?? 0 })),
  ]

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ApplicationsSearch initialQuery={trimmedQuery} />
        </div>
        {(trimmedQuery || activeFilter) && (
          <Link href="/admin/applications" className="text-sm text-slate-400 hover:text-slate-600 whitespace-nowrap">
            清除筛选 ✕
          </Link>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {filterTabs.map(({ key, label, count }) => {
          const isActive = key === 'all' ? !activeFilter : activeFilter === key
          return (
            <Link
              key={key}
              href={key === 'all'
                ? buildHref({ q: trimmedQuery || undefined })
                : buildHref({ status: key, q: trimmedQuery || undefined })}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                isActive
                  ? 'border-[#0BB5C4] text-[#0BB5C4]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {label} <span className="ml-1 text-xs text-slate-400">({count})</span>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>公司名称</TableHead>
                <TableHead>联系人邮箱</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>审核时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-slate-400 py-12" colSpan={6}>暂无申请</TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app._id.toString()}>
                    <TableCell className="font-medium text-slate-900">{app.registeredCompanyName}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{emailMap.get(app.userId.toString()) ?? '—'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString('zh-CN')}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString('zh-CN') : '—'}
                    </TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/applications/${app._id.toString()}`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                        查看
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        buildHref={(p) => buildHref({ status: activeFilter, q: trimmedQuery || undefined, page: p })}
      />
    </div>
  )
```

Add imports:
```tsx
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
```

Remove old `Badge` import and `STATUS_VARIANT` constant. Keep `STATUS_LABEL` and `FILTER_STATUSES`.

- [ ] **Step 3: Commit**

```bash
git add src/app/(admin)/admin/applications/page.tsx
git commit -m "feat: applications list with underline tabs and full data table"
```

---

### Task 9: Admin Application Detail page

**Files:**
- Modify: `src/app/(admin)/admin/applications/[id]/page.tsx`

- [ ] **Step 1: Read current file**

Read `src/app/(admin)/admin/applications/[id]/page.tsx`. Note the `Row` helper function, `maskAccountNumber`, and the stacked single-column layout. Keep all data fetching, `Row`, and `maskAccountNumber` functions.

- [ ] **Step 2: Replace the return block with two-column layout**

Replace the entire `return (...)` with:

```tsx
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {app.requiresInfoReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">需补充信息：</p>
              <p>{app.requiresInfoReason}</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-800">公司基本信息</CardTitle>
                <StatusBadge status={app.status} />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="注册公司名" value={app.registeredCompanyName} />
              <Row label="营业执照号" value={app.businessLicenseNumber} />
              <Row label="公司地址" value={app.registeredAddress} />
              <Row label="法人代表" value={app.legalRepresentativeName} />
              <Row label="法人身份证" value={app.legalRepresentativeId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">联系人</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="联系人姓名" value={app.contactPersonName} />
              <Row label="联系人职位" value={app.contactPersonTitle} />
              <Row label="联系人邮箱" value={app.contactPersonEmail} />
              <Row label="联系人电话" value={app.contactPersonPhone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">品牌与门店</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="品牌名称" value={app.brandName} />
              <Row label="品牌类别" value={app.brandCategory} />
              <Row label="国家/地区" value={app.countryOfOrigin} />
              <Row label="网站" value={app.website} />
            </CardContent>
          </Card>

          {logoEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-800">Logo 文件</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {logoEntries.map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#0BB5C4] hover:underline">
                    {key}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">银行信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Row label="开户行" value={app.bankName} />
              <Row label="账户名" value={app.bankAccountName} />
              <Row label="账号" value={app.bankAccountNumber ? maskAccountNumber(app.bankAccountNumber) : undefined} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">商户信息</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label="注册邮箱" value={merchant?.email} />
              <Row label="提交时间" value={new Date(app.createdAt).toLocaleDateString('zh-CN')} />
              {app.reviewedAt && (
                <Row label="审核时间" value={new Date(app.reviewedAt).toLocaleDateString('zh-CN')} />
              )}
            </CardContent>
          </Card>

          <ApplicationReviewPanel applicationId={app._id.toString()} currentStatus={app.status} />
          <AdminNotesForm applicationId={app._id.toString()} initialNotes={app.adminNotes ?? ''} />
        </div>
      </div>
    </div>
  )
```

Add import:
```tsx
import { StatusBadge } from '@/components/shared/status-badge'
```

Remove `Badge` import and remove the old back-link `<h1>` header from the return.

- [ ] **Step 3: Commit**

```bash
git add src/app/(admin)/admin/applications/[id]/page.tsx
git commit -m "feat: application detail two-column — info left, review panel right"
```

---

### Task 10: All remaining Admin pages (bulk)

**Files:**
- `src/app/(admin)/admin/merchants/page.tsx`
- `src/app/(admin)/admin/merchants/[id]/page.tsx`
- `src/app/(admin)/admin/invitations/page.tsx`
- `src/app/(admin)/admin/brands/page.tsx`
- `src/app/(admin)/admin/brands/[id]/page.tsx`
- `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx`
- `src/app/(admin)/admin/stores/page.tsx`
- `src/app/(admin)/admin/stores/[id]/page.tsx`
- `src/app/(admin)/admin/stores/new/page.tsx`
- `src/app/(admin)/admin/stores/[id]/edit/page.tsx`
- `src/app/(admin)/admin/promotions/page.tsx`
- `src/app/(admin)/admin/hero-products/page.tsx`
- `src/app/(admin)/admin/hero-products/new/page.tsx`

**Transformation rule for every file:** Read each file first, then apply:
1. Outer wrapper: change `max-w-4xl` / `max-w-3xl` to `w-full`
2. Remove the `<h1>` page title (it's now in the Header)
3. Replace `<Badge variant={...}>` status badges with `<StatusBadge status={app.status} />`
4. For list pages: replace list items with `<Table>` + `<TableHeader>` + `<TableBody>` + `<TableRow>` + `<TableCell>` from `@/components/ui/data-table`
5. For detail pages: wrap in `grid grid-cols-1 lg:grid-cols-3 gap-6` (2/3 detail + 1/3 actions)
6. Keep all data fetching, form components, action panels unchanged

- [ ] **Step 1: Merchants list page**

Read `src/app/(admin)/admin/merchants/page.tsx`. Replace list layout with Table. Columns: 商户名称 / 邮箱 / 角色 / 注册时间 / 操作(查看链接).

- [ ] **Step 2: Merchant detail page**

Read `src/app/(admin)/admin/merchants/[id]/page.tsx`. Apply two-column grid. Left 2/3: merchant details. Right 1/3: application status + actions.

- [ ] **Step 3: Invitations page**

Read `src/app/(admin)/admin/invitations/page.tsx`. Layout:
- Top Card with `SendInvitationForm` inside
- Below: Table of invitations (邮箱 / 状态 / 有效期 / 操作)

Status badge for invitations: `pending` → `bg-blue-100 text-blue-700`, `used` → `bg-emerald-100 text-emerald-700`, `expired` → `bg-slate-100 text-slate-500`.

- [ ] **Step 4: Brands list page**

Read `src/app/(admin)/admin/brands/page.tsx`. Replace with full-width Table. Columns: 品牌名称 / 关联商户 / 状态 / 操作.

- [ ] **Step 5: Brand detail page**

Read `src/app/(admin)/admin/brands/[id]/page.tsx`. Two-column: details left, actions right.

- [ ] **Step 6: Brand bank-accounts page**

Read `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx`. Remove `max-w-*`, use `w-full`.

- [ ] **Step 7: Stores list page**

Read `src/app/(admin)/admin/stores/page.tsx`. Full-width Table. Columns: 门店名称 / 地址 / 品牌 / 操作.

- [ ] **Step 8: Store detail, new, edit pages**

Read each file. Remove `max-w-*`. Use `w-full`. Keep form components unchanged.

- [ ] **Step 9: Promotions page**

Read `src/app/(admin)/admin/promotions/page.tsx`. Full-width Table if list, or `w-full` Card if form.

- [ ] **Step 10: Hero products list page**

Read `src/app/(admin)/admin/hero-products/page.tsx`. Replace with `grid grid-cols-2 lg:grid-cols-4 gap-4` card grid (each card shows product image + name + actions).

- [ ] **Step 11: Hero products new page**

Read `src/app/(admin)/admin/hero-products/new/page.tsx`. Remove `max-w-*`, use `w-full`.

- [ ] **Step 12: Run lint**

```bash
pnpm lint
```

Expected: 0 errors. Fix any import issues.

- [ ] **Step 13: Commit**

```bash
git add src/app/(admin)/admin/
git commit -m "feat: all admin pages full-width with data tables and brand styling"
```

---

### Task 11: Merchant portal pages

**Files:**
- Modify: `src/app/(merchant)/merchant/dashboard/page.tsx`
- Modify: `src/app/(merchant)/merchant/application/page.tsx`
- Modify: `src/app/(merchant)/merchant/documents/page.tsx`
- Modify: `src/app/(merchant)/merchant/brand/page.tsx`
- Modify: `src/app/(merchant)/merchant/store/page.tsx`
- Modify: `src/app/(merchant)/merchant/promotions/page.tsx`
- Modify: `src/app/(merchant)/merchant/promotions/new/page.tsx`

- [ ] **Step 1: Rewrite merchant dashboard**

Read `src/app/(merchant)/merchant/dashboard/page.tsx`. Keep all data fetching. Replace return with:

```tsx
  const quickLinks = [
    { href: '/merchant/application', icon: FileText, label: '申请详情', desc: '查看或编辑您的申请' },
    { href: '/merchant/documents', icon: Upload, label: '文件上传', desc: '上传所需文件材料' },
    { href: '/merchant/brand', icon: Store, label: '品牌信息', desc: '管理您的品牌资料' },
    { href: '/merchant/store', icon: Building2, label: '我的门店', desc: '查看门店信息' },
    { href: '/merchant/promotions', icon: Tag, label: '推广活动', desc: '管理推广活动' },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      <p className="text-slate-500 text-sm">欢迎回来，{session!.user.name}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {application ? (
            <StatusCard
              status={application.status}
              companyName={application.registeredCompanyName}
              submittedAt={application.createdAt}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">暂无申请记录。</CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}>
                <Card className="hover:border-[#0BB5C4] hover:shadow-md transition-all duration-150 cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0BB5C4] flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">未读通知</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList initialNotifications={notifications} userId={userId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
```

Add imports: `FileText, Upload, Store, Building2, Tag` from lucide-react, `Card, CardContent, CardHeader, CardTitle` from `@/components/ui/card`. Remove old `Button` import if no longer used.

- [ ] **Step 2: Update remaining merchant pages**

For each file, read it then apply: remove `max-w-2xl`, use `w-full`, remove `<h1>`. Keep all form/logic unchanged.

- `merchant/application/page.tsx` — `w-full` wrapper; the tab form itself stays as-is (forms have their own width constraints)
- `merchant/documents/page.tsx` — `w-full`
- `merchant/brand/page.tsx` — `w-full`
- `merchant/store/page.tsx` — `w-full`
- `merchant/promotions/page.tsx` — `w-full`; if it has a list, use Table
- `merchant/promotions/new/page.tsx` — `w-full`

- [ ] **Step 3: Commit**

```bash
git add src/app/(merchant)/
git commit -m "feat: merchant portal full-width with dashboard quick-links and notification panel"
```

---

### Task 12: Apply pages

**Files:**
- Modify: `src/app/apply/[token]/page.tsx`
- Modify: `src/app/apply/[token]/invalid/page.tsx`

- [ ] **Step 1: Update invalid page**

Read `src/app/apply/[token]/invalid/page.tsx`. Wrap content in brand-styled centered layout:

```tsx
import Image from 'next/image'

// In return:
return (
  <main className="min-h-screen bg-gradient-to-br from-[#1B3F72] to-[#0BB5C4] flex items-center justify-center p-6">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
      <Image src="/logo.png" alt="EchoBay" width={48} height={48} className="object-contain mx-auto mb-4" />
      {/* Keep existing error message JSX here */}
    </div>
  </main>
)
```

- [ ] **Step 2: Update apply token page**

Read `src/app/apply/[token]/page.tsx`. Wrap content in brand-styled page:

```tsx
import Image from 'next/image'

// In return:
return (
  <main className="min-h-screen bg-[#F1F5F9] py-8 px-4">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Image src="/logo.png" alt="EchoBay" width={40} height={40} className="object-contain" />
        <div>
          <h1 className="text-lg font-bold text-[#1B3F72]">EchoBay CRM</h1>
          <p className="text-sm text-slate-500">商户入驻申请</p>
        </div>
      </div>
      {/* Keep existing form content JSX */}
    </div>
  </main>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/app/apply/
git commit -m "feat: apply pages brand styling with EchoBay logo"
```

---

### Task 13: Final verification

- [ ] **Step 1: Run full lint**

```bash
pnpm lint
```

Expected: exit 0 with 0 errors. Fix anything before continuing.

- [ ] **Step 2: Run all unit tests**

```bash
pnpm test:unit
```

Expected: all tests pass. Fix failures before continuing.

- [ ] **Step 3: Run production build**

```bash
pnpm build
```

Expected: 0 TypeScript errors, 0 build failures. Fix before continuing.

- [ ] **Step 4: Visual verification**

```bash
pnpm dev
```

Open http://localhost:3000 and verify each of the following:

| Check | Expected |
|---|---|
| Login page | Two-column: navy gradient left with logo, white form right |
| Admin sidebar | Deep navy `#1B3F72`, teal active bar `#0BB5C4` |
| Merchant sidebar | Same dark navy styling |
| Header bar | White, sticky, breadcrumbs + user avatar + role badge |
| Admin dashboard | 6 stat cards with icons, full-width recent apps table |
| Applications list | Underline filter tabs, proper data table |
| Application detail | Two-column: detail left, review panel right |
| Content area | No `max-w` box floating in center — fills screen |
| Status badges | Emerald/blue/amber/red semantic colors |

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete UI redesign — EchoBay brand, dark sidebar, full-width CRM layouts"
```
