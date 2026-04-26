# Phase 1-01: Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement task-by-task.

**Goal:** Implement Mongoose singleton connection, all 5 data models, and AES-256-GCM encryption utility — each driven by tests.

**Architecture:** Singleton `connectDB()` avoids multiple connections in Next.js serverless. Each model uses `mongoose.models.X ?? mongoose.model(...)` guard for hot-reload safety. Bank account numbers encrypted at rest.

**Tech Stack:** Mongoose 8, mongodb-memory-server, Jest, TypeScript strict

**Prerequisite:** Phase 1-00 complete. Run all commands from `/Users/eric/Desktop/echobay/echobay-crm`.

---

### Task 1: DB connection singleton

**Files:**
- Create: `src/lib/db/connect.ts`
- Test: `__tests__/integration/models/connect.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/integration/models/connect.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

it('connectDB returns a mongoose instance', async () => {
  const { connectDB } = await import('@/lib/db/connect')
  const conn = await connectDB()
  expect(conn.connection.readyState).toBe(1) // 1 = connected
})

it('connectDB returns the same instance on repeated calls', async () => {
  const { connectDB } = await import('@/lib/db/connect')
  const a = await connectDB()
  const b = await connectDB()
  expect(a).toBe(b)
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="connect.test"
```

Expected: FAIL — `Cannot find module '@/lib/db/connect'`

- [ ] **Step 3: Implement connectDB**

```typescript
// src/lib/db/connect.ts
import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined')

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false })
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="connect.test"
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/connect.ts __tests__/integration/models/connect.test.ts
git commit -m "feat: mongoose singleton connectDB"
```

---

### Task 2: User model

**Files:**
- Create: `src/lib/db/models/user.model.ts`
- Test: `__tests__/integration/models/user.model.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/models/user.model.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

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
  const { UserModel } = await import('@/lib/db/models/user.model')
  await UserModel.deleteMany({})
})

describe('UserModel', () => {
  it('saves a user with valid fields', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    const user = await UserModel.create({
      email: 'test@example.com',
      password: 'hashed_pw',
      role: 'merchant',
      name: 'Test User',
    })
    expect(user._id).toBeDefined()
    expect(user.isActive).toBe(true)
    expect(user.createdAt).toBeDefined()
  })

  it('lowercases email', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    const user = await UserModel.create({
      email: 'UPPER@EXAMPLE.COM',
      password: 'x',
      role: 'admin',
      name: 'Admin',
    })
    expect(user.email).toBe('upper@example.com')
  })

  it('enforces unique email', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    await UserModel.create({ email: 'dup@ex.com', password: 'x', role: 'admin', name: 'A' })
    await expect(
      UserModel.create({ email: 'dup@ex.com', password: 'y', role: 'admin', name: 'B' })
    ).rejects.toThrow()
  })

  it('rejects invalid role', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    await expect(
      UserModel.create({ email: 'a@b.com', password: 'x', role: 'superuser', name: 'A' })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="user.model.test"
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement User model**

```typescript
// src/lib/db/models/user.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'merchant' | 'admin' | 'super_admin'

export interface IUser {
  email: string
  password: string
  role: UserRole
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['merchant', 'admin', 'super_admin'], required: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.index({ email: 1 })

export const UserModel: Model<IUserDocument> =
  mongoose.models['User'] != null
    ? (mongoose.models['User'] as Model<IUserDocument>)
    : mongoose.model<IUserDocument>('User', UserSchema)
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="user.model.test"
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/models/user.model.ts __tests__/integration/models/user.model.test.ts
git commit -m "feat: User mongoose model with role validation"
```

---

### Task 3: MerchantInvitation model

**Files:**
- Create: `src/lib/db/models/merchant-invitation.model.ts`
- Test: `__tests__/integration/models/merchant-invitation.model.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/models/merchant-invitation.model.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

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
  const { MerchantInvitationModel } = await import('@/lib/db/models/merchant-invitation.model')
  await MerchantInvitationModel.deleteMany({})
})

describe('MerchantInvitationModel', () => {
  const adminId = new mongoose.Types.ObjectId()

  it('creates invitation with pending status', async () => {
    const { MerchantInvitationModel } = await import('@/lib/db/models/merchant-invitation.model')
    const inv = await MerchantInvitationModel.create({
      email: 'merchant@shop.com',
      token: 'uuid-token-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      invitedBy: adminId,
    })
    expect(inv.status).toBe('pending')
    expect(inv.email).toBe('merchant@shop.com')
  })

  it('enforces unique token', async () => {
    const { MerchantInvitationModel } = await import('@/lib/db/models/merchant-invitation.model')
    const base = { token: 'same-token', expiresAt: new Date(), invitedBy: adminId }
    await MerchantInvitationModel.create({ email: 'a@a.com', ...base })
    await expect(
      MerchantInvitationModel.create({ email: 'b@b.com', ...base })
    ).rejects.toThrow()
  })

  it('lowercases email', async () => {
    const { MerchantInvitationModel } = await import('@/lib/db/models/merchant-invitation.model')
    const inv = await MerchantInvitationModel.create({
      email: 'SHOP@EXAMPLE.COM',
      token: 'tok-1',
      expiresAt: new Date(),
      invitedBy: adminId,
    })
    expect(inv.email).toBe('shop@example.com')
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="merchant-invitation.model.test"
```

- [ ] **Step 3: Implement MerchantInvitation model**

```typescript
// src/lib/db/models/merchant-invitation.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type InvitationStatus = 'pending' | 'used' | 'expired'

export interface IMerchantInvitation {
  email: string
  token: string
  expiresAt: Date
  status: InvitationStatus
  invitedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IMerchantInvitationDocument extends IMerchantInvitation, Document {}

const MerchantInvitationSchema = new Schema<IMerchantInvitationDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'used', 'expired'],
      default: 'pending',
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

MerchantInvitationSchema.index({ token: 1 })
MerchantInvitationSchema.index({ email: 1 })

export const MerchantInvitationModel: Model<IMerchantInvitationDocument> =
  mongoose.models['MerchantInvitation'] != null
    ? (mongoose.models['MerchantInvitation'] as Model<IMerchantInvitationDocument>)
    : mongoose.model<IMerchantInvitationDocument>(
        'MerchantInvitation',
        MerchantInvitationSchema
      )
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="merchant-invitation.model.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/models/merchant-invitation.model.ts __tests__/integration/models/merchant-invitation.model.test.ts
git commit -m "feat: MerchantInvitation mongoose model"
```

---

### Task 4: MerchantApplication model

**Files:**
- Create: `src/lib/db/models/merchant-application.model.ts`
- Test: `__tests__/integration/models/merchant-application.model.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/models/merchant-application.model.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

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
  const { MerchantApplicationModel } = await import(
    '@/lib/db/models/merchant-application.model'
  )
  await MerchantApplicationModel.deleteMany({})
})

const userId = new mongoose.Types.ObjectId()
const invId = new mongoose.Types.ObjectId()

describe('MerchantApplicationModel', () => {
  it('creates a draft application with required fields', async () => {
    const { MerchantApplicationModel } = await import(
      '@/lib/db/models/merchant-application.model'
    )
    const app = await MerchantApplicationModel.create({
      userId,
      invitationId: invId,
      registeredCompanyName: 'Acme Pty Ltd',
      acn: '123456789',
      abn: '12345678901',
      registeredAddress: '1 Main St, Sydney NSW 2000',
      primaryContact: { name: 'Jane', email: 'jane@acme.com', phone: '0411000000' },
      financeContact: { name: 'Bob', position: 'CFO', email: 'bob@acme.com', phone: '0422000000' },
      brandNameEnglish: 'Acme',
      brandIntroductionEnglish: 'Leading retail brand.',
      mainCategories: ['fashion'],
      storesInAustralia: 5,
      storesToList: 3,
      paymentMethods: ['eftpos'],
      bankAccountName: 'Acme Pty Ltd',
      bankAccountNumber: 'ENC:encrypted_value',
      bankName: 'CBA',
      bankBsb: '062-000',
    })
    expect(app.status).toBe('draft')
    expect(app.isAuthorizedSignatory).toBe(true)
    expect(app.sameAsRegistered).toBe(false)
    expect(app.countryOfIncorporation).toBe('Australia')
  })

  it('rejects invalid status', async () => {
    const { MerchantApplicationModel } = await import(
      '@/lib/db/models/merchant-application.model'
    )
    await expect(
      MerchantApplicationModel.create({
        userId,
        invitationId: invId,
        status: 'unknown_status',
        registeredCompanyName: 'X',
        acn: '1',
        abn: '1',
        registeredAddress: 'X',
        primaryContact: { name: 'X', email: 'x@x.com', phone: '000' },
        financeContact: { name: 'X', position: 'X', email: 'x@x.com', phone: '000' },
        brandNameEnglish: 'X',
        brandIntroductionEnglish: 'X',
        mainCategories: ['x'],
        storesInAustralia: 1,
        storesToList: 1,
        paymentMethods: ['x'],
        bankAccountName: 'X',
        bankAccountNumber: 'X',
        bankName: 'X',
        bankBsb: 'X',
      })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="merchant-application.model.test"
```

- [ ] **Step 3: Implement MerchantApplication model**

```typescript
// src/lib/db/models/merchant-application.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'requires_info'

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
)

export interface IContact {
  name: string
  position?: string
  email?: string
  phone?: string
}

export interface IMerchantApplication {
  userId: Types.ObjectId
  invitationId: Types.ObjectId
  status: ApplicationStatus
  registeredCompanyName: string
  tradingName?: string
  acn: string
  abn: string
  registeredAddress: string
  postalAddress?: string
  sameAsRegistered: boolean
  countryOfIncorporation: string
  primaryContact: IContact
  isAuthorizedSignatory: boolean
  authorizedDirector?: IContact
  financeContact: IContact
  brandNameEnglish: string
  brandNameChinese?: string
  brandIntroductionEnglish: string
  website?: string
  socialMediaAccounts: string[]
  logoUploads: Map<string, string>
  mainCategories: string[]
  storesInAustralia: number
  storesToList: number
  otherCountries?: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBsb: string
  paymentMethods: string[]
  interestedInChinesePayments: boolean
  paymentPromotions?: string
  selectedPlatforms: string[]
  otherPlatforms?: string
  notifyForFuturePlatforms: boolean
  upfrontBenefits?: string
  customerCashback?: number
  promotionStartDate?: Date
  promotionEndDate?: Date
  ongoingPromotion: boolean
  affiliateMarketing: boolean
  exclusions?: string
  additionalServices: string[]
  agreementAccepted: boolean
  setupFeeAccepted: boolean
  applicantSignature?: string
  applicantName?: string
  applicantPosition?: string
  applicantDate?: string
  witnessSignature?: string
  witnessName?: string
  witnessDate?: string
  adminNotes?: string
  requiresInfoReason?: string
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IMerchantApplicationDocument extends IMerchantApplication, Document {}

const MerchantApplicationSchema = new Schema<IMerchantApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitationId: { type: Schema.Types.ObjectId, ref: 'MerchantInvitation', required: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_info'],
      default: 'draft',
    },
    registeredCompanyName: { type: String, required: true, trim: true },
    tradingName: { type: String, trim: true },
    acn: { type: String, required: true, trim: true },
    abn: { type: String, required: true, trim: true },
    registeredAddress: { type: String, required: true },
    postalAddress: String,
    sameAsRegistered: { type: Boolean, default: false },
    countryOfIncorporation: { type: String, default: 'Australia' },
    primaryContact: { type: ContactSchema, required: true },
    isAuthorizedSignatory: { type: Boolean, default: true },
    authorizedDirector: ContactSchema,
    financeContact: { type: ContactSchema, required: true },
    brandNameEnglish: { type: String, required: true, trim: true },
    brandNameChinese: { type: String, trim: true },
    brandIntroductionEnglish: { type: String, required: true },
    website: String,
    socialMediaAccounts: { type: [String], default: [] },
    logoUploads: { type: Map, of: String, default: {} },
    mainCategories: { type: [String], required: true },
    storesInAustralia: { type: Number, required: true, min: 1 },
    storesToList: { type: Number, required: true, min: 1 },
    otherCountries: String,
    bankAccountName: { type: String, required: true, trim: true },
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String, required: true, trim: true },
    bankBsb: { type: String, required: true, trim: true },
    paymentMethods: { type: [String], required: true },
    interestedInChinesePayments: { type: Boolean, default: false },
    paymentPromotions: String,
    selectedPlatforms: { type: [String], default: [] },
    otherPlatforms: String,
    notifyForFuturePlatforms: { type: Boolean, default: false },
    upfrontBenefits: String,
    customerCashback: { type: Number, min: 0 },
    promotionStartDate: Date,
    promotionEndDate: Date,
    ongoingPromotion: { type: Boolean, default: false },
    affiliateMarketing: { type: Boolean, default: false },
    exclusions: String,
    additionalServices: { type: [String], default: [] },
    agreementAccepted: { type: Boolean, default: false },
    setupFeeAccepted: { type: Boolean, default: false },
    applicantSignature: String,
    applicantName: String,
    applicantPosition: String,
    applicantDate: String,
    witnessSignature: String,
    witnessName: String,
    witnessDate: String,
    adminNotes: String,
    requiresInfoReason: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
)

MerchantApplicationSchema.index({ userId: 1 })
MerchantApplicationSchema.index({ invitationId: 1 })
MerchantApplicationSchema.index({ status: 1 })

export const MerchantApplicationModel: Model<IMerchantApplicationDocument> =
  mongoose.models['MerchantApplication'] != null
    ? (mongoose.models['MerchantApplication'] as Model<IMerchantApplicationDocument>)
    : mongoose.model<IMerchantApplicationDocument>(
        'MerchantApplication',
        MerchantApplicationSchema
      )
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:integration -- --testPathPatterns="merchant-application.model.test"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/models/merchant-application.model.ts __tests__/integration/models/merchant-application.model.test.ts
git commit -m "feat: MerchantApplication mongoose model with all fields"
```

---

### Task 5: Notification + MerchantDocument models

**Files:**
- Create: `src/lib/db/models/notification.model.ts`
- Create: `src/lib/db/models/merchant-document.model.ts`
- Test: `__tests__/integration/models/notification.model.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/integration/models/notification.model.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

const uid = new mongoose.Types.ObjectId()

describe('NotificationModel', () => {
  it('creates notification with isRead=false by default', async () => {
    const { NotificationModel } = await import('@/lib/db/models/notification.model')
    const n = await NotificationModel.create({
      userId: uid,
      type: 'status_change',
      title: '申请状态已更新',
      message: '您的申请已进入审核阶段',
    })
    expect(n.isRead).toBe(false)
    expect(n.type).toBe('status_change')
  })

  it('rejects invalid type', async () => {
    const { NotificationModel } = await import('@/lib/db/models/notification.model')
    await expect(
      NotificationModel.create({ userId: uid, type: 'unknown', title: 'x', message: 'y' })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:integration -- --testPathPatterns="notification.model.test"
```

- [ ] **Step 3: Implement Notification model**

```typescript
// src/lib/db/models/notification.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type NotificationType = 'status_change' | 'info_required' | 'approved' | 'general'

export interface INotification {
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['status_change', 'info_required', 'approved', 'general'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

NotificationSchema.index({ userId: 1, isRead: 1 })

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models['Notification'] != null
    ? (mongoose.models['Notification'] as Model<INotificationDocument>)
    : mongoose.model<INotificationDocument>('Notification', NotificationSchema)
```

- [ ] **Step 4: Implement MerchantDocument model**

```typescript
// src/lib/db/models/merchant-document.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IMerchantDocument {
  userId: Types.ObjectId
  applicationId: Types.ObjectId
  type: string
  fileName: string
  cloudinaryPublicId: string
  requestedBy?: Types.ObjectId
  uploadedAt: Date
}

export interface IMerchantDocumentDocument extends IMerchantDocument, Document {}

const MerchantDocumentSchema = new Schema<IMerchantDocumentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'MerchantApplication', required: true },
    type: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

MerchantDocumentSchema.index({ userId: 1 })
MerchantDocumentSchema.index({ applicationId: 1 })

export const MerchantDocumentModel: Model<IMerchantDocumentDocument> =
  mongoose.models['MerchantDocument'] != null
    ? (mongoose.models['MerchantDocument'] as Model<IMerchantDocumentDocument>)
    : mongoose.model<IMerchantDocumentDocument>('MerchantDocument', MerchantDocumentSchema)
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
pnpm test:integration -- --testPathPatterns="notification.model.test"
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/models/notification.model.ts src/lib/db/models/merchant-document.model.ts __tests__/integration/models/notification.model.test.ts
git commit -m "feat: Notification and MerchantDocument models"
```

---

### Task 6: Encryption utility (AES-256-GCM)

**Files:**
- Create: `src/lib/crypto/encrypt.ts`
- Test: `__tests__/unit/crypto/encrypt.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/unit/crypto/encrypt.test.ts

// Set test key before module import (32 bytes = 64 hex chars)
process.env.ENCRYPTION_KEY = 'a'.repeat(64)

import { encrypt, decrypt } from '@/lib/crypto/encrypt'

describe('encrypt / decrypt', () => {
  it('produces ciphertext different from plaintext', () => {
    const result = encrypt('123456789')
    expect(result).not.toBe('123456789')
    expect(result).toContain(':')
  })

  it('round-trips a bank account number', () => {
    const original = '987654321'
    expect(decrypt(encrypt(original))).toBe(original)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const a = encrypt('same')
    const b = encrypt('same')
    expect(a).not.toBe(b)
  })

  it('throws when ciphertext is tampered', () => {
    const ct = encrypt('secret')
    const tampered = ct.slice(0, -4) + 'XXXX'
    expect(() => decrypt(tampered)).toThrow()
  })

  it('throws when ciphertext format is invalid', () => {
    expect(() => decrypt('no-colons-here')).toThrow('Invalid ciphertext format')
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
pnpm test:unit -- --testPathPatterns="encrypt.test"
```

- [ ] **Step 3: Implement encrypt utility**

```typescript
// src/lib/crypto/encrypt.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? ''
  if (!hex) throw new Error('ENCRYPTION_KEY environment variable is not set')
  const key = Buffer.from(hex, 'hex')
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')
  const [ivHex, tagHex, dataHex] = parts as [string, string, string]
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
pnpm test:unit -- --testPathPatterns="encrypt.test"
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/crypto/encrypt.ts __tests__/unit/crypto/encrypt.test.ts
git commit -m "feat: AES-256-GCM encrypt/decrypt utility for bank account numbers"
```

---

### Task 7: Phase gate

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass, 0 failures

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: 0 errors

- [ ] **Step 4: Update docs/INDEX.md**

Mark Phase 1-01 as ✅ Complete. Set Active Plan to `phase1-02-auth-validation.md`.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 1-01 — data layer with all models and encryption"
```

---

**Phase 1-01 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-02-auth-validation.md`**
