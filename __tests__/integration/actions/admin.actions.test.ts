import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { NotificationModel } from '@/lib/db/models/notification.model'

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
  await UserModel.deleteMany({})
  await MerchantApplicationModel.deleteMany({})
  await MerchantInvitationModel.deleteMany({})
  await NotificationModel.deleteMany({})
})

const adminId = new mongoose.Types.ObjectId()
const invId = new mongoose.Types.ObjectId()

async function createMerchantWithApp() {
  const user = await UserModel.create({
    email: 'merchant@shop.com',
    password: 'hashed',
    role: 'merchant',
    name: 'Test Merchant',
  })
  const app = await MerchantApplicationModel.create({
    userId: user._id,
    invitationId: invId,
    status: 'submitted',
    registeredCompanyName: 'Shop Pty Ltd',
    acn: '123456789',
    abn: '12345678901',
    registeredAddress: '1 Main St',
    primaryContact: { name: 'Jane', email: 'jane@shop.com', phone: '0411000000' },
    financeContact: { name: 'Bob', position: 'CFO', email: 'bob@shop.com', phone: '0422000000' },
    brandNameEnglish: 'ShopBrand',
    brandIntroductionEnglish: 'A great shop brand.',
    mainCategories: ['fashion'],
    storesInAustralia: 2,
    storesToList: 1,
    paymentMethods: ['eftpos'],
    bankAccountName: 'Shop',
    bankAccountNumber: 'ENC:xxx',
    bankName: 'ANZ',
    bankBsb: '012-345',
  })
  return { user, app }
}

describe('updateApplicationStatus', () => {
  it('approves an application and creates a notification', async () => {
    const { user, app } = await createMerchantWithApp()
    const { updateApplicationStatus } = await import('@/lib/actions/admin.actions')
    const result = await updateApplicationStatus(app._id.toString(), 'approved', undefined, adminId.toString())
    expect(result.success).toBe(true)

    const updated = await MerchantApplicationModel.findById(app._id)
    expect(updated?.status).toBe('approved')
    expect(updated?.reviewedBy?.toString()).toBe(adminId.toString())

    const notif = await NotificationModel.findOne({ userId: user._id })
    expect(notif?.type).toBe('approved')
  })

  it('rejects an application', async () => {
    const { app } = await createMerchantWithApp()
    const { updateApplicationStatus } = await import('@/lib/actions/admin.actions')
    const result = await updateApplicationStatus(app._id.toString(), 'rejected', undefined, adminId.toString())
    expect(result.success).toBe(true)

    const updated = await MerchantApplicationModel.findById(app._id)
    expect(updated?.status).toBe('rejected')
  })

  it('sets requires_info with a reason', async () => {
    const { app } = await createMerchantWithApp()
    const { updateApplicationStatus } = await import('@/lib/actions/admin.actions')
    const result = await updateApplicationStatus(app._id.toString(), 'requires_info', '请补充营业执照', adminId.toString())
    expect(result.success).toBe(true)

    const updated = await MerchantApplicationModel.findById(app._id)
    expect(updated?.status).toBe('requires_info')
    expect(updated?.requiresInfoReason).toBe('请补充营业执照')
  })

  it('returns error for non-existent application', async () => {
    const { updateApplicationStatus } = await import('@/lib/actions/admin.actions')
    const result = await updateApplicationStatus(new mongoose.Types.ObjectId().toString(), 'approved', undefined, adminId.toString())
    expect(result.success).toBe(false)
  })
})

describe('getApplicationsForAdmin', () => {
  it('returns all applications when no filter', async () => {
    await createMerchantWithApp()
    const { getApplicationsForAdmin } = await import('@/lib/actions/admin.actions')
    const result = await getApplicationsForAdmin()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBeGreaterThanOrEqual(1)
  })

  it('filters by status', async () => {
    await createMerchantWithApp()
    const { getApplicationsForAdmin } = await import('@/lib/actions/admin.actions')
    const result = await getApplicationsForAdmin('approved')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(0)
  })
})
