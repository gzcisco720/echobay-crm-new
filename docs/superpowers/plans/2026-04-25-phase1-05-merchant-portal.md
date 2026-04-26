# Phase 1-05: Merchant Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Build the authenticated merchant portal — layout with sidebar navigation, dashboard, application detail/edit page, documents upload page, and brand info page.

**Architecture:** `(merchant)/layout.tsx` wraps all pages with a sidebar nav. Each page is a React Server Component that fetches data via Server Actions. Mutations (mark notification read, upload document) use Client Components calling Server Actions.

**Tech Stack:** Next.js 15 App Router, Server Components, Auth.js session, ShadCN/ui

**Prerequisite:** Phase 1-04 complete.

---

### Task 1: markNotificationRead action

**Files:**
- Add to: `src/lib/actions/application.actions.ts`
- Test: `__tests__/integration/actions/notification.actions.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/integration/actions/notification.actions.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NotificationModel } from '@/lib/db/models/notification.model'

jest.mock('@/lib/db/connect', () => ({ connectDB: jest.fn().mockResolvedValue({}) }))

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await NotificationModel.deleteMany({})
})

describe('markNotificationRead', () => {
  it('sets isRead to true for the given notification', async () => {
    const uid = new mongoose.Types.ObjectId()
    const notif = await NotificationModel.create({
      userId: uid,
      type: 'general',
      title: 'Test',
      message: 'Hello',
    })

    const { markNotificationRead } = await import('@/lib/actions/notification.actions')
    const result = await markNotificationRead(notif._id.toString())
    expect(result.success).toBe(true)

    const updated = await NotificationModel.findById(notif._id)
    expect(updated?.isRead).toBe(true)
  })

  it('returns error for non-existent notification', async () => {
    const { markNotificationRead } = await import('@/lib/actions/notification.actions')
    const result = await markNotificationRead(new mongoose.Types.ObjectId().toString())
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="notification.actions.test"
```

- [ ] **Step 3: Create notification actions file**

```typescript
// src/lib/actions/notification.actions.ts
'use server'

import { connectDB } from '@/lib/db/connect'
import { NotificationModel } from '@/lib/db/models/notification.model'
import type { ActionResult } from '@/types/action'

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  try {
    await connectDB()
    const result = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { $set: { isRead: true } },
      { new: true }
    )
    if (!result) return { success: false, error: '通知不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新通知失败' }
  }
}

export async function getUnreadNotifications(
  userId: string
): Promise<ActionResult<Array<{ id: string; type: string; title: string; message: string; createdAt: Date }>>> {
  try {
    await connectDB()
    const notifications = await NotificationModel.find({
      userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    return {
      success: true,
      data: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      })),
    }
  } catch {
    return { success: false, error: '获取通知失败' }
  }
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="notification.actions.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/notification.actions.ts __tests__/integration/actions/notification.actions.test.ts
git commit -m "feat: markNotificationRead and getUnreadNotifications actions"
```

---

### Task 2: Merchant portal layout + sidebar

**Files:**
- Create: `src/app/(merchant)/layout.tsx`
- Create: `src/components/shared/merchant-portal/sidebar-nav.tsx`

- [ ] **Step 1: Create sidebar nav component**

```typescript
// src/components/shared/merchant-portal/sidebar-nav.tsx
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
```

- [ ] **Step 2: Create merchant layout**

```typescript
// src/app/(merchant)/layout.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(merchant\)/layout.tsx src/components/shared/merchant-portal/sidebar-nav.tsx
git commit -m "feat: merchant portal layout with sidebar navigation"
```

---

### Task 3: Status card + Notification list components

**Files:**
- Create: `src/components/shared/merchant-portal/status-card.tsx`
- Create: `src/components/shared/merchant-portal/notification-list.tsx`

- [ ] **Step 1: Implement StatusCard**

```typescript
// src/components/shared/merchant-portal/status-card.tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; labelEn: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:         { label: '草稿',   labelEn: 'Draft',          variant: 'outline' },
  submitted:     { label: '已提交', labelEn: 'Submitted',      variant: 'secondary' },
  under_review:  { label: '审核中', labelEn: 'Under Review',   variant: 'default' },
  approved:      { label: '已批准', labelEn: 'Approved',       variant: 'default' },
  rejected:      { label: '已拒绝', labelEn: 'Rejected',       variant: 'destructive' },
  requires_info: { label: '需补充', labelEn: 'Info Required',  variant: 'destructive' },
}

interface Props {
  status: ApplicationStatus
  companyName: string
  submittedAt?: Date
}

export function StatusCard({ status, companyName, submittedAt }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">申请状态 · Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900">{companyName}</p>
            {submittedAt && (
              <p className="text-zinc-500 text-xs mt-0.5">
                提交于 {submittedAt.toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
          <Badge variant={config.variant} className="text-sm px-3 py-1">
            {config.label} · {config.labelEn}
          </Badge>
        </div>

        {status === 'requires_info' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            您的申请需要补充资料。请前往「申请详情」查看具体说明。
          </div>
        )}
        {status === 'approved' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            🎉 恭喜！您的入驻申请已批准。请前往「品牌信息」查看合作详情。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Implement NotificationList**

```typescript
// src/components/shared/merchant-portal/notification-list.tsx
'use client'

import { useState } from 'react'
import { markNotificationRead } from '@/lib/actions/notification.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: Date
}

export function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)

  async function handleRead(id: string) {
    await markNotificationRead(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-zinc-400 text-sm">
          暂无新通知 · No new notifications
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">通知 · Notifications</CardTitle>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">{n.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(n.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <Button size="sm" variant="ghost" className="text-xs shrink-0" onClick={() => handleRead(n.id)}>
              已读
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/merchant-portal/status-card.tsx src/components/shared/merchant-portal/notification-list.tsx
git commit -m "feat: StatusCard and NotificationList portal components"
```

---

### Task 4: Merchant Dashboard page

**Files:**
- Create: `src/app/(merchant)/dashboard/page.tsx`

- [ ] **Step 1: Implement dashboard page**

```typescript
// src/app/(merchant)/dashboard/page.tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { StatusCard } from '@/components/shared/merchant-portal/status-card'
import { NotificationList } from '@/components/shared/merchant-portal/notification-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  await connectDB()

  const application = await MerchantApplicationModel.findOne({ userId })
    .select('status registeredCompanyName createdAt')
    .lean()

  const rawNotifications = await NotificationModel.find({ userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const notifications = rawNotifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
  }))

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">仪表盘 Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">欢迎回来，{session!.user.name}</p>
      </div>

      {application ? (
        <StatusCard
          status={application.status}
          companyName={application.registeredCompanyName}
          submittedAt={application.createdAt}
        />
      ) : (
        <div className="p-4 bg-zinc-100 rounded-lg text-sm text-zinc-600">
          暂无申请记录。
        </div>
      )}

      <NotificationList initialNotifications={notifications} />

      <div className="flex gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/merchant/application">查看申请详情</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/merchant/documents">文件上传</Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(merchant\)/dashboard/
git commit -m "feat: merchant dashboard page with status card and notifications"
```

---

### Task 5: Application detail + documents + brand pages

**Files:**
- Create: `src/app/(merchant)/application/page.tsx`
- Create: `src/app/(merchant)/documents/page.tsx`
- Create: `src/app/(merchant)/brand/page.tsx`

- [ ] **Step 1: Implement Application detail page**

```typescript
// src/app/(merchant)/application/page.tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ApplicationPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id }).lean()

  if (!app) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-4">申请详情 · Application</h1>
        <p className="text-zinc-500">暂无申请记录。</p>
      </div>
    )
  }

  const canEdit = ['submitted', 'requires_info'].includes(app.status)

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">申请详情 · Application</h1>
        <Badge>{app.status}</Badge>
      </div>

      {app.requiresInfoReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>需补充说明：</strong> {app.requiresInfoReason}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">公司信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">注册公司名称</p><p className="font-medium">{app.registeredCompanyName}</p></div>
          <div><p className="text-zinc-400 text-xs">ACN</p><p className="font-medium">{app.acn}</p></div>
          <div><p className="text-zinc-400 text-xs">ABN</p><p className="font-medium">{app.abn}</p></div>
          <div><p className="text-zinc-400 text-xs">注册地址</p><p className="font-medium">{app.registeredAddress}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm text-zinc-500 font-medium">品牌信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-400 text-xs">品牌英文名</p><p className="font-medium">{app.brandNameEnglish}</p></div>
          {app.brandNameChinese && <div><p className="text-zinc-400 text-xs">品牌中文名</p><p className="font-medium">{app.brandNameChinese}</p></div>}
          <div className="col-span-2"><p className="text-zinc-400 text-xs">品牌介绍</p><p className="font-medium leading-relaxed">{app.brandIntroductionEnglish}</p></div>
        </CardContent>
      </Card>

      {canEdit && (
        <p className="text-zinc-500 text-sm">
          如需修改申请信息，请联系 EchoBay 团队：
          <a href="mailto:support@echobay.com.au" className="text-zinc-900 underline ml-1">
            support@echobay.com.au
          </a>
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Implement Documents page**

```typescript
// src/app/(merchant)/documents/page.tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DocumentsPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('_id status')
    .lean()

  const documents = app
    ? await MerchantDocumentModel.find({ applicationId: app._id }).lean()
    : []

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <h1 className="text-xl font-bold tracking-tight">文件上传 · Documents</h1>

      {!app && <p className="text-zinc-500">请先提交申请。</p>}

      {app && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">已上传文件 Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-zinc-400 text-sm">暂无上传文件。如 Admin 要求补充资料，将在此处显示。</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {documents.map((doc) => (
                    <li key={doc._id.toString()} className="flex items-center justify-between text-sm p-2 bg-zinc-50 rounded border border-zinc-100">
                      <span>{doc.fileName}</span>
                      <span className="text-zinc-400 text-xs">{doc.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <p className="text-zinc-500 text-sm">
            如需上传补充文件，请联系 EchoBay 团队获取上传指引。
          </p>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement Brand page**

```typescript
// src/app/(merchant)/brand/page.tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function BrandPage() {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('status brandNameEnglish brandNameChinese brandIntroductionEnglish website socialMediaAccounts logoUploads mainCategories storesInAustralia storesToList')
    .lean()

  if (!app || app.status !== 'approved') {
    return (
      <div className="max-w-2xl flex flex-col gap-5">
        <h1 className="text-xl font-bold tracking-tight">品牌信息 · Brand</h1>
        <Card>
          <CardContent className="pt-6 text-center text-zinc-400 text-sm py-12">
            <p className="text-2xl mb-3">⏳</p>
            <p className="font-medium text-zinc-600">品牌信息审核中</p>
            <p className="mt-1">申请批准后，您的品牌信息将在此处展示。</p>
            <p className="text-xs mt-1 text-zinc-400">Current status: <Badge variant="outline">{app?.status ?? 'unknown'}</Badge></p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <h1 className="text-xl font-bold tracking-tight">品牌信息 · Brand</h1>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{app.brandNameEnglish}</CardTitle>
              {app.brandNameChinese && <p className="text-zinc-500 text-sm mt-0.5">{app.brandNameChinese}</p>}
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">已批准 Approved</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-zinc-700 leading-relaxed">{app.brandIntroductionEnglish}</p>
          {app.website && (
            <div>
              <p className="text-xs text-zinc-400 mb-1">官网</p>
              <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-900 underline">{app.website}</a>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-zinc-400 text-xs">澳洲门店数</p><p className="font-medium">{app.storesInAustralia}</p></div>
            <div><p className="text-zinc-400 text-xs">参与门店数</p><p className="font-medium">{app.storesToList}</p></div>
          </div>
          <div>
            <p className="text-zinc-400 text-xs mb-1.5">主营类目</p>
            <div className="flex flex-wrap gap-1.5">
              {app.mainCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(merchant\)/application/ src/app/\(merchant\)/documents/ src/app/\(merchant\)/brand/
git commit -m "feat: merchant portal pages — application detail, documents, brand info"
```

---

### Task 6: Phase gate

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: Update docs/INDEX.md**

Mark 1-05 ✅. Set Active Plan to `phase1-06-admin-and-e2e.md`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 1-05 — merchant portal with dashboard, application, documents, brand pages"
```

---

**Phase 1-05 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-06-admin-and-e2e.md`**
