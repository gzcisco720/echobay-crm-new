import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'

// Mock Mailgun so tests don't call real API
jest.mock('@/lib/mail/mailgun', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  buildInvitationEmail: jest.fn().mockReturnValue('<p>invite</p>'),
}))

// Mock connectDB to use in-memory connection
jest.mock('@/lib/db/connect', () => ({
  connectDB: jest.fn().mockResolvedValue({}),
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
})

let adminId: string

beforeEach(async () => {
  const admin = await UserModel.create({
    email: 'admin@echobay.com',
    password: 'hashed',
    role: 'admin',
    name: 'Admin',
  })
  adminId = admin._id.toString()
})

describe('validateInvitationToken', () => {
  it('returns email for a valid pending token', async () => {
    const inv = await MerchantInvitationModel.create({
      email: 'merchant@shop.com',
      token: 'valid-token-123',
      expiresAt: new Date(Date.now() + 86400000),
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken(inv.token)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('merchant@shop.com')
  })

  it('returns error for expired token', async () => {
    await MerchantInvitationModel.create({
      email: 'old@shop.com',
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000),
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('expired-token')
    expect(result.success).toBe(false)
  })

  it('returns error for non-existent token', async () => {
    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('does-not-exist')
    expect(result.success).toBe(false)
  })

  it('returns error for already-used token', async () => {
    await MerchantInvitationModel.create({
      email: 'used@shop.com',
      token: 'used-token',
      expiresAt: new Date(Date.now() + 86400000),
      status: 'used',
      invitedBy: adminId,
    })

    const { validateInvitationToken } = await import('@/lib/actions/invitation.actions')
    const result = await validateInvitationToken('used-token')
    expect(result.success).toBe(false)
  })
})

describe('cancelInvitation', () => {
  it('sets a pending invitation status to expired', async () => {
    const inv = await MerchantInvitationModel.create({
      email: 'cancel@shop.com',
      token: 'tok-cancel-1',
      expiresAt: new Date(Date.now() + 86400000),
      invitedBy: adminId,
    })

    const { cancelInvitation } = await import('@/lib/actions/invitation.actions')
    const result = await cancelInvitation(inv._id.toString())
    expect(result.success).toBe(true)

    const updated = await MerchantInvitationModel.findById(inv._id)
    expect(updated?.status).toBe('expired')
  })

  it('returns error for non-existent invitation', async () => {
    const { cancelInvitation } = await import('@/lib/actions/invitation.actions')
    const result = await cancelInvitation(new mongoose.Types.ObjectId().toString())
    expect(result.success).toBe(false)
  })

  it('returns error if invitation is already used', async () => {
    const inv = await MerchantInvitationModel.create({
      email: 'used2@shop.com',
      token: 'tok-used-2',
      expiresAt: new Date(Date.now() + 86400000),
      status: 'used',
      invitedBy: adminId,
    })

    const { cancelInvitation } = await import('@/lib/actions/invitation.actions')
    const result = await cancelInvitation(inv._id.toString())
    expect(result.success).toBe(false)
  })
})
