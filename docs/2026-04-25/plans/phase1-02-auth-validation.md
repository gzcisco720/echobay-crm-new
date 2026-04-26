# Phase 1-02: Auth & Zod Validation

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Implement Zod validation schemas, Auth.js v5 with Credentials provider, JWT middleware for route protection, and the login page.

**Architecture:** Auth.js v5 uses a `Credentials` provider that verifies bcrypt password against MongoDB. Role is embedded in the JWT. `middleware.ts` reads the session and redirects by route prefix.

**Tech Stack:** Auth.js v5 (next-auth@beta), bcryptjs, Zod, Next.js Middleware

**Prerequisite:** Phase 1-01 complete.

---

### Task 1: Types + ActionResult helper

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/types/action.ts`

- [ ] **Step 1: Write auth types**

```typescript
// src/types/auth.ts
import type { UserRole } from '@/lib/db/models/user.model'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
```

- [ ] **Step 2: Write ActionResult helper**

```typescript
// src/types/action.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

- [ ] **Step 3: Extend next-auth Session types**

```typescript
// src/types/next-auth.d.ts
import type { UserRole } from '@/lib/db/models/user.model'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/
git commit -m "feat: TypeScript types for auth and action results"
```

---

### Task 2: Zod auth schema

**Files:**
- Create: `src/lib/validations/auth.schema.ts`
- Test: `__tests__/unit/validations/auth.schema.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/unit/validations/auth.schema.test.ts
import { loginSchema } from '@/lib/validations/auth.schema'

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toContain('email')
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:unit -- --testPathPatterns="auth.schema.test"
```

- [ ] **Step 3: Implement auth schema**

```typescript
// src/lib/validations/auth.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:unit -- --testPathPatterns="auth.schema.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/auth.schema.ts __tests__/unit/validations/auth.schema.test.ts
git commit -m "feat: Zod auth schema"
```

---

### Task 3: Zod application schemas (per-tab)

**Files:**
- Create: `src/lib/validations/application.schema.ts`
- Test: `__tests__/unit/validations/application.schema.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/unit/validations/application.schema.test.ts
import {
  tab1Schema,
  tab2Schema,
  tab3Schema,
  tab4Schema,
  tab5Schema,
  tab6Schema,
} from '@/lib/validations/application.schema'

describe('tab1Schema (Company Info)', () => {
  it('accepts valid company info', () => {
    const r = tab1Schema.safeParse({
      registeredCompanyName: 'Acme Pty Ltd',
      acn: '123456789',
      abn: '12345678901',
      registeredAddress: '1 Main St Sydney',
      sameAsRegistered: true,
      countryOfIncorporation: 'Australia',
    })
    expect(r.success).toBe(true)
  })

  it('rejects missing registeredCompanyName', () => {
    const r = tab1Schema.safeParse({ acn: '1', abn: '1', registeredAddress: 'x' })
    expect(r.success).toBe(false)
  })
})

describe('tab2Schema (Contacts)', () => {
  const base = {
    primaryContact: { name: 'Jane', email: 'jane@co.com', phone: '0411000000' },
    isAuthorizedSignatory: true,
    financeContact: { name: 'Bob', position: 'CFO', email: 'bob@co.com', phone: '0422000000' },
  }

  it('accepts valid contacts without authorized director', () => {
    expect(tab2Schema.safeParse(base).success).toBe(true)
  })

  it('rejects missing financeContact', () => {
    const { financeContact: _fc, ...noFinance } = base
    expect(tab2Schema.safeParse(noFinance).success).toBe(false)
  })
})

describe('tab4Schema (Banking)', () => {
  it('accepts valid bank details', () => {
    const r = tab4Schema.safeParse({
      bankAccountName: 'Acme Pty Ltd',
      bankAccountNumber: '12345678',
      bankName: 'CBA',
      bankBsb: '062-000',
    })
    expect(r.success).toBe(true)
  })
})

describe('tab6Schema (Agreement)', () => {
  const valid = {
    password: 'SecurePass1!',
    confirmPassword: 'SecurePass1!',
    agreementAccepted: true,
    setupFeeAccepted: true,
    applicantSignature: 'Jane Smith',
    applicantName: 'Jane Smith',
    applicantPosition: 'Director',
    applicantDate: '2026-04-25',
    witnessSignature: 'Bob Jones',
    witnessName: 'Bob Jones',
    witnessDate: '2026-04-25',
  }

  it('accepts valid agreement data', () => {
    expect(tab6Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects when passwords do not match', () => {
    const r = tab6Schema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(r.success).toBe(false)
  })

  it('rejects when agreementAccepted is false', () => {
    const r = tab6Schema.safeParse({ ...valid, agreementAccepted: false })
    expect(r.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:unit -- --testPathPatterns="application.schema.test"
```

- [ ] **Step 3: Implement application schemas**

```typescript
// src/lib/validations/application.schema.ts
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  position: z.string().optional(),
  email: z.string().email('请输入有效邮箱').optional().or(z.literal('')),
  phone: z.string().min(1, '电话不能为空'),
})

const financeContactSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  position: z.string().min(1, '职位不能为空'),
  email: z.string().email('请输入有效邮箱'),
  phone: z.string().min(1, '电话不能为空'),
})

export const tab1Schema = z.object({
  registeredCompanyName: z.string().min(1, '公司名称不能为空'),
  tradingName: z.string().optional(),
  acn: z.string().min(1, 'ACN 不能为空'),
  abn: z.string().min(1, 'ABN 不能为空'),
  registeredAddress: z.string().min(1, '注册地址不能为空'),
  postalAddress: z.string().optional(),
  sameAsRegistered: z.boolean().optional(),
  countryOfIncorporation: z.string().default('Australia'),
})

export const tab2Schema = z.object({
  primaryContact: contactSchema.extend({ phone: z.string().min(1) }),
  isAuthorizedSignatory: z.boolean().default(true),
  authorizedDirector: contactSchema.optional(),
  financeContact: financeContactSchema,
})

export const tab3Schema = z.object({
  brandNameEnglish: z.string().min(1, '品牌英文名不能为空'),
  brandNameChinese: z.string().optional(),
  brandIntroductionEnglish: z.string().min(10, '品牌介绍至少 10 个字符'),
  website: z.string().url().optional().or(z.literal('')),
  socialMediaAccounts: z.array(z.string()).default([]),
  logoUploads: z.record(z.string()).default({}),
  mainCategories: z.array(z.string()).min(1, '请至少选择一个类目'),
  storesInAustralia: z.coerce.number().int().min(1),
  storesToList: z.coerce.number().int().min(1),
  otherCountries: z.string().optional(),
})

export const tab4Schema = z.object({
  bankAccountName: z.string().min(1, '账户名称不能为空'),
  bankAccountNumber: z.string().min(1, '账户号码不能为空'),
  bankName: z.string().min(1, '银行名称不能为空'),
  bankBsb: z.string().min(1, 'BSB 码不能为空'),
})

export const tab5Schema = z.object({
  paymentMethods: z.array(z.string()).min(1, '请至少选择一种支付方式'),
  interestedInChinesePayments: z.boolean().default(false),
  paymentPromotions: z.string().optional(),
  selectedPlatforms: z.array(z.string()).default([]),
  otherPlatforms: z.string().optional(),
  notifyForFuturePlatforms: z.boolean().default(false),
  upfrontBenefits: z.string().optional(),
  customerCashback: z.coerce.number().min(0).optional(),
  promotionStartDate: z.string().optional(),
  promotionEndDate: z.string().optional(),
  ongoingPromotion: z.boolean().default(false),
  affiliateMarketing: z.boolean().default(false),
  exclusions: z.string().optional(),
  additionalServices: z.array(z.string()).default([]),
})

export const tab6Schema = z
  .object({
    password: z.string().min(8, '密码至少 8 位'),
    confirmPassword: z.string().min(1, '请确认密码'),
    agreementAccepted: z.literal(true, { errorMap: () => ({ message: '请阅读并同意协议' }) }),
    setupFeeAccepted: z.literal(true, { errorMap: () => ({ message: '请确认设置费用' }) }),
    applicantSignature: z.string().min(1, '请输入签名'),
    applicantName: z.string().min(1, '请输入姓名'),
    applicantPosition: z.string().min(1, '请输入职位'),
    applicantDate: z.string().min(1, '请选择日期'),
    witnessSignature: z.string().min(1, '请输入见证人签名'),
    witnessName: z.string().min(1, '请输入见证人姓名'),
    witnessDate: z.string().min(1, '请选择见证日期'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export const fullApplicationSchema = tab1Schema
  .merge(tab2Schema)
  .merge(tab3Schema)
  .merge(tab4Schema)
  .merge(tab5Schema)
  .merge(tab6Schema.omit({ confirmPassword: true }))

export type Tab1Input = z.infer<typeof tab1Schema>
export type Tab2Input = z.infer<typeof tab2Schema>
export type Tab3Input = z.infer<typeof tab3Schema>
export type Tab4Input = z.infer<typeof tab4Schema>
export type Tab5Input = z.infer<typeof tab5Schema>
export type Tab6Input = z.infer<typeof tab6Schema>
export type FullApplicationInput = z.infer<typeof fullApplicationSchema>
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:unit -- --testPathPatterns="application.schema.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/application.schema.ts __tests__/unit/validations/application.schema.test.ts
git commit -m "feat: Zod schemas for all 6 application tabs"
```

---

### Task 4: Auth.js v5 configuration

**Files:**
- Create: `src/lib/auth/auth.config.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Implement Auth.js config**

```typescript
// src/lib/auth/auth.config.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { loginSchema } from '@/lib/validations/auth.schema'
import type { UserRole } from '@/lib/db/models/user.model'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        await connectDB()
        const user = await UserModel.findOne({
          email: parsed.data.email.toLowerCase(),
          isActive: true,
        }).lean()

        if (!user) return null
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
```

- [ ] **Step 2: Create Route Handler**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth/auth.config'

export const { GET, POST } = handlers
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/ src/app/api/auth/
git commit -m "feat: Auth.js v5 with Credentials provider and JWT callbacks"
```

---

### Task 5: Middleware for route protection

**Files:**
- Create: `middleware.ts` (root level)

- [ ] **Step 1: Implement middleware**

```typescript
// middleware.ts
import { auth } from '@/lib/auth/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req
  const session = req.auth
  const role = session?.user?.role

  if (nextUrl.pathname.startsWith('/merchant')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'merchant') {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/merchant/:path*', '/admin/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: route protection middleware for merchant and admin paths"
```

---

### Task 6: Login page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/components/shared/auth/login-form.tsx`

- [ ] **Step 1: Implement LoginForm client component**

```typescript
// src/components/shared/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('邮箱或密码错误，请重试')
      return
    }
    router.push('/merchant/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">登录 · Sign In</CardTitle>
        <CardDescription>EchoBay 商家管理平台</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">邮箱 Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">密码 Password</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? '登录中...' : '登录 Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Add react-hook-form + zod resolver**

```bash
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 3: Implement login page**

```typescript
// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/shared/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            EB
          </div>
          <span className="font-semibold text-zinc-900">EchoBay</span>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/ src/components/shared/auth/
git commit -m "feat: login page with Auth.js v5 credentials sign-in"
```

---

### Task 7: Phase gate

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: 0 errors

- [ ] **Step 3: Update docs/INDEX.md**

Mark 1-02 ✅. Set Active Plan to `phase1-03-invitation-flow.md`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 1-02 — Auth.js v5, Zod schemas, login page"
```

---

**Phase 1-02 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-03-invitation-flow.md`**
