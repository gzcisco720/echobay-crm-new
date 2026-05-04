process.env.ENCRYPTION_KEY = 'a'.repeat(64)

import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import bcrypt from 'bcryptjs'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { validateUploadFile } from '@/lib/upload/validate'
import {
  requestDocumentAction,
  uploadDocumentAction,
  getApplicationDocumentsAction,
  cancelDocumentRequestAction,
} from '@/lib/actions/document.actions'

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
  await MerchantDocumentModel.deleteMany({})
  await UserModel.deleteMany({})
  await MerchantApplicationModel.deleteMany({})
})

// ─── Task 1: Model ────────────────────────────────────────────────────────────

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

// ─── Task 2: Upload route validation ─────────────────────────────────────────

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

// ─── Task 3: document.actions ────────────────────────────────────────────────

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
    invitationId: new Types.ObjectId(),
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
    bankAccountName: 'Test Co Pty Ltd',
    bankAccountNumber: 'encrypted_placeholder',
    bankName: 'CBA',
    bankBsb: '062-000',
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
