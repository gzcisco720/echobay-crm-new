process.env.ENCRYPTION_KEY = 'a'.repeat(64)

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

describe('resubmitApplication', () => {
  it('changes requires_info application back to submitted', async () => {
    const inv = await createInvitation('resubmit@test.com', 'tok-resub')
    await createInvitation()
    // Create user and application manually
    const user = await UserModel.create({
      email: 'resubmit@test.com',
      password: 'hashed',
      role: 'merchant',
      name: 'Resub User',
    })
    const app = await MerchantApplicationModel.create({
      userId: user._id,
      invitationId: inv._id,
      status: 'requires_info',
      requiresInfoReason: '请补充营业执照',
      registeredCompanyName: 'Resub Co',
      acn: '111111111',
      abn: '11111111111',
      registeredAddress: '1 Test St',
      primaryContact: { name: 'A', email: 'a@test.com', phone: '000' },
      financeContact: { name: 'B', position: 'CFO', email: 'b@test.com', phone: '000' },
      brandNameEnglish: 'Resub',
      brandIntroductionEnglish: 'A resubmission test brand.',
      mainCategories: ['fashion'],
      storesInAustralia: 1,
      storesToList: 1,
      paymentMethods: ['eftpos'],
      bankAccountName: 'Resub',
      bankAccountNumber: 'ENC:x',
      bankName: 'ANZ',
      bankBsb: '012-345',
    })

    const { resubmitApplication } = await import('@/lib/actions/application.actions')
    const result = await resubmitApplication(app._id.toString())
    expect(result.success).toBe(true)

    const updated = await MerchantApplicationModel.findById(app._id)
    expect(updated?.status).toBe('submitted')
    expect(updated?.requiresInfoReason).toBeUndefined()
  })

  it('returns error when application is not in requires_info status', async () => {
    const inv = await createInvitation('draft@test.com', 'tok-draft')
    const user = await UserModel.create({
      email: 'draft@test.com',
      password: 'hashed',
      role: 'merchant',
      name: 'Draft User',
    })
    const app = await MerchantApplicationModel.create({
      userId: user._id,
      invitationId: inv._id,
      status: 'submitted',
      registeredCompanyName: 'Draft Co',
      acn: '222222222',
      abn: '22222222222',
      registeredAddress: '2 Test St',
      primaryContact: { name: 'C', email: 'c@test.com', phone: '001' },
      financeContact: { name: 'D', position: 'CFO', email: 'd@test.com', phone: '001' },
      brandNameEnglish: 'Draft',
      brandIntroductionEnglish: 'A draft status test brand.',
      mainCategories: ['fashion'],
      storesInAustralia: 1,
      storesToList: 1,
      paymentMethods: ['eftpos'],
      bankAccountName: 'Draft',
      bankAccountNumber: 'ENC:x',
      bankName: 'ANZ',
      bankBsb: '012-345',
    })

    const { resubmitApplication } = await import('@/lib/actions/application.actions')
    const result = await resubmitApplication(app._id.toString())
    expect(result.success).toBe(false)
  })
})
