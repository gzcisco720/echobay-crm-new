import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { BrandModel } from '@/lib/db/models/brand.model'
import { updateApplicationStatus } from '@/lib/actions/admin.actions'
import { getBrandByApplicationId, getBrandsForAdmin, updateBrand } from '@/lib/actions/brand.actions'

jest.mock('@/lib/mail/mailgun', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  buildPasswordResetEmail: jest.fn().mockReturnValue('<html>reset</html>'),
}))

let mongod: MongoMemoryServer

async function seed() {
  const hash = await bcrypt.hash('Password1!', 10)
  const adminUser = await UserModel.create({
    email: 'admin@echobay.com', password: hash, name: 'Admin', role: 'admin', isActive: true,
  })
  const merchantUser = await UserModel.create({
    email: 'merchant@example.com', password: hash, name: 'Merchant', role: 'merchant', isActive: true,
  })
  const invitation = await MerchantInvitationModel.create({
    email: 'merchant@example.com',
    token: 'invite-token-123',
    expiresAt: new Date(Date.now() + 86400_000),
    status: 'used',
    invitedBy: adminUser._id,
  })
  const app = await MerchantApplicationModel.create({
    userId: merchantUser._id,
    invitationId: invitation._id,
    status: 'submitted',
    registeredCompanyName: 'Test Co Pty Ltd',
    tradingName: 'Test Brand',
    acn: '123456789',
    abn: '12345678901',
    registeredAddress: '1 Test St, Sydney NSW 2000',
    countryOfIncorporation: 'Australia',
    primaryContact: { name: 'John Doe', email: 'john@test.com', phone: '0400000000', position: 'CEO' },
    financeContact: { name: 'Jane Doe', email: 'jane@test.com', position: 'CFO' },
    brandNameEnglish: 'TestBrand',
    brandIntroductionEnglish: 'A great brand.',
    mainCategories: ['Fashion & Apparel'],
    storesInAustralia: 2,
    storesToList: 1,
    paymentMethods: ['Alipay'],
    bankAccountName: 'Test Co',
    bankAccountNumber: 'enc:123',
    bankName: 'ANZ',
    bankBsb: '012-345',
    isAuthorizedSignatory: true,
    agreementAccepted: true,
    setupFeeAccepted: true,
  })
  return { adminUser, merchantUser, app }
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  global.mongooseCache = { conn: null, promise: null }
  await connectDB()
})

afterAll(async () => {
  global.mongooseCache = { conn: null, promise: null }
  try { await mongoose.disconnect() } catch { /* already disconnected */ }
  await mongod.stop()
})

beforeEach(async () => {
  await UserModel.deleteMany({})
  await MerchantApplicationModel.deleteMany({})
  await MerchantInvitationModel.deleteMany({})
  await BrandModel.deleteMany({})
})

describe('Brand auto-creation on approval', () => {
  it('creates a Brand when application is approved', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    const brand = await BrandModel.findOne({ merchantApplicationId: app._id }).lean()
    expect(brand).not.toBeNull()
    expect(brand!.brandNameEnglish).toBe('TestBrand')
    expect(brand!.registeredCompanyName).toBe('Test Co Pty Ltd')
    expect(brand!.status).toBe('active')
  })

  it('does not create duplicate Brand on re-approval', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    await MerchantApplicationModel.findByIdAndUpdate(app._id, { status: 'under_review' })
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    const count = await BrandModel.countDocuments({ merchantApplicationId: app._id })
    expect(count).toBe(1)
  })

  it('does NOT create a Brand for rejected status', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'rejected', undefined, adminUser._id.toString())
    const count = await BrandModel.countDocuments({})
    expect(count).toBe(0)
  })
})

describe('getBrandByApplicationId', () => {
  it('returns the brand for a given application', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    const result = await getBrandByApplicationId(app._id.toString())
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.brandNameEnglish).toBe('TestBrand')
  })

  it('returns error if no brand found', async () => {
    const result = await getBrandByApplicationId(new Types.ObjectId().toString())
    expect(result.success).toBe(false)
  })
})

describe('getBrandsForAdmin', () => {
  it('returns list of brands', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    const result = await getBrandsForAdmin()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBeGreaterThanOrEqual(1)
  })
})

describe('updateBrand', () => {
  it('updates brand status', async () => {
    const { adminUser, app } = await seed()
    await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminUser._id.toString())
    const brand = await BrandModel.findOne({ merchantApplicationId: app._id }).lean()
    const result = await updateBrand(brand!._id.toString(), { status: 'suspended' })
    expect(result.success).toBe(true)
    const updated = await BrandModel.findById(brand!._id).lean()
    expect(updated!.status).toBe('suspended')
  })
})
