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
