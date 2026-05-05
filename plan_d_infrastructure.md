# Sub-project D: Infrastructure Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Add layout-matching loading skeletons to admin/merchant route groups and refactor email templates to use a shared branded base layout.

**Architecture:** Two `loading.tsx` files at route-group level (Next.js shows them automatically during Server Component streaming); email templates refactored to call a single `buildBaseEmail` function that owns the full HTML wrapper with brand colors.

**Tech Stack:** Next.js 16 `loading.tsx` convention, Tailwind CSS `animate-pulse`, existing Mailgun fetch integration.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(admin)/admin/loading.tsx` | Create | Admin skeleton: header bar + 6 stat cards + table area |
| `src/app/(merchant)/merchant/loading.tsx` | Create | Merchant skeleton: header bar + 2 content cards |
| `src/lib/mail/mailgun.ts` | Modify | Add `buildBaseEmail`; refactor 3 existing template functions |
| `__tests__/unit/mail/mailgun.test.ts` | Modify | Tests for `buildBaseEmail` + refactored templates |

---

## Task 1: Admin loading skeleton

**Files:**
- Create: `src/app/(admin)/admin/loading.tsx`

Note: `loading.tsx` is a Next.js convention — no test needed (Next.js framework handles it). Verify visually via dev server.

- [ ] **Step 1.1: Create the skeleton**

Create `src/app/(admin)/admin/loading.tsx`:

```typescript
import React from 'react'

function Pulse({ className }: { className: string }): React.JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />
}

export default function AdminLoading(): React.JSX.Element {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-100 p-5">
            <Pulse className="w-9 h-9 mb-3" />
            <Pulse className="h-7 w-12 mb-1" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main content card (table / form area) */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Pulse className="h-4 flex-1" />
              <Pulse className="h-4 w-24" />
              <Pulse className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 1.2: Verify in dev server**

```bash
pnpm dev
```

Open http://localhost:3000/admin/dashboard — add artificial latency by temporarily inserting `await new Promise(r => setTimeout(r, 2000))` at the top of the dashboard page function, then remove it after verifying the skeleton appears. (Or just navigate and observe any flash.)

- [ ] **Step 1.3: Run lint + build**

```bash
pnpm lint 2>&1 | tail -5 && pnpm build 2>&1 | grep -E "Error|error TS" | head -5 && echo "ok"
```

Expected: 0 errors

---

## Task 2: Merchant loading skeleton

**Files:**
- Create: `src/app/(merchant)/merchant/loading.tsx`

- [ ] **Step 2.1: Create the skeleton**

Create `src/app/(merchant)/merchant/loading.tsx`:

```typescript
import React from 'react'

function Pulse({ className }: { className: string }): React.JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />
}

export default function MerchantLoading(): React.JSX.Element {
  return (
    <div className="w-full flex flex-col gap-5">
      {/* Primary content card */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Pulse className="h-3 w-20 mb-1.5" />
              <Pulse className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary card */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-28 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Pulse key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2.2: Run lint + build**

```bash
pnpm lint 2>&1 | tail -5 && pnpm build 2>&1 | grep -E "Error|error TS" | head -5 && echo "ok"
```

Expected: 0 errors

- [ ] **Step 2.3: Commit skeletons**

```bash
git add "src/app/(admin)/admin/loading.tsx" \
        "src/app/(merchant)/merchant/loading.tsx"
git commit -m "feat: loading skeletons for admin + merchant route groups"
```

---

## Task 3: Email base layout + brand colors (TDD)

**Files:**
- Modify: `src/lib/mail/mailgun.ts`
- Modify: `__tests__/unit/mail/mailgun.test.ts`

- [ ] **Step 3.1: Write failing tests**

Append to `__tests__/unit/mail/mailgun.test.ts`:

```typescript
import {
  buildBaseEmail,
  buildInvitationEmail,
  buildPasswordResetEmail,
  buildConfirmationEmail,
} from '@/lib/mail/mailgun'

describe('buildBaseEmail', () => {
  it('includes the title in the output', () => {
    const html = buildBaseEmail('Test Title', '<p>body</p>')
    expect(html).toContain('Test Title')
  })

  it('includes the body content', () => {
    const html = buildBaseEmail('Title', '<p>My body content</p>')
    expect(html).toContain('My body content')
  })

  it('includes EchoBay brand header', () => {
    const html = buildBaseEmail('Title', '<p>body</p>')
    expect(html).toContain('EchoBay')
    expect(html).toContain('#0BB5C4')
  })

  it('includes custom footer when provided', () => {
    const html = buildBaseEmail('Title', '<p>body</p>', 'Custom footer text')
    expect(html).toContain('Custom footer text')
  })
})

describe('buildInvitationEmail', () => {
  it('includes the invite URL', () => {
    const html = buildInvitationEmail('https://example.com/apply/tok123', 'merchant@test.com')
    expect(html).toContain('https://example.com/apply/tok123')
  })

  it('includes recipient email in footer', () => {
    const html = buildInvitationEmail('https://example.com/apply/tok123', 'merchant@test.com')
    expect(html).toContain('merchant@test.com')
  })
})

describe('buildPasswordResetEmail', () => {
  it('includes the reset URL', () => {
    const html = buildPasswordResetEmail('https://example.com/reset/abc')
    expect(html).toContain('https://example.com/reset/abc')
  })
})

describe('buildConfirmationEmail', () => {
  it('includes the company name', () => {
    const html = buildConfirmationEmail('Acme Retail Pty Ltd')
    expect(html).toContain('Acme Retail Pty Ltd')
  })
})
```

- [ ] **Step 3.2: Run to confirm RED**

```bash
npx jest --testPathPatterns="mailgun" 2>&1 | tail -10
```

Expected: FAIL — buildBaseEmail not exported

- [ ] **Step 3.3: Refactor mailgun.ts**

Replace the contents of `src/lib/mail/mailgun.ts` with:

```typescript
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

export function buildBaseEmail(title: string, body: string, footer?: string): string {
  const year = new Date().getFullYear()
  return `
<div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
  <!-- Header -->
  <div style="background: #0BB5C4; padding: 20px 24px;">
    <span style="color: #ffffff; font-weight: 700; font-size: 18px; letter-spacing: -0.3px;">EchoBay</span>
  </div>

  <!-- Body -->
  <div style="padding: 32px 24px;">
    <h1 style="font-size: 20px; font-weight: 700; color: #1B3F72; margin: 0 0 16px 0;">${title}</h1>
    ${body}
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #f1f5f9; padding: 20px 24px;">
    ${footer ? `<p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">${footer}</p>` : ''}
    <p style="color: #cbd5e1; font-size: 11px; margin: 0;">© ${year} EchoBay. All rights reserved.</p>
  </div>
</div>
  `.trim()
}

export function buildInvitationEmail(inviteUrl: string, recipientEmail: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 16px 0;">
      您已受邀成为 EchoBay 合作商家。<br>
      You've been invited to become an EchoBay merchant partner.
    </p>
    <p style="color: #475569; margin: 0 0 24px 0;">
      请点击以下按钮开始填写入驻申请（链接 7 天内有效）：
    </p>
    <a href="${inviteUrl}"
       style="display: inline-block; background: #0BB5C4; color: #ffffff; padding: 12px 24px;
              border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
      开始申请 Start Application →
    </a>
    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
      如果按钮无法点击，请复制此链接到浏览器：${inviteUrl}
    </p>
  `
  return buildBaseEmail(
    '您已受邀成为 EchoBay 合作商家',
    body,
    `This email was sent to ${recipientEmail}.`
  )
}

export function buildPasswordResetEmail(resetUrl: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 16px 0;">
      我们收到了您的密码重置请求。请点击以下按钮设置新密码（链接 1 小时内有效）：
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: #0BB5C4; color: #ffffff; padding: 12px 24px;
              border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
      重置密码 Reset Password →
    </a>
    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
      如果您没有请求重置密码，请忽略此邮件。<br>
      如果按钮无法点击，请复制此链接到浏览器：${resetUrl}
    </p>
  `
  return buildBaseEmail('重置您的密码', body)
}

export function buildConfirmationEmail(companyName: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 12px 0;">
      感谢 <strong>${companyName}</strong> 提交入驻申请！我们的团队将在 3–5 个工作日内完成审核。
    </p>
    <p style="color: #475569; margin: 0;">
      您可以随时登录 EchoBay 商家门户查看申请进度。
    </p>
  `
  return buildBaseEmail('申请已成功提交 ✓', body)
}
```

- [ ] **Step 3.4: Run to confirm GREEN**

```bash
npx jest --testPathPatterns="mailgun" 2>&1 | tail -10
```

Expected: all tests PASS

- [ ] **Step 3.5: Run full test suite**

```bash
pnpm test 2>&1 | tail -6
```

Expected: all tests pass

- [ ] **Step 3.6: Commit**

```bash
git add src/lib/mail/mailgun.ts __tests__/unit/mail/mailgun.test.ts
git commit -m "feat: email templates — buildBaseEmail + brand colors (TDD)"
```

---

## Task 4: Final quality gates + planning docs

- [ ] **Step 4.1: Full quality gate**

```bash
pnpm lint && pnpm test 2>&1 | tail -6 && pnpm build 2>&1 | grep -E "Error|error TS" | head -5 && echo "all ok"
```

Expected: lint 0 errors, all tests pass, build succeeds

- [ ] **Step 4.2: Update task_plan.md and progress.md**

Mark Sub-project D complete in `task_plan.md`.
Add session summary to `progress.md`.

- [ ] **Step 4.3: Final commit**

```bash
git add task_plan.md progress.md plan_d_infrastructure.md
git commit -m "feat: Sub-project D complete — loading skeletons + email templates"
```
