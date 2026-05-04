# Sub-project B: Document Upload — Implementation Plan

> **For agentic workers:** Use superpowers:test-driven-development for each implementation task. Steps use checkbox syntax for tracking.

**Goal:** Merchants can upload supplementary files from their portal; Admin can view and request files from the application detail page.

**Architecture:** Extend existing Cloudinary upload route to accept documents (PDF/Office/images up to 20MB); add 4 Server Actions for document CRUD; build merchant upload UI and admin request form as Client Components embedded in existing Server Component pages.

**Tech Stack:** Next.js 16 Server Actions, Cloudinary (resource_type: 'raw' for documents), MongoDB/Mongoose, React Client Components, Jest integration tests, Playwright E2E.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/db/models/merchant-document.model.ts` | Modify | Make cloudinaryPublicId + url optional |
| `src/app/api/upload/route.ts` | Modify | Add PDF/Office MIME types, raise limit to 20MB |
| `src/lib/actions/document.actions.ts` | Create | 4 Server Actions |
| `src/components/shared/document-list-item.tsx` | Create | Shared presentational row |
| `src/components/merchant/document-uploader-client.tsx` | Create | File picker Client Component |
| `src/components/merchant/pending-request-card.tsx` | Create | Per-request upload card |
| `src/components/admin/admin-document-request-form.tsx` | Create | Admin request form |
| `src/app/(merchant)/merchant/documents/page.tsx` | Modify | Replace placeholder with full UI |
| `src/app/(admin)/admin/applications/[id]/page.tsx` | Modify | Add documents card |
| `__tests__/integration/actions/document.actions.test.ts` | Create | Integration tests |
| `e2e/merchant-documents.spec.ts` | Create | E2E tests |

---

## Task 1: Update merchant-document model

**Files:**
- Modify: `src/lib/db/models/merchant-document.model.ts`
- Test: `__tests__/integration/actions/document.actions.test.ts`

- [ ] **Step 1.1: Write failing test**

Create `__tests__/integration/actions/document.actions.test.ts`:

```typescript
process.env.ENCRYPTION_KEY = 'a'.repeat(64)

import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'

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
  await MerchantDocumentModel.deleteMany({})
  // Note: add UserModel.deleteMany + MerchantApplicationModel.deleteMany after Task 3
})

describe('MerchantDocumentModel — pending request', () => {
  it('can create a document record without cloudinaryPublicId', async () => {
    const userId = new Types.ObjectId()
    const applicationId = new Types.ObjectId()
    const adminId = new Types.ObjectId()

    const doc = await MerchantDocumentModel.create({
      userId,
      applicationId,
      type: 'ASIC Certificate',
      fileName: '',
      requestedBy: adminId,
    })

    expect(doc._id).toBeDefined()
    expect(doc.cloudinaryPublicId).toBeUndefined()
    expect(doc.url).toBeUndefined()
    expect(doc.requestedBy?.toString()).toBe(adminId.toString())
  })
})
```

- [ ] **Step 1.2: Run test to confirm it fails**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -20
```

Expected: FAIL — cloudinaryPublicId validation error (currently required)

- [ ] **Step 1.3: Update the model**

Replace `src/lib/db/models/merchant-document.model.ts`:

```typescript
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IMerchantDocument {
  userId: Types.ObjectId
  applicationId: Types.ObjectId
  type: string
  fileName: string
  cloudinaryPublicId?: string
  url?: string
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
    cloudinaryPublicId: { type: String, required: false },
    url: { type: String, required: false },
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

- [ ] **Step 1.4: Run test to confirm it passes**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -15
```

Expected: PASS

---

## Task 2: Extend upload route for documents

**Files:**
- Modify: `src/app/api/upload/route.ts`

- [ ] **Step 2.1: Write failing test (append to document.actions.test.ts)**

Add new describe block to the test file:

```typescript
import { validateUploadFile } from '@/app/api/upload/route'

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'test-file', { type })
}

describe('validateUploadFile', () => {
  it('accepts image/jpeg', () => {
    expect(validateUploadFile(makeFile('image/jpeg', 100))).toBeNull()
  })

  it('accepts application/pdf', () => {
    expect(validateUploadFile(makeFile('application/pdf', 100))).toBeNull()
  })

  it('accepts docx', () => {
    expect(validateUploadFile(makeFile(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 100
    ))).toBeNull()
  })

  it('accepts xlsx', () => {
    expect(validateUploadFile(makeFile(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 100
    ))).toBeNull()
  })

  it('rejects text/plain', () => {
    expect(validateUploadFile(makeFile('text/plain', 100))).toBe('Unsupported file type')
  })

  it('rejects files over 20 MB', () => {
    const over20mb = 20 * 1024 * 1024 + 1
    expect(validateUploadFile(makeFile('application/pdf', over20mb))).toBe(
      'File size must be under 20 MB'
    )
  })

  it('accepts file exactly at 20 MB', () => {
    expect(validateUploadFile(makeFile('application/pdf', 20 * 1024 * 1024))).toBeNull()
  })
})
```

- [ ] **Step 2.2: Run test to confirm it fails**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -20
```

Expected: FAIL — validateUploadFile not exported

- [ ] **Step 2.3: Update upload route**

Replace `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_SIZE = 20 * 1024 * 1024

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return 'Unsupported file type'
  if (file.size > MAX_SIZE) return 'File size must be under 20 MB'
  return null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) ?? 'echobay-crm'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const validationError = validateUploadFile(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`
  const resourceType = IMAGE_TYPES.has(file.type) ? 'image' : 'raw'

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  })

  return NextResponse.json({ publicId: result.public_id, url: result.secure_url })
}
```

- [ ] **Step 2.4: Run tests to confirm they pass**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -15
```

Expected: all PASS

---

## Task 3: Implement document.actions.ts (TDD)

**Files:**
- Create: `src/lib/actions/document.actions.ts`

- [ ] **Step 3.1: Write failing tests (append to document.actions.test.ts)**

Update afterEach to include all model cleanups:
```typescript
afterEach(async () => {
  await MerchantDocumentModel.deleteMany({})
  await UserModel.deleteMany({})
  await MerchantApplicationModel.deleteMany({})
})
```

Add these imports at the top of the test file:
```typescript
import bcrypt from 'bcryptjs'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import {
  requestDocumentAction,
  uploadDocumentAction,
  getApplicationDocumentsAction,
  cancelDocumentRequestAction,
} from '@/lib/actions/document.actions'
```

Add seed helper function after the existing imports:
```typescript
async function seedMerchantAndApp() {
  const hash = await bcrypt.hash('P@ssword1', 10)
  const merchant = await UserModel.create({
    email: 'merchant@test.com', password: hash, name: 'Test Merchant',
    role: 'merchant', isActive: true,
  })
  const admin = await UserModel.create({
    email: 'admin@test.com', password: hash, name: 'Test Admin',
    role: 'admin', isActive: true,
  })
  const app = await MerchantApplicationModel.create({
    userId: merchant._id,
    status: 'submitted',
    registeredCompanyName: 'Test Co',
    tradingName: 'TestCo',
    acn: '123456789',
    abn: '12345678901',
    registeredAddress: '1 Test St',
    sameAsRegistered: true,
    countryOfIncorporation: 'Australia',
    primaryContact: { name: 'Jane', position: 'CEO', email: 'jane@test.com', phone: '0400000000' },
    isAuthorizedSignatory: true,
    financeContact: { name: 'Bob', position: 'CFO', email: 'bob@test.com', phone: '0411000000' },
    brandNameEnglish: 'TestBrand',
    brandIntroductionEnglish: 'A great brand.',
    mainCategories: ['Fashion & Apparel'],
    storesInAustralia: 1,
    storesToList: 1,
    paymentMethods: ['Alipay'],
    selectedPlatforms: [],
    additionalServices: [],
    agreementAccepted: true,
    setupFeeAccepted: true,
    applicantName: 'Jane',
    applicantPosition: 'CEO',
    applicantDate: '2025-01-01',
  })
  return { merchant, admin, app }
}
```

Add test describe blocks:
```typescript
describe('requestDocumentAction', () => {
  it('creates a pending document request', async () => {
    const { admin, app } = await seedMerchantAndApp()
    const result = await requestDocumentAction(
      app._id.toString(), '请提供 ASIC 证书', admin._id.toString()
    )
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.type).toBe('请提供 ASIC 证书')
    expect(result.data.cloudinaryPublicId).toBeUndefined()
    expect(result.data.requestedBy?.toString()).toBe(admin._id.toString())
  })

  it('returns error for non-existent application', async () => {
    const result = await requestDocumentAction(
      new Types.ObjectId().toString(), 'ASIC', new Types.ObjectId().toString()
    )
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toMatch(/申请不存在/)
  })
})

describe('uploadDocumentAction — new upload', () => {
  it('creates a new document record', async () => {
    const { merchant, app } = await seedMerchantAndApp()
    const result = await uploadDocumentAction({
      applicationId: app._id.toString(),
      userId: merchant._id.toString(),
      type: '营业执照',
      fileName: 'license.pdf',
      cloudinaryPublicId: 'echobay-crm/abc123',
      url: 'https://res.cloudinary.com/test/raw/upload/abc123',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.fileName).toBe('license.pdf')
    expect(result.data.cloudinaryPublicId).toBe('echobay-crm/abc123')
  })
})

describe('uploadDocumentAction — fulfill request', () => {
  it('updates an existing pending request with file data', async () => {
    const { admin, merchant, app } = await seedMerchantAndApp()
    const pending = await MerchantDocumentModel.create({
      userId: merchant._id,
      applicationId: app._id,
      type: '银行对账单',
      fileName: '',
      requestedBy: admin._id,
    })
    const result = await uploadDocumentAction({
      applicationId: app._id.toString(),
      userId: merchant._id.toString(),
      type: '银行对账单',
      fileName: 'statement.pdf',
      cloudinaryPublicId: 'echobay-crm/xyz456',
      url: 'https://res.cloudinary.com/test/raw/upload/xyz456',
      requestId: pending._id.toString(),
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.fileName).toBe('statement.pdf')
    expect(result.data.cloudinaryPublicId).toBe('echobay-crm/xyz456')
  })
})

describe('getApplicationDocumentsAction', () => {
  it('returns all documents for an application', async () => {
    const { merchant, app } = await seedMerchantAndApp()
    await MerchantDocumentModel.create([
      { userId: merchant._id, applicationId: app._id, type: 'Doc A', fileName: 'a.pdf',
        cloudinaryPublicId: 'cid_a', url: 'https://example.com/a' },
      { userId: merchant._id, applicationId: app._id, type: 'Doc B', fileName: 'b.pdf',
        cloudinaryPublicId: 'cid_b', url: 'https://example.com/b' },
    ])
    const result = await getApplicationDocumentsAction(app._id.toString())
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(2)
  })

  it('returns empty array when no documents exist', async () => {
    const { app } = await seedMerchantAndApp()
    const result = await getApplicationDocumentsAction(app._id.toString())
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(0)
  })
})

describe('cancelDocumentRequestAction', () => {
  it('deletes a pending request', async () => {
    const { admin, merchant, app } = await seedMerchantAndApp()
    const pending = await MerchantDocumentModel.create({
      userId: merchant._id,
      applicationId: app._id,
      type: '待删除',
      fileName: '',
      requestedBy: admin._id,
    })
    const result = await cancelDocumentRequestAction(
      pending._id.toString(), admin._id.toString()
    )
    expect(result.success).toBe(true)
    const stillExists = await MerchantDocumentModel.findById(pending._id)
    expect(stillExists).toBeNull()
  })

  it('returns error for non-existent request', async () => {
    const result = await cancelDocumentRequestAction(
      new Types.ObjectId().toString(), new Types.ObjectId().toString()
    )
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 3.2: Run test to confirm it fails**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -20
```

Expected: FAIL — document.actions module not found

- [ ] **Step 3.3: Create src/lib/actions/document.actions.ts**

```typescript
'use server'

import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'
import type { ActionResult } from '@/types/action'

export async function requestDocumentAction(
  applicationId: string,
  type: string,
  adminUserId: string
): Promise<ActionResult<IMerchantDocument>> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId).lean().exec()
    if (!app) return { success: false, error: '申请不存在' }
    const doc = await MerchantDocumentModel.create({
      userId: app.userId,
      applicationId,
      type,
      fileName: '',
      requestedBy: adminUserId,
    })
    return { success: true, data: doc.toObject() as IMerchantDocument }
  } catch {
    return { success: false, error: '请求文件失败' }
  }
}

interface UploadDocumentPayload {
  applicationId: string
  userId: string
  type: string
  fileName: string
  cloudinaryPublicId: string
  url: string
  requestId?: string
}

export async function uploadDocumentAction(
  payload: UploadDocumentPayload
): Promise<ActionResult<IMerchantDocument>> {
  try {
    await connectDB()
    const { applicationId, userId, type, fileName, cloudinaryPublicId, url, requestId } = payload

    if (requestId) {
      const doc = await MerchantDocumentModel.findByIdAndUpdate(
        requestId,
        { $set: { fileName, cloudinaryPublicId, url, uploadedAt: new Date() } },
        { returnDocument: 'after' }
      ).lean().exec()
      if (!doc) return { success: false, error: '请求记录不存在' }
      return { success: true, data: doc as IMerchantDocument }
    }

    const app = await MerchantApplicationModel.findById(applicationId).lean().exec()
    if (!app) return { success: false, error: '申请不存在' }
    const doc = await MerchantDocumentModel.create({
      userId, applicationId, type, fileName, cloudinaryPublicId, url,
    })
    return { success: true, data: doc.toObject() as IMerchantDocument }
  } catch {
    return { success: false, error: '上传文件失败' }
  }
}

export async function getApplicationDocumentsAction(
  applicationId: string
): Promise<ActionResult<IMerchantDocument[]>> {
  try {
    await connectDB()
    const docs = await MerchantDocumentModel.find({ applicationId })
      .sort({ uploadedAt: -1 })
      .lean()
      .exec()
    return { success: true, data: docs as IMerchantDocument[] }
  } catch {
    return { success: false, error: '获取文件列表失败' }
  }
}

export async function cancelDocumentRequestAction(
  requestId: string,
  _adminUserId: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const doc = await MerchantDocumentModel.findByIdAndDelete(requestId).lean().exec()
    if (!doc) return { success: false, error: '记录不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '取消请求失败' }
  }
}
```

- [ ] **Step 3.4: Run all tests to confirm they pass**

```bash
pnpm test --testPathPattern="document.actions" 2>&1 | tail -25
```

Expected: all describe blocks PASS

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/db/models/merchant-document.model.ts \
        src/app/api/upload/route.ts \
        src/lib/actions/document.actions.ts \
        __tests__/integration/actions/document.actions.test.ts
git commit -m "feat: document model + upload route + document actions (TDD)"
```

---

## Task 4: DocumentListItem shared component

**Files:**
- Create: `src/components/shared/document-list-item.tsx`

- [ ] **Step 4.1: Create the component**

```typescript
import React from 'react'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'

interface DocumentListItemProps {
  doc: IMerchantDocument & { _id: { toString(): string } }
  onCancel?: (requestId: string) => void
}

export function DocumentListItem({ doc, onCancel }: DocumentListItemProps): React.JSX.Element {
  const isPending = !doc.cloudinaryPublicId

  return (
    <div className="flex items-center justify-between text-sm p-3 bg-white rounded-lg border border-zinc-100">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{isPending ? doc.type : doc.fileName}</span>
        <span className="text-zinc-400 text-xs">{doc.type}</span>
        {!isPending && (
          <span className="text-zinc-300 text-xs">
            {new Date(doc.uploadedAt).toLocaleDateString('zh-CN')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {isPending ? (
          <>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              等待上传
            </span>
            {onCancel != null && (
              <button
                onClick={() => onCancel(doc._id.toString())}
                className="text-zinc-400 hover:text-red-500 transition-colors text-xs"
                aria-label="取消请求"
              >
                ✕
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
              {doc.requestedBy != null ? 'Admin 请求' : '主动上传'}
            </span>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0BB5C4] hover:underline text-xs"
            >
              查看
            </a>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Run lint**

```bash
pnpm lint 2>&1 | tail -10
```

Expected: 0 errors

---

## Task 5: DocumentUploaderClient component

**Files:**
- Create: `src/components/merchant/document-uploader-client.tsx`

- [ ] **Step 5.1: Create the component**

```typescript
'use client'

import React, { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadDocumentAction } from '@/lib/actions/document.actions'

interface DocumentUploaderClientProps {
  applicationId: string
  userId: string
  requestId?: string
  defaultType?: string
  onSuccess?: () => void
}

export function DocumentUploaderClient({
  applicationId,
  userId,
  requestId,
  defaultType = '',
  onSuccess,
}: DocumentUploaderClientProps): React.JSX.Element {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState(defaultType)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('请选择文件'); return }
    if (!type.trim()) { setError('请填写文件类别'); return }
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'echobay-crm/documents')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json() as { publicId?: string; url?: string; error?: string }

    if (!res.ok || !json.url || !json.publicId) {
      setError(json.error ?? '上传失败，请重试')
      return
    }

    startTransition(async () => {
      const result = await uploadDocumentAction({
        applicationId,
        userId,
        type: type.trim(),
        fileName: file.name,
        cloudinaryPublicId: json.publicId!,
        url: json.url!,
        requestId,
      })
      if (result.success) {
        if (fileRef.current) fileRef.current.value = ''
        setType(defaultType)
        router.refresh()
        onSuccess?.()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {requestId == null && (
        <div>
          <Label htmlFor={`doc-type-${requestId ?? 'new'}`} className="text-xs text-zinc-500 mb-1 block">
            文件类别
          </Label>
          <Input
            id={`doc-type-${requestId ?? 'new'}`}
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="例如：营业执照、银行对账单"
            className="h-8 text-sm"
          />
        </div>
      )}
      <div>
        <Label htmlFor={`doc-file-${requestId ?? 'new'}`} className="text-xs text-zinc-500 mb-1 block">
          选择文件（PDF / Word / Excel / 图片，最大 20 MB）
        </Label>
        <input
          id={`doc-file-${requestId ?? 'new'}`}
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
          className="text-sm text-zinc-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
        />
      </div>
      {error != null && <p className="text-red-500 text-xs">{error}</p>}
      <Button onClick={handleUpload} disabled={isPending} size="sm" className="w-fit">
        {isPending ? '上传中…' : '上传文件'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 5.2: Run lint**

```bash
pnpm lint 2>&1 | tail -10
```

---

## Task 6: PendingRequestCard component

**Files:**
- Create: `src/components/merchant/pending-request-card.tsx`

- [ ] **Step 6.1: Create the component**

```typescript
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUploaderClient } from './document-uploader-client'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'

interface PendingRequestCardProps {
  request: IMerchantDocument & { _id: { toString(): string } }
  applicationId: string
  userId: string
}

export function PendingRequestCard({
  request,
  applicationId,
  userId,
}: PendingRequestCardProps): React.JSX.Element {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-amber-800">{request.type}</CardTitle>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#0BB5C4] hover:underline"
          >
            {expanded ? '收起' : '上传文件'}
          </button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <DocumentUploaderClient
            applicationId={applicationId}
            userId={userId}
            requestId={request._id.toString()}
            defaultType={request.type}
            onSuccess={() => { setExpanded(false); router.refresh() }}
          />
        </CardContent>
      )}
    </Card>
  )
}
```

---

## Task 7: AdminDocumentRequestForm component

**Files:**
- Create: `src/components/admin/admin-document-request-form.tsx`

- [ ] **Step 7.1: Create the component**

```typescript
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestDocumentAction } from '@/lib/actions/document.actions'

interface AdminDocumentRequestFormProps {
  applicationId: string
  adminUserId: string
}

export function AdminDocumentRequestForm({
  applicationId,
  adminUserId,
}: AdminDocumentRequestFormProps): React.JSX.Element {
  const router = useRouter()
  const [type, setType] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!type.trim()) { setError('请填写所需文件说明'); return }
    setError(null)
    startTransition(async () => {
      const result = await requestDocumentAction(applicationId, type.trim(), adminUserId)
      if (result.success) {
        setType('')
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="例如：请提供最近 3 个月银行对账单"
          className="h-8 text-sm flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />
        <Button onClick={handleSubmit} disabled={isPending} size="sm">
          {isPending ? '发送中…' : '发送请求'}
        </Button>
      </div>
      {error != null && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
```

---

## Task 8: Update merchant documents page

**Files:**
- Modify: `src/app/(merchant)/merchant/documents/page.tsx`

- [ ] **Step 8.1: Replace the page**

```typescript
import React from 'react'
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentListItem } from '@/components/shared/document-list-item'
import { PendingRequestCard } from '@/components/merchant/pending-request-card'
import { DocumentUploaderClient } from '@/components/merchant/document-uploader-client'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'

export default async function DocumentsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  await connectDB()

  const app = await MerchantApplicationModel.findOne({ userId: session!.user.id })
    .select('_id status')
    .lean()
    .exec()

  if (!app) {
    return (
      <div className="w-full">
        <p className="text-zinc-500">请先提交申请。</p>
      </div>
    )
  }

  const rawDocs = await MerchantDocumentModel.find({ applicationId: app._id })
    .sort({ uploadedAt: -1 })
    .lean()
    .exec()

  const docs = rawDocs as (IMerchantDocument & { _id: { toString(): string } })[]
  const pendingRequests = docs.filter((d) => !d.cloudinaryPublicId)
  const uploadedDocs = docs.filter((d) => !!d.cloudinaryPublicId)

  return (
    <div className="w-full flex flex-col gap-5">
      {pendingRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700">待补充材料</h2>
          {pendingRequests.map((req) => (
            <PendingRequestCard
              key={req._id.toString()}
              request={req}
              applicationId={app._id.toString()}
              userId={session!.user.id}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">主动上传文件</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploaderClient
            applicationId={app._id.toString()}
            userId={session!.user.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">已上传文件</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedDocs.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无已上传文件。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {uploadedDocs.map((doc) => (
                <DocumentListItem key={doc._id.toString()} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 8.2: Run lint + build**

```bash
pnpm lint 2>&1 | tail -10 && pnpm build 2>&1 | tail -20
```

Expected: 0 errors, successful build

---

## Task 9: Update admin application detail page

**Files:**
- Modify: `src/app/(admin)/admin/applications/[id]/page.tsx`

- [ ] **Step 9.1: Add imports**

Add after the existing imports at the top of the file:

```typescript
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { DocumentListItem } from '@/components/shared/document-list-item'
import { AdminDocumentRequestForm } from '@/components/admin/admin-document-request-form'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'
```

- [ ] **Step 9.2: Add documents query**

In `AdminApplicationDetailPage`, after the line `const merchant = await UserModel.findById...`, add:

```typescript
const rawDocs = await MerchantDocumentModel.find({ applicationId: id })
  .sort({ uploadedAt: -1 })
  .lean()
  .exec()
const docs = rawDocs as (IMerchantDocument & { _id: { toString(): string } })[]
```

- [ ] **Step 9.3: Add documents card**

In the right column (after the "内部备注" Card closing tag), add:

```typescript
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-semibold text-slate-800">补充文件</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <AdminDocumentRequestForm
      applicationId={app._id.toString()}
      adminUserId={session!.user.id}
    />
    <div className="flex flex-col gap-2">
      {docs.length === 0 ? (
        <p className="text-zinc-400 text-xs">暂无文件记录。</p>
      ) : (
        docs.map((doc) => (
          <DocumentListItem key={doc._id.toString()} doc={doc} />
        ))
      )}
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 9.4: Run lint + build**

```bash
pnpm lint 2>&1 | tail -10 && pnpm build 2>&1 | tail -20
```

Expected: 0 errors, successful build

- [ ] **Step 9.5: Commit**

```bash
git add src/components/shared/document-list-item.tsx \
        src/components/merchant/document-uploader-client.tsx \
        src/components/merchant/pending-request-card.tsx \
        src/components/admin/admin-document-request-form.tsx \
        "src/app/(merchant)/merchant/documents/page.tsx" \
        "src/app/(admin)/admin/applications/[id]/page.tsx"
git commit -m "feat: document upload UI — merchant + admin pages"
```

---

## Task 10: E2E tests

**Files:**
- Create: `e2e/merchant-documents.spec.ts`
- Create: `e2e/fixtures/sample.pdf`

- [ ] **Step 10.1: Create sample PDF fixture**

```bash
mkdir -p e2e/fixtures
printf '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%%%EOF' \
  > e2e/fixtures/sample.pdf
```

- [ ] **Step 10.2: Create E2E test file**

Create `e2e/merchant-documents.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import path from 'path'

const SAMPLE_PDF = path.join(__dirname, 'fixtures/sample.pdf')

test.describe('Merchant — Documents page', () => {
  test.use({ storageState: '.auth/merchant.json' })

  test('documents page loads with upload form and file list', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('主动上传文件')).toBeVisible()
    await expect(page.getByText('已上传文件')).toBeVisible()
  })

  test('shows empty state when no uploads', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('暂无已上传文件。')).toBeVisible()
  })

  test('shows validation error when clicking upload without selecting file', async ({ page }) => {
    await page.goto('/merchant/documents')
    await page.fill('input[placeholder*="营业执照"]', '测试文件类别')
    await page.getByRole('button', { name: '上传文件' }).click()
    await expect(page.getByText('请选择文件')).toBeVisible()
  })

  test('shows validation error when clicking upload without entering type', async ({ page }) => {
    await page.goto('/merchant/documents')
    await page.setInputFiles('input[type="file"]', SAMPLE_PDF)
    await page.getByRole('button', { name: '上传文件' }).click()
    await expect(page.getByText('请填写文件类别')).toBeVisible()
  })
})

test.describe('Admin — Documents card on application detail', () => {
  test.use({ storageState: '.auth/admin.json' })

  test('documents card is visible on application detail page', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Approved Brand Pty Ltd').click()
    await expect(page.getByText('补充文件')).toBeVisible()
    await expect(page.getByRole('button', { name: '发送请求' })).toBeVisible()
  })

  test('shows validation error when sending empty document request', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Approved Brand Pty Ltd').click()
    await page.getByRole('button', { name: '发送请求' }).click()
    await expect(page.getByText('请填写所需文件说明')).toBeVisible()
  })
})
```

- [ ] **Step 10.3: Run E2E tests**

```bash
pnpm seed:e2e && pnpm test:e2e --grep "Documents" 2>&1 | tail -30
```

- [ ] **Step 10.4: Final quality gates**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: all three exit 0

- [ ] **Step 10.5: Update planning files and final commit**

Update `task_plan.md`: mark Sub-project B complete, set Current Phase to Sub-project C.

Update `progress.md` with session summary.

```bash
git add e2e/merchant-documents.spec.ts e2e/fixtures/sample.pdf task_plan.md progress.md
git commit -m "feat: Sub-project B complete — merchant document upload"
```
