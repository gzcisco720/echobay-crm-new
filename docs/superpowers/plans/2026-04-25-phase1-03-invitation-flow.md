# Phase 1-03: Invitation Flow + Email

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Implement the Mailgun email service, invitation Server Actions (create + validate), and the public `/apply/[token]` entry page.

**Architecture:** `sendInvitation` creates a `MerchantInvitation` document and sends email via Mailgun REST API. `validateInvitationToken` is called on page load to gate access to the application form. Draft applications keyed by `invitationId` allow saving progress before final submission.

**Tech Stack:** Mailgun REST API (via fetch), uuid v4, Next.js App Router dynamic route

**Prerequisite:** Phase 1-02 complete.

---

### Task 1: Mailgun email service

**Files:**
- Create: `src/lib/mail/mailgun.ts`
- Test: `__tests__/unit/mail/mailgun.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/unit/mail/mailgun.test.ts

// Mock global fetch before importing the module
const mockFetch = jest.fn()
global.fetch = mockFetch

import { sendEmail } from '@/lib/mail/mailgun'

beforeEach(() => {
  process.env.MAILGUN_API_KEY = 'test-key'
  process.env.MAILGUN_DOMAIN = 'mg.example.com'
  process.env.MAILGUN_FROM = 'EchoBay <noreply@echobay.com.au>'
  mockFetch.mockReset()
})

describe('sendEmail', () => {
  it('posts to the Mailgun API with correct body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'msg-id' }) })

    const result = await sendEmail({
      to: 'merchant@shop.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    })

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('mg.example.com')
  })

  it('returns failure when API responds with error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Unauthorized' })
    const result = await sendEmail({ to: 'x@x.com', subject: 'X', html: '<p>X</p>' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Mailgun')
  })

  it('returns failure on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))
    const result = await sendEmail({ to: 'x@x.com', subject: 'X', html: '<p>X</p>' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Create test directory + run test to confirm fail**

```bash
mkdir -p __tests__/unit/mail
pnpm test:unit -- --testPathPatterns="mailgun.test"
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement Mailgun service**

```typescript
// src/lib/mail/mailgun.ts
import type { ActionResult } from '@/types/action'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<ActionResult> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const from = process.env.MAILGUN_FROM ?? 'EchoBay <noreply@echobay.com.au>'

  if (!apiKey || !domain) {
    return { success: false, error: 'Mailgun environment variables are not configured' }
  }

  const body = new URLSearchParams({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
  })

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `Mailgun error: ${text}` }
    }

    return { success: true, data: undefined }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to send email: ${message}` }
  }
}

export function buildInvitationEmail(inviteUrl: string, recipientEmail: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 32px;">
        <span style="font-weight: 700; font-size: 18px;">EchoBay</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
        您已受邀成为 EchoBay 合作商家
      </h1>
      <p style="color: #52525b; margin-bottom: 24px;">
        You've been invited to become an EchoBay merchant partner.
      </p>
      <p style="color: #374151; margin-bottom: 24px;">
        请点击以下按钮开始填写入驻申请（链接 7 天内有效）：
      </p>
      <a href="${inviteUrl}"
         style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        开始申请 Start Application →
      </a>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">
        如果按钮无法点击，请复制此链接到浏览器：${inviteUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />
      <p style="color: #a1a1aa; font-size: 11px;">
        © ${new Date().getFullYear()} EchoBay. This email was sent to ${recipientEmail}.
      </p>
    </div>
  `
}

export function buildConfirmationEmail(companyName: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 32px;">
        <span style="font-weight: 700; font-size: 18px;">EchoBay</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">申请已成功提交</h1>
      <p style="color: #374151; margin-bottom: 16px;">
        感谢 ${companyName} 提交入驻申请！我们的团队将在 3-5 个工作日内完成审核。
      </p>
      <p style="color: #374151; margin-bottom: 24px;">
        您可以随时登录 EchoBay 商家门户查看申请进度。
      </p>
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />
      <p style="color: #a1a1aa; font-size: 11px;">© ${new Date().getFullYear()} EchoBay</p>
    </div>
  `
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:unit -- --testPathPatterns="mailgun.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail/mailgun.ts __tests__/unit/mail/mailgun.test.ts
git commit -m "feat: Mailgun email service with invitation and confirmation templates"
```

---

### Task 2: Invitation Server Actions

**Files:**
- Create: `src/lib/actions/invitation.actions.ts`
- Test: `__tests__/integration/actions/invitation.actions.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/actions/invitation.actions.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'

// Mock Mailgun so tests don't call real API
jest.mock('@/lib/mail/mailgun', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  buildInvitationEmail: jest.fn().mockReturnValue('<p>invite</p>'),
}))

// Mock connectDB to use in-memory connection
jest.mock('@/lib/db/connect', () => ({
  connectDB: jest.fn().mockResolvedValue({}),
}))

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
  await UserModel.deleteMany({})
  await MerchantInvitationModel.deleteMany({})
})

let adminId: string

beforeEach(async () => {
  const admin = await UserModel.create({
    email: 'admin@echobay.com',
    password: 'hashed',
    role: 'admin',
    name: 'Admin',
  })
  adminId = admin._id.toString()
})

describe('validateInvitationToken', () => {
  it('returns email for a valid pending token', async () => {
    const inv = await MerchantInvitationModel.create({
      email: 'merchant@shop.com',
      token: 'valid-token-123',
      expiresAt: new Date(Date.now() + 86400000),
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken(inv.token)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('merchant@shop.com')
  })

  it('returns error for expired token', async () => {
    await MerchantInvitationModel.create({
      email: 'old@shop.com',
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000),
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('expired-token')
    expect(result.success).toBe(false)
  })

  it('returns error for non-existent token', async () => {
    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('does-not-exist')
    expect(result.success).toBe(false)
  })

  it('returns error for already-used token', async () => {
    await MerchantInvitationModel.create({
      email: 'used@shop.com',
      token: 'used-token',
      expiresAt: new Date(Date.now() + 86400000),
      status: 'used',
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('used-token')
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="invitation.actions.test"
```

- [ ] **Step 3: Implement invitation actions**

```typescript
// src/lib/actions/invitation.actions.ts
'use server'

import { v4 as uuidv4 } from 'uuid'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { sendEmail, buildInvitationEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'

export async function validateInvitationToken(
  token: string
): Promise<ActionResult<{ email: string; invitationId: string }>> {
  try {
    await connectDB()
    const invitation = await MerchantInvitationModel.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!invitation) {
      return { success: false, error: '邀请链接无效或已过期，请联系 EchoBay 重新发送邀请' }
    }

    return {
      success: true,
      data: { email: invitation.email, invitationId: invitation._id.toString() },
    }
  } catch {
    return { success: false, error: '验证邀请时发生错误，请稍后重试' }
  }
}

export async function sendMerchantInvitation(
  email: string,
  adminUserId: string
): Promise<ActionResult<{ token: string }>> {
  try {
    await connectDB()

    const existing = await MerchantInvitationModel.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (existing) {
      return { success: false, error: '该邮箱已有一个有效的待处理邀请' }
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await MerchantInvitationModel.create({
      email: email.toLowerCase(),
      token,
      expiresAt,
      invitedBy: adminUserId,
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL}/apply/${token}`
    const emailResult = await sendEmail({
      to: email,
      subject: '您已受邀成为 EchoBay 合作商家 | EchoBay Merchant Invitation',
      html: buildInvitationEmail(inviteUrl, email),
    })

    if (!emailResult.success) {
      return { success: false, error: `邀请已创建，但邮件发送失败: ${emailResult.error}` }
    }

    return { success: true, data: { token } }
  } catch {
    return { success: false, error: '发送邀请时发生错误，请稍后重试' }
  }
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="invitation.actions.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/invitation.actions.ts __tests__/integration/actions/invitation.actions.test.ts
git commit -m "feat: validateInvitationToken and sendMerchantInvitation server actions"
```

---

### Task 3: Apply entry page

**Files:**
- Create: `src/app/apply/[token]/page.tsx`
- Create: `src/app/apply/[token]/invalid/page.tsx`

- [ ] **Step 1: Implement the invalid token page**

```typescript
// src/app/apply/[token]/invalid/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvalidTokenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">链接无效</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 text-sm leading-relaxed">
            此邀请链接已过期或已被使用。
            <br />
            This invitation link is invalid or has expired.
          </p>
          <p className="text-zinc-500 text-xs mt-4">
            请联系 EchoBay 团队重新获取邀请链接。
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 2: Implement the apply entry page**

This page validates the token server-side and either redirects to invalid or renders the form shell (form component built in Phase 1-04).

```typescript
// src/app/apply/[token]/page.tsx
import { redirect } from 'next/navigation'
import { validateInvitationToken } from '@/lib/actions/invitation.actions'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ApplyPage({ params }: Props) {
  const { token } = await params
  const result = await validateInvitationToken(token)

  if (!result.success) {
    redirect('/apply/invalid')
  }

  const { email, invitationId } = result.data

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center text-white text-xs font-bold">
            EB
          </div>
          <span className="font-semibold text-zinc-900">EchoBay</span>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            商家入驻申请{' '}
            <span className="text-zinc-500 font-normal text-lg">Merchant Application</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            邀请邮箱：<span className="font-medium text-zinc-700">{email}</span>
          </p>
        </div>
        {/* ApplicationForm component will be added in Phase 1-04 */}
        <p className="text-zinc-400 text-sm">（申请表单将在 Phase 1-04 实现）</p>
        <pre className="hidden">{JSON.stringify({ token, invitationId })}</pre>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/apply/
git commit -m "feat: apply/[token] entry page with token validation and invalid fallback"
```

---

### Task 4: Phase gate

- [ ] **Step 1: Build check**

```bash
pnpm build
```

Expected: 0 errors

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 3: Update docs/INDEX.md**

Mark 1-03 ✅. Set Active Plan to `phase1-04-application-form.md`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 1-03 — invitation flow, Mailgun, apply entry page"
```

---

**Phase 1-03 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-04-application-form.md`**
