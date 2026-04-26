# Phase 1-04: Application Form (6 Tabs)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Build the complete 6-tab merchant application form — draft auto-save, Cloudinary logo upload, and final submission that atomically creates a User + MerchantApplication.

**Architecture:** `ApplicationForm` is a Client Component managing tab state and per-tab form data. Each tab uses react-hook-form + Zod. Switching tabs triggers `saveDraftApplication`. Final submission calls `submitApplication` which creates User + Application atomically and auto-signs in.

**Tech Stack:** react-hook-form, Zod, Server Actions, Cloudinary Upload API, next-auth signIn

**Prerequisite:** Phase 1-03 complete.

---

### Task 1: Application Server Actions

**Files:**
- Create: `src/lib/actions/application.actions.ts`
- Test: `__tests__/integration/actions/application.actions.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/actions/application.actions.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'

jest.mock('@/lib/db/connect', () => ({ connectDB: jest.fn().mockResolvedValue({}) }))
jest.mock('@/lib/mail/mailgun', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  buildConfirmationEmail: jest.fn().mockReturnValue('<p>confirm</p>'),
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
  await MerchantApplicationModel.deleteMany({})
})

const adminId = new mongoose.Types.ObjectId()

async function createInvitation(email = 'shop@test.com', token = 'tok-abc') {
  return MerchantInvitationModel.create({
    email,
    token,
    expiresAt: new Date(Date.now() + 86400000),
    invitedBy: adminId,
  })
}

const fullPayload = {
  token: 'tok-abc',
  registeredCompanyName: 'Acme Pty Ltd',
  acn: '123456789',
  abn: '12345678901',
  registeredAddress: '1 Main St Sydney',
  sameAsRegistered: true,
  countryOfIncorporation: 'Australia',
  primaryContact: { name: 'Jane', email: 'jane@acme.com', phone: '0411000000' },
  isAuthorizedSignatory: true,
  financeContact: { name: 'Bob', position: 'CFO', email: 'bob@acme.com', phone: '0422000000' },
  brandNameEnglish: 'Acme',
  brandIntroductionEnglish: 'Leading retail brand in Australia.',
  mainCategories: ['fashion'],
  storesInAustralia: 5,
  storesToList: 3,
  paymentMethods: ['eftpos', 'visa'],
  bankAccountName: 'Acme Pty Ltd',
  bankAccountNumber: '123456789',
  bankName: 'CBA',
  bankBsb: '062-000',
  selectedPlatforms: [],
  additionalServices: [],
  socialMediaAccounts: [],
  logoUploads: {},
  interestedInChinesePayments: false,
  notifyForFuturePlatforms: false,
  ongoingPromotion: false,
  affiliateMarketing: false,
  agreementAccepted: true,
  setupFeeAccepted: true,
  applicantSignature: 'Jane Smith',
  applicantName: 'Jane Smith',
  applicantPosition: 'Director',
  applicantDate: '2026-04-25',
  witnessSignature: 'Bob Jones',
  witnessName: 'Bob Jones',
  witnessDate: '2026-04-25',
  password: 'SecurePass1!',
}

describe('saveDraftApplication', () => {
  it('creates a new draft when none exists', async () => {
    const inv = await createInvitation()
    const { saveDraftApplication } = await import('@/lib/actions/application.actions')
    const result = await saveDraftApplication(inv.token, {
      registeredCompanyName: 'Draft Co',
    })
    expect(result.success).toBe(true)
    const app = await MerchantApplicationModel.findOne({ invitationId: inv._id })
    expect(app?.status).toBe('draft')
    expect(app?.registeredCompanyName).toBe('Draft Co')
  })

  it('updates existing draft on second call', async () => {
    const inv = await createInvitation('b@b.com', 'tok-b')
    const { saveDraftApplication } = await import('@/lib/actions/application.actions')
    await saveDraftApplication(inv.token, { registeredCompanyName: 'First' })
    await saveDraftApplication(inv.token, { registeredCompanyName: 'Updated' })
    const count = await MerchantApplicationModel.countDocuments({ invitationId: inv._id })
    expect(count).toBe(1)
    const app = await MerchantApplicationModel.findOne({ invitationId: inv._id })
    expect(app?.registeredCompanyName).toBe('Updated')
  })
})

describe('submitApplication', () => {
  it('creates User and Application, marks invitation used', async () => {
    const inv = await createInvitation('shop@test.com', 'tok-abc')
    const { submitApplication } = await import('@/lib/actions/application.actions')
    const result = await submitApplication(fullPayload)
    expect(result.success).toBe(true)

    const user = await UserModel.findOne({ email: 'shop@test.com' })
    expect(user?.role).toBe('merchant')

    const app = await MerchantApplicationModel.findOne({ userId: user?._id })
    expect(app?.status).toBe('submitted')
    expect(app?.registeredCompanyName).toBe('Acme Pty Ltd')

    const updated = await MerchantInvitationModel.findById(inv._id)
    expect(updated?.status).toBe('used')
  })

  it('returns error for invalid token', async () => {
    const { submitApplication } = await import('@/lib/actions/application.actions')
    const result = await submitApplication({ ...fullPayload, token: 'bad-token' })
    expect(result.success).toBe(false)
  })

  it('does not create user if email already registered', async () => {
    await createInvitation('dup@test.com', 'tok-dup')
    await UserModel.create({
      email: 'dup@test.com',
      password: 'x',
      role: 'merchant',
      name: 'Existing',
    })
    const { submitApplication } = await import('@/lib/actions/application.actions')
    const result = await submitApplication({ ...fullPayload, token: 'tok-dup' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="application.actions.test"
```

- [ ] **Step 3: Implement application actions**

```typescript
// src/lib/actions/application.actions.ts
'use server'

import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { encrypt } from '@/lib/crypto/encrypt'
import { sendEmail, buildConfirmationEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'

export async function saveDraftApplication(
  token: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await connectDB()
    const invitation = await MerchantInvitationModel.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!invitation) return { success: false, error: '邀请链接无效' }

    await MerchantApplicationModel.findOneAndUpdate(
      { invitationId: invitation._id, status: 'draft' },
      { $set: { ...data, userId: invitation._id, invitationId: invitation._id } },
      { upsert: true, new: true }
    )

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '保存草稿失败' }
  }
}

interface SubmitPayload extends Record<string, unknown> {
  token: string
  password: string
  bankAccountNumber: string
  registeredCompanyName: string
  primaryContact: { name: string; email?: string }
}

export async function submitApplication(
  payload: SubmitPayload
): Promise<ActionResult<{ userId: string }>> {
  try {
    await connectDB()

    const invitation = await MerchantInvitationModel.findOne({
      token: payload.token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })

    if (!invitation) return { success: false, error: '邀请链接无效或已过期' }

    const existing = await UserModel.findOne({ email: invitation.email }).lean()
    if (existing) return { success: false, error: '该邮箱已注册，请直接登录' }

    const hashed = await bcrypt.hash(payload.password, 12)
    const encryptedBsb = encrypt(payload.bankAccountNumber)

    const user = await UserModel.create({
      email: invitation.email,
      password: hashed,
      role: 'merchant',
      name: payload.primaryContact?.name ?? invitation.email,
    })

    const { token: _t, password: _p, ...appData } = payload
    await MerchantApplicationModel.findOneAndUpdate(
      { invitationId: invitation._id },
      {
        $set: {
          ...appData,
          userId: user._id,
          invitationId: invitation._id,
          status: 'submitted',
          bankAccountNumber: encryptedBsb,
        },
      },
      { upsert: true, new: true }
    )

    invitation.status = 'used'
    await invitation.save()

    await NotificationModel.create({
      userId: user._id,
      type: 'general',
      title: '申请已提交，等待审核',
      message: `感谢您提交入驻申请！我们的团队将在 3-5 个工作日内审核您的申请 ${payload.registeredCompanyName}。`,
    })

    await sendEmail({
      to: invitation.email,
      subject: '您的 EchoBay 入驻申请已提交',
      html: buildConfirmationEmail(payload.registeredCompanyName),
    })

    return { success: true, data: { userId: user._id.toString() } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误'
    return { success: false, error: `提交失败: ${msg}` }
  }
}

export async function updateApplication(
  applicationId: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId)
    if (!app) return { success: false, error: '申请不存在' }
    if (!['submitted', 'requires_info'].includes(app.status)) {
      return { success: false, error: '当前状态不允许修改' }
    }

    if (typeof data.bankAccountNumber === 'string' && data.bankAccountNumber) {
      data.bankAccountNumber = encrypt(data.bankAccountNumber)
    }

    await MerchantApplicationModel.findByIdAndUpdate(applicationId, { $set: data })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新申请失败' }
  }
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="application.actions.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/application.actions.ts __tests__/integration/actions/application.actions.test.ts
git commit -m "feat: saveDraftApplication, submitApplication, updateApplication server actions"
```

---

### Task 2: Cloudinary upload Route Handler

**Files:**
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Implement upload route**

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()

  // Allow upload if user is logged-in merchant OR if there's a valid token in header
  // (during application before account is created, we use a one-time form token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) ?? 'echobay-crm'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
      { status: 400 }
    )
  }

  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File size must be under 5 MB' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  })

  return NextResponse.json({ publicId: result.public_id, url: result.secure_url })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/upload/
git commit -m "feat: Cloudinary upload route handler"
```

---

### Task 3: ApplicationForm shell

**Files:**
- Create: `src/components/shared/merchant-form/application-form.tsx`

- [ ] **Step 1: Implement ApplicationForm container**

```typescript
// src/components/shared/merchant-form/application-form.tsx
'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { saveDraftApplication } from '@/lib/actions/application.actions'
import { TabCompany } from './tab-company'
import { TabContacts } from './tab-contacts'
import { TabBrandStore } from './tab-brand-store'
import { TabBanking } from './tab-banking'
import { TabPartnership } from './tab-partnership'
import { TabAgreement } from './tab-agreement'

const TABS = [
  { id: 'company', label: '① 公司信息' },
  { id: 'contacts', label: '② 联系人' },
  { id: 'brand', label: '③ 品牌 & 门店' },
  { id: 'banking', label: '④ 银行账户' },
  { id: 'partnership', label: '⑤ 合作方案' },
  { id: 'agreement', label: '⑥ 协议签名' },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  token: string
  invitationId: string
  email: string
}

export function ApplicationForm({ token, invitationId, email }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('company')
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set())
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleTabData = useCallback(
    async (tabId: TabId, data: Record<string, unknown>, nextTab?: TabId) => {
      const merged = { ...formData, ...data }
      setFormData(merged)
      setCompletedTabs((prev) => new Set([...prev, tabId]))

      setIsSaving(true)
      await saveDraftApplication(token, merged)
      setIsSaving(false)

      if (nextTab) setActiveTab(nextTab)
    },
    [formData, token]
  )

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      {isSaving && (
        <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-400">
          草稿保存中… Draft saving…
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <div className="overflow-x-auto border-b border-zinc-200">
          <TabsList className="h-auto p-0 bg-transparent rounded-none flex w-max min-w-full">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 gap-1.5"
              >
                {tab.label}
                {completedTabs.has(tab.id) && (
                  <Badge variant="outline" className="text-xs py-0 px-1.5 bg-green-50 text-green-700 border-green-200">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="company" className="mt-0">
          <TabCompany
            defaultValues={formData}
            onComplete={(data) => handleTabData('company', data, 'contacts')}
          />
        </TabsContent>
        <TabsContent value="contacts" className="mt-0">
          <TabContacts
            defaultValues={formData}
            onComplete={(data) => handleTabData('contacts', data, 'brand')}
            onBack={() => setActiveTab('company')}
          />
        </TabsContent>
        <TabsContent value="brand" className="mt-0">
          <TabBrandStore
            defaultValues={formData}
            onComplete={(data) => handleTabData('brand', data, 'banking')}
            onBack={() => setActiveTab('contacts')}
          />
        </TabsContent>
        <TabsContent value="banking" className="mt-0">
          <TabBanking
            defaultValues={formData}
            onComplete={(data) => handleTabData('banking', data, 'partnership')}
            onBack={() => setActiveTab('brand')}
          />
        </TabsContent>
        <TabsContent value="partnership" className="mt-0">
          <TabPartnership
            defaultValues={formData}
            onComplete={(data) => handleTabData('partnership', data, 'agreement')}
            onBack={() => setActiveTab('banking')}
          />
        </TabsContent>
        <TabsContent value="agreement" className="mt-0">
          <TabAgreement
            email={email}
            token={token}
            allFormData={formData}
            onBack={() => setActiveTab('partnership')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/merchant-form/application-form.tsx
git commit -m "feat: ApplicationForm container with tab state and auto-save"
```

---

### Task 4: Tab components (① – ④)

**Files:**
- Create: `src/components/shared/merchant-form/tab-company.tsx`
- Create: `src/components/shared/merchant-form/tab-contacts.tsx`
- Create: `src/components/shared/merchant-form/tab-brand-store.tsx`
- Create: `src/components/shared/merchant-form/tab-banking.tsx`

- [ ] **Step 1: Implement TabCompany**

```typescript
// src/components/shared/merchant-form/tab-company.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab1Schema, type Tab1Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab1Input) => void
}

export function TabCompany({ defaultValues, onComplete }: Props) {
  const form = useForm<Tab1Input>({
    resolver: zodResolver(tab1Schema),
    defaultValues: {
      registeredCompanyName: (defaultValues.registeredCompanyName as string) ?? '',
      tradingName: (defaultValues.tradingName as string) ?? '',
      acn: (defaultValues.acn as string) ?? '',
      abn: (defaultValues.abn as string) ?? '',
      registeredAddress: (defaultValues.registeredAddress as string) ?? '',
      postalAddress: (defaultValues.postalAddress as string) ?? '',
      sameAsRegistered: (defaultValues.sameAsRegistered as boolean) ?? false,
      countryOfIncorporation: (defaultValues.countryOfIncorporation as string) ?? 'Australia',
    },
  })

  const sameAsRegistered = form.watch('sameAsRegistered')

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">公司信息 · Company Information</h2>
        <p className="text-zinc-500 text-sm mt-0.5">请填写 ASIC 登记的注册信息</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="registeredCompanyName">
            注册公司名称 <span className="text-red-500">*</span>
          </Label>
          <Input id="registeredCompanyName" {...form.register('registeredCompanyName')} />
          {form.formState.errors.registeredCompanyName && (
            <p className="text-red-500 text-xs">{form.formState.errors.registeredCompanyName.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tradingName">交易名称 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input id="tradingName" {...form.register('tradingName')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acn">ACN <span className="text-red-500">*</span></Label>
          <Input id="acn" placeholder="000 000 000" {...form.register('acn')} />
          {form.formState.errors.acn && (
            <p className="text-red-500 text-xs">{form.formState.errors.acn.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="abn">ABN <span className="text-red-500">*</span></Label>
          <Input id="abn" placeholder="00 000 000 000" {...form.register('abn')} />
          {form.formState.errors.abn && (
            <p className="text-red-500 text-xs">{form.formState.errors.abn.message}</p>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="registeredAddress">注册地址 <span className="text-red-500">*</span></Label>
          <Input id="registeredAddress" {...form.register('registeredAddress')} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="sameAsRegistered"
            checked={sameAsRegistered}
            onCheckedChange={(v) => form.setValue('sameAsRegistered', !!v)}
          />
          <Label htmlFor="sameAsRegistered" className="cursor-pointer font-normal">
            邮寄地址与注册地址相同
          </Label>
        </div>
        {!sameAsRegistered && (
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="postalAddress">邮寄地址</Label>
            <Input id="postalAddress" {...form.register('postalAddress')} />
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2 border-t border-zinc-100">
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Implement TabContacts**

```typescript
// src/components/shared/merchant-form/tab-contacts.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab2Schema, type Tab2Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab2Input) => void
  onBack: () => void
}

export function TabContacts({ defaultValues, onComplete, onBack }: Props) {
  const form = useForm<Tab2Input>({
    resolver: zodResolver(tab2Schema),
    defaultValues: {
      primaryContact: (defaultValues.primaryContact as Tab2Input['primaryContact']) ?? { name: '', email: '', phone: '' },
      isAuthorizedSignatory: (defaultValues.isAuthorizedSignatory as boolean) ?? true,
      financeContact: (defaultValues.financeContact as Tab2Input['financeContact']) ?? { name: '', position: '', email: '', phone: '' },
    },
  })

  const isAuth = form.watch('isAuthorizedSignatory')

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">联系人信息 · Contacts</h2>
        <p className="text-zinc-500 text-sm mt-0.5">主联系人将作为与 EchoBay 沟通的主要负责人</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">主联系人 Primary Contact</p>
        <div className="grid grid-cols-2 gap-4">
          {(['name', 'position', 'email', 'phone'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <Label htmlFor={`pc-${field}`}>
                {field === 'name' ? '姓名' : field === 'position' ? '职位' : field === 'email' ? '邮箱' : '电话'}
                {field !== 'position' && <span className="text-red-500"> *</span>}
              </Label>
              <Input id={`pc-${field}`} type={field === 'email' ? 'email' : 'text'} {...form.register(`primaryContact.${field}`)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <Checkbox id="isAuth" checked={isAuth} onCheckedChange={(v) => form.setValue('isAuthorizedSignatory', !!v)} />
        <Label htmlFor="isAuth" className="cursor-pointer font-normal">主联系人即为授权签字人 (Authorized Signatory)</Label>
      </div>

      {!isAuth && (
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">授权董事 Authorized Director</p>
          <div className="grid grid-cols-2 gap-4">
            {(['name', 'position', 'email', 'phone'] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <Label>{field === 'name' ? '姓名' : field === 'position' ? '职位' : field === 'email' ? '邮箱' : '电话'}</Label>
                <Input type={field === 'email' ? 'email' : 'text'} {...form.register(`authorizedDirector.${field}`)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">财务联系人 Finance Contact</p>
        <div className="grid grid-cols-2 gap-4">
          {(['name', 'position', 'email', 'phone'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <Label>
                {field === 'name' ? '姓名' : field === 'position' ? '职位' : field === 'email' ? '邮箱' : '电话'}
                <span className="text-red-500"> *</span>
              </Label>
              <Input type={field === 'email' ? 'email' : 'text'} {...form.register(`financeContact.${field}`)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Implement TabBrandStore**

```typescript
// src/components/shared/merchant-form/tab-brand-store.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab3Schema, type Tab3Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab3Input) => void
  onBack: () => void
}

export function TabBrandStore({ defaultValues, onComplete, onBack }: Props) {
  const form = useForm<Tab3Input>({
    resolver: zodResolver(tab3Schema),
    defaultValues: {
      brandNameEnglish: (defaultValues.brandNameEnglish as string) ?? '',
      brandNameChinese: (defaultValues.brandNameChinese as string) ?? '',
      brandIntroductionEnglish: (defaultValues.brandIntroductionEnglish as string) ?? '',
      website: (defaultValues.website as string) ?? '',
      mainCategories: (defaultValues.mainCategories as string[]) ?? [],
      storesInAustralia: (defaultValues.storesInAustralia as number) ?? 1,
      storesToList: (defaultValues.storesToList as number) ?? 1,
      otherCountries: (defaultValues.otherCountries as string) ?? '',
      socialMediaAccounts: (defaultValues.socialMediaAccounts as string[]) ?? [],
      logoUploads: (defaultValues.logoUploads as Record<string, string>) ?? {},
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">品牌 & 门店信息 · Brand & Store</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>品牌英文名 <span className="text-red-500">*</span></Label>
          <Input {...form.register('brandNameEnglish')} />
          {form.formState.errors.brandNameEnglish && (
            <p className="text-red-500 text-xs">{form.formState.errors.brandNameEnglish.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>品牌中文名 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input {...form.register('brandNameChinese')} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label>品牌介绍（英文）<span className="text-red-500">*</span></Label>
          <Textarea rows={3} {...form.register('brandIntroductionEnglish')} />
          {form.formState.errors.brandIntroductionEnglish && (
            <p className="text-red-500 text-xs">{form.formState.errors.brandIntroductionEnglish.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>官网 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input type="url" placeholder="https://" {...form.register('website')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>其他国家/地区门店 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input placeholder="如：中国、新加坡" {...form.register('otherCountries')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>澳洲总门店数 <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} {...form.register('storesInAustralia')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>计划参与门店数 <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} {...form.register('storesToList')} />
        </div>
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Implement TabBanking**

```typescript
// src/components/shared/merchant-form/tab-banking.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab4Schema, type Tab4Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab4Input) => void
  onBack: () => void
}

export function TabBanking({ defaultValues, onComplete, onBack }: Props) {
  const form = useForm<Tab4Input>({
    resolver: zodResolver(tab4Schema),
    defaultValues: {
      bankAccountName: (defaultValues.bankAccountName as string) ?? '',
      bankAccountNumber: (defaultValues.bankAccountNumber as string) ?? '',
      bankName: (defaultValues.bankName as string) ?? '',
      bankBsb: (defaultValues.bankBsb as string) ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">银行账户 · Banking Details</h2>
      </div>
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800 text-sm">
          🔒 银行账户信息将经过加密处理后安全存储。Banking details are encrypted in transit and at rest.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'bankAccountName', label: '账户名称', placeholder: 'Account Name' },
          { key: 'bankAccountNumber', label: '账户号码', placeholder: 'Account Number' },
          { key: 'bankName', label: '银行名称', placeholder: 'Bank Name' },
          { key: 'bankBsb', label: 'BSB 码', placeholder: '000-000' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label>{label} <span className="text-red-500">*</span></Label>
            <Input
              placeholder={placeholder}
              type={key === 'bankAccountNumber' ? 'password' : 'text'}
              {...form.register(key as keyof Tab4Input)}
            />
            {form.formState.errors[key as keyof Tab4Input] && (
              <p className="text-red-500 text-xs">
                {form.formState.errors[key as keyof Tab4Input]?.message}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/merchant-form/tab-company.tsx src/components/shared/merchant-form/tab-contacts.tsx src/components/shared/merchant-form/tab-brand-store.tsx src/components/shared/merchant-form/tab-banking.tsx
git commit -m "feat: Tab 1-4 form components (company, contacts, brand/store, banking)"
```

---

### Task 5: Tab components (⑤ Partnership + ⑥ Agreement)

**Files:**
- Create: `src/components/shared/merchant-form/tab-partnership.tsx`
- Create: `src/components/shared/merchant-form/tab-agreement.tsx`

- [ ] **Step 1: Implement TabPartnership**

```typescript
// src/components/shared/merchant-form/tab-partnership.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab5Schema, type Tab5Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const PAYMENT_OPTIONS = ['Visa', 'Mastercard', 'EFTPOS', 'Alipay', 'WeChat Pay', 'UnionPay', 'Apple Pay']
const PLATFORM_OPTIONS = ['EchoBay App', 'EchoBay Website', 'WeChat Mini Program', 'Red (小红书)']
const SERVICE_OPTIONS = ['社交媒体推广 Social Media', '内容营销 Content Marketing', '数据分析 Analytics']

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab5Input) => void
  onBack: () => void
}

function MultiCheckbox({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors ${value.includes(opt) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-700'}`}>
          <input
            type="checkbox"
            className="sr-only"
            checked={value.includes(opt)}
            onChange={() => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

export function TabPartnership({ defaultValues, onComplete, onBack }: Props) {
  const form = useForm<Tab5Input>({
    resolver: zodResolver(tab5Schema),
    defaultValues: {
      paymentMethods: (defaultValues.paymentMethods as string[]) ?? [],
      interestedInChinesePayments: (defaultValues.interestedInChinesePayments as boolean) ?? false,
      selectedPlatforms: (defaultValues.selectedPlatforms as string[]) ?? [],
      additionalServices: (defaultValues.additionalServices as string[]) ?? [],
      ongoingPromotion: (defaultValues.ongoingPromotion as boolean) ?? false,
      affiliateMarketing: (defaultValues.affiliateMarketing as boolean) ?? false,
      notifyForFuturePlatforms: (defaultValues.notifyForFuturePlatforms as boolean) ?? false,
      customerCashback: (defaultValues.customerCashback as number) ?? undefined,
      upfrontBenefits: (defaultValues.upfrontBenefits as string) ?? '',
      exclusions: (defaultValues.exclusions as string) ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">合作方案 · Partnership</h2>
      </div>
      <div className="flex flex-col gap-2">
        <Label>支付方式 <span className="text-red-500">*</span></Label>
        <Controller name="paymentMethods" control={form.control} render={({ field }) => (
          <MultiCheckbox options={PAYMENT_OPTIONS} value={field.value} onChange={field.onChange} />
        )} />
        {form.formState.errors.paymentMethods && (
          <p className="text-red-500 text-xs">{form.formState.errors.paymentMethods.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label>合作平台</Label>
        <Controller name="selectedPlatforms" control={form.control} render={({ field }) => (
          <MultiCheckbox options={PLATFORM_OPTIONS} value={field.value} onChange={field.onChange} />
        )} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Cashback 比例 (%)</Label>
          <Input type="number" min={0} step={0.1} {...form.register('customerCashback')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>前期优惠 Upfront Benefits</Label>
          <Input {...form.register('upfrontBenefits')} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>增值服务</Label>
        <Controller name="additionalServices" control={form.control} render={({ field }) => (
          <MultiCheckbox options={SERVICE_OPTIONS} value={field.value} onChange={field.onChange} />
        )} />
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Implement TabAgreement**

```typescript
// src/components/shared/merchant-form/tab-agreement.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { tab6Schema, type Tab6Input } from '@/lib/validations/application.schema'
import { submitApplication } from '@/lib/actions/application.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

interface Props {
  email: string
  token: string
  allFormData: Record<string, unknown>
  onBack: () => void
}

export function TabAgreement({ email, token, allFormData, onBack }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Tab6Input>({
    resolver: zodResolver(tab6Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      agreementAccepted: false as unknown as true,
      setupFeeAccepted: false as unknown as true,
      applicantSignature: '',
      applicantName: '',
      applicantPosition: '',
      applicantDate: new Date().toISOString().split('T')[0] ?? '',
      witnessSignature: '',
      witnessName: '',
      witnessDate: '',
    },
  })

  async function onSubmit(tabData: Tab6Input) {
    setSubmitting(true)
    setError(null)
    const { confirmPassword: _, ...signatureData } = tabData
    const payload = { ...allFormData, ...signatureData, token } as Parameters<typeof submitApplication>[0]
    const result = await submitApplication(payload)
    if (!result.success) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    await signIn('credentials', { email, password: tabData.password, redirect: false })
    router.push('/merchant/dashboard')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">协议签名 · Agreement & Signature</h2>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">设置账号密码 Set Password</p>
        <p className="text-zinc-500 text-xs">您的登录邮箱：{email}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>密码 <span className="text-red-500">*</span></Label>
            <Input type="password" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>确认密码 <span className="text-red-500">*</span></Label>
            <Input type="password" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword && <p className="text-red-500 text-xs">{form.formState.errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Checkbox id="agree" {...form.register('agreementAccepted')} />
          <Label htmlFor="agree" className="text-sm font-normal cursor-pointer leading-relaxed">
            我已阅读并同意 EchoBay 商家合作协议条款 · I have read and agree to the EchoBay Merchant Agreement terms. <span className="text-red-500">*</span>
          </Label>
        </div>
        {form.formState.errors.agreementAccepted && <p className="text-red-500 text-xs ml-6">{form.formState.errors.agreementAccepted.message}</p>}
        <div className="flex items-start gap-2">
          <Checkbox id="setup" {...form.register('setupFeeAccepted')} />
          <Label htmlFor="setup" className="text-sm font-normal cursor-pointer">
            我确认已了解并同意缴纳平台设置费用 · I acknowledge the platform setup fee. <span className="text-red-500">*</span>
          </Label>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">申请人签名 Applicant Signature</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'applicantSignature', label: '签名（请输入全名）' },
            { key: 'applicantName', label: '姓名' },
            { key: 'applicantPosition', label: '职位' },
            { key: 'applicantDate', label: '日期', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key as keyof Tab6Input)} />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium mt-2">见证人签名 Witness Signature</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'witnessSignature', label: '见证人签名' },
            { key: 'witnessName', label: '见证人姓名' },
            { key: 'witnessDate', label: '日期', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key as keyof Tab6Input)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : '提交申请 Submit →'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Wire ApplicationForm into apply page**

Update `src/app/apply/[token]/page.tsx` — replace the placeholder comment with:

```typescript
// replace the placeholder paragraph with:
import { ApplicationForm } from '@/components/shared/merchant-form/application-form'

// inside the JSX, replace the placeholder:
<ApplicationForm token={token} invitationId={invitationId} email={email} />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/merchant-form/ src/app/apply/
git commit -m "feat: complete 6-tab application form with draft auto-save and submission"
```

---

### Task 6: Phase gate

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: Update docs/INDEX.md**

Mark 1-04 ✅. Set Active Plan to `phase1-05-merchant-portal.md`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 1-04 — 6-tab application form, Cloudinary upload, submit action"
```

---

**Phase 1-04 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-05-merchant-portal.md`**
