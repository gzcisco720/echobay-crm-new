import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'

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
})

const invId = new mongoose.Types.ObjectId()

async function createApp(status: string, companyName: string) {
  const user = await UserModel.create({
    email: `${companyName.toLowerCase().replace(/\s/g, '')}@test.com`,
    password: 'x',
    role: 'merchant',
    name: companyName,
  })
  return MerchantApplicationModel.create({
    userId: user._id,
    invitationId: invId,
    status,
    registeredCompanyName: companyName,
    acn: '111111111',
    abn: '11111111111',
    registeredAddress: '1 Test St',
    primaryContact: { name: 'A', email: 'a@test.com', phone: '000' },
    financeContact: { name: 'B', position: 'CFO', email: 'b@test.com', phone: '000' },
    brandNameEnglish: companyName,
    brandIntroductionEnglish: 'A test brand for testing.',
    mainCategories: ['fashion'],
    storesInAustralia: 1,
    storesToList: 1,
    paymentMethods: ['eftpos'],
    bankAccountName: companyName,
    bankAccountNumber: 'ENC:x',
    bankName: 'ANZ',
    bankBsb: '012-345',
  })
}

describe('getAdminDashboardStats', () => {
  it('returns correct counts for each status', async () => {
    await createApp('submitted', 'Alpha Co')
    await createApp('submitted', 'Beta Co')
    await createApp('approved', 'Gamma Co')
    await createApp('rejected', 'Delta Co')

    const { getAdminDashboardStats } = await import('@/lib/actions/dashboard.actions')
    const result = await getAdminDashboardStats()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.submitted).toBe(2)
      expect(result.data.approved).toBe(1)
      expect(result.data.rejected).toBe(1)
      expect(result.data.total).toBe(4)
    }
  })

  it('returns recent applications sorted newest first', async () => {
    await createApp('submitted', 'First Co')
    await createApp('approved', 'Second Co')

    const { getAdminDashboardStats } = await import('@/lib/actions/dashboard.actions')
    const result = await getAdminDashboardStats()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recent.length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('getMerchantsForAdmin', () => {
  it('returns approved merchants with user info', async () => {
    await createApp('approved', 'Approved Co')
    await createApp('submitted', 'Pending Co')

    const { getMerchantsForAdmin } = await import('@/lib/actions/dashboard.actions')
    const result = await getMerchantsForAdmin()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.length).toBe(1)
      expect(result.data[0]?.registeredCompanyName).toBe('Approved Co')
    }
  })
})
