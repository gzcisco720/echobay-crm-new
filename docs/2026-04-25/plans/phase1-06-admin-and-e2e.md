# Phase 1-06: Admin Invitations Page + E2E Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Build the minimal Admin invitations page (send invitation + list history), write E2E tests covering the full merchant onboarding flow, and complete the Phase 1 gate.

**Architecture:** Admin layout mirrors the merchant layout but checks for `admin|super_admin` role. The invitations page calls `sendMerchantInvitation` via a Server Action form. E2E tests use Playwright and a test MongoDB URI.

**Tech Stack:** Next.js 15 Server Actions, Playwright, ShadCN/ui

**Prerequisite:** Phase 1-05 complete.

---

### Task 1: Admin layout + invitations page

**Files:**
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/invitations/page.tsx`
- Create: `src/components/shared/admin/send-invitation-form.tsx`

- [ ] **Step 1: Create Admin layout**

```typescript
// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth.config'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

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
```

- [ ] **Step 2: Create SendInvitationForm client component**

```typescript
// src/components/shared/admin/send-invitation-form.tsx
'use client'

import { useState } from 'react'
import { sendMerchantInvitation } from '@/lib/actions/invitation.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  adminUserId: string
  onSuccess: () => void
}

export function SendInvitationForm({ adminUserId, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setResult(null)
    const res = await sendMerchantInvitation(email, adminUserId)
    setLoading(false)
    if (res.success) {
      setResult({ success: true, message: `邀请已成功发送至 ${email}` })
      setEmail('')
      onSuccess()
    } else {
      setResult({ success: false, message: res.error })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inv-email">商家邮箱 Merchant Email</Label>
        <Input
          id="inv-email"
          type="email"
          placeholder="merchant@shop.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={loading || !email} className="w-fit">
        {loading ? '发送中...' : '发送邀请 Send Invitation'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Create Admin invitations page**

```typescript
// src/app/(admin)/invitations/page.tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SendInvitationForm } from '@/components/shared/admin/send-invitation-form'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const session = await auth()
  await connectDB()

  const invitations = await MerchantInvitationModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'default',
    used: 'secondary',
    expired: 'outline',
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="text-xl font-bold">邀请管理 · Invitations</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">发送新邀请 Send Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <SendInvitationForm adminUserId={session!.user.id} onSuccess={() => {}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">邀请记录 History</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无邀请记录。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div
                  key={inv._id.toString()}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-sm"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{inv.email}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {new Date(inv.createdAt).toLocaleDateString('zh-CN')} ·
                      到期 {new Date(inv.expiresAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[inv.status] ?? 'outline'}>
                    {inv.status === 'pending' ? '待使用' : inv.status === 'used' ? '已使用' : '已过期'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/ src/components/shared/admin/
git commit -m "feat: admin layout and invitations page with send + history"
```

---

### Task 2: E2E — Full application flow

**Files:**
- Create: `e2e/application-flow.spec.ts`

- [ ] **Step 1: Write E2E test**

```typescript
// e2e/application-flow.spec.ts
import { test, expect } from '@playwright/test'

// These tests require:
// 1. pnpm dev server running on localhost:3000
// 2. A valid MongoDB connection in .env.local
// 3. A seeded invitation token (use the seed script in Task 3)

const VALID_TOKEN = process.env.E2E_TEST_TOKEN ?? 'e2e-test-token-abc123'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-merchant@test.com'

test.describe('Merchant Application Flow', () => {
  test('invalid token shows error page', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz')
    await expect(page.getByText('链接无效')).toBeVisible()
  })

  test('valid token loads the application form', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible()
    await expect(page.getByText(TEST_EMAIL)).toBeVisible()
    await expect(page.getByText('① 公司信息')).toBeVisible()
  })

  test('tab 1 validates required fields', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('公司名称不能为空').or(page.getByText('不能为空'))).toBeVisible()
  })

  test('tab navigation works after filling tab 1', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await page.fill('[id="registeredCompanyName"]', 'E2E Test Pty Ltd')
    await page.fill('[id="acn"]', '123456789')
    await page.fill('[id="abn"]', '12345678901')
    await page.fill('[id="registeredAddress"]', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('联系人信息')).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add e2e/application-flow.spec.ts
git commit -m "test(e2e): application form flow — token validation and tab navigation"
```

---

### Task 3: E2E seed script

**Files:**
- Create: `scripts/seed-e2e.ts`

- [ ] **Step 1: Write seed script**

```typescript
// scripts/seed-e2e.ts
// Run with: pnpm tsx scripts/seed-e2e.ts
import mongoose from 'mongoose'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  if (!db) throw new Error('No DB connection')

  // Create a test admin user
  const users = db.collection('users')
  const existing = await users.findOne({ email: 'admin@echobay.com' })
  let adminId: mongoose.Types.ObjectId

  if (!existing) {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('Admin@123456', 12)
    const result = await users.insertOne({
      email: 'admin@echobay.com',
      password: hashed,
      role: 'admin',
      name: 'EchoBay Admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    adminId = result.insertedId as mongoose.Types.ObjectId
    console.log('✓ Admin user created: admin@echobay.com / Admin@123456')
  } else {
    adminId = existing._id as mongoose.Types.ObjectId
    console.log('✓ Admin user already exists')
  }

  // Create E2E test invitation
  const invitations = db.collection('merchantinvitations')
  await invitations.deleteOne({ token: 'e2e-test-token-abc123' })
  await invitations.insertOne({
    email: 'e2e-merchant@test.com',
    token: 'e2e-test-token-abc123',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending',
    invitedBy: adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('✓ E2E invitation token created: e2e-test-token-abc123')
  console.log('  URL: http://localhost:3000/apply/e2e-test-token-abc123')

  await mongoose.disconnect()
}

seed().catch(console.error)
```

- [ ] **Step 2: Add tsx and seed script to package.json**

```bash
pnpm add -D tsx
```

Add to `package.json` scripts:
```json
"seed:e2e": "tsx scripts/seed-e2e.ts"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-e2e.ts
git commit -m "chore: E2E seed script for test admin user and invitation token"
```

---

### Task 4: E2E — Merchant portal flow

**Files:**
- Create: `e2e/merchant-portal.spec.ts`

- [ ] **Step 1: Write portal E2E test**

```typescript
// e2e/merchant-portal.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Merchant Portal', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('EchoBay')).toBeVisible()
    await expect(page.getByLabelText(/邮箱/)).toBeVisible()
    await expect(page.getByLabelText(/密码/)).toBeVisible()
  })

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="email"]', 'wrong@email.com')
    await page.fill('[id="password"]', 'wrongpassword')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page.getByText(/邮箱或密码错误/)).toBeVisible()
  })

  test('admin can access invitations page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="email"]', 'admin@echobay.com')
    await page.fill('[id="password"]', 'Admin@123456')
    await page.getByRole('button', { name: /登录/ }).click()
    // Admin login redirects to merchant dashboard (same credentials flow)
    // Manual navigation to admin
    await page.goto('/admin/invitations')
    await expect(page.getByText('邀请管理')).toBeVisible()
    await expect(page.getByText('发送新邀请')).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add e2e/merchant-portal.spec.ts
git commit -m "test(e2e): merchant portal auth flow and admin invitations page"
```

---

### Task 5: Phase 1 completion gate

- [ ] **Step 1: Run all unit and integration tests**

```bash
pnpm test
```

Expected: all pass, 0 failures, 0 skips

- [ ] **Step 2: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: 0 errors

- [ ] **Step 4: Production build**

```bash
pnpm build
```

Expected: build completes successfully

- [ ] **Step 5: Seed E2E data and run E2E tests**

```bash
pnpm seed:e2e
pnpm test:e2e
```

Expected: all E2E tests pass

- [ ] **Step 6: Update docs/INDEX.md — mark Phase 1 complete**

Update `docs/INDEX.md`:
- Mark all Phase 1 rows (1-00 through 1-06) as ✅ Complete
- Update "What is NOT yet done" section:
  - Phase 2: Admin CRM (application review, merchant management, promotions, dashboard analytics)
- Set Active Plan to: `(Phase 2 planning — not yet started)`

- [ ] **Step 7: Final Phase 1 commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 — EchoBay CRM Merchant Portal

- Project setup: Next.js 15, ShadCN/ui, Tailwind v4, Jest, Playwright
- Data layer: User, MerchantInvitation, MerchantApplication, Notification, MerchantDocument models
- AES-256-GCM encryption for bank account numbers
- Auth.js v5 with Credentials provider, JWT session, role-based middleware
- Zod validation schemas for all 6 application tabs
- Mailgun email service (invitation + confirmation templates)
- 6-tab merchant application form with draft auto-save
- submitApplication creates User + Application atomically
- Merchant portal: dashboard, application detail, documents, brand info
- Admin invitations page: send invitation + history list
- E2E tests: token validation, form navigation, auth flow, admin access"
```

- [ ] **Step 8: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

---

**Phase 1 complete! 🎉**

**Summary of what was built:**

| Feature | Status |
|---------|--------|
| Next.js 15 App Router project | ✅ |
| MongoDB + Mongoose (5 models) | ✅ |
| AES-256-GCM bank account encryption | ✅ |
| Auth.js v5 with role-based JWT | ✅ |
| Zod validation schemas (6 tabs) | ✅ |
| Mailgun invitation + confirmation emails | ✅ |
| Merchant invitation Server Actions | ✅ |
| 6-tab application form + draft auto-save | ✅ |
| Atomic User + Application creation on submit | ✅ |
| Cloudinary upload Route Handler | ✅ |
| Merchant portal (dashboard + 4 pages) | ✅ |
| Admin invitations page | ✅ |
| Jest unit + integration tests | ✅ |
| Playwright E2E tests | ✅ |
| CLAUDE.md + docs/INDEX.md | ✅ |

**Next Phase:** Admin CRM — application review workflow, merchant management list, brand/store/promotion CRUD, analytics dashboard.
