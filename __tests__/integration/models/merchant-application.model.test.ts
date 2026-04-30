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
