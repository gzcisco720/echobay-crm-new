import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { requestPasswordReset, resetPassword } from '@/lib/actions/auth.actions'

jest.mock('@/lib/mail/mailgun', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, data: undefined }),
  buildPasswordResetEmail: jest.fn().mockReturnValue('<html>reset</html>'),
}))

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
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
})

async function createUser(email: string, password: string) {
  const hash = await bcrypt.hash(password, 10)
  return UserModel.create({ email, password: hash, name: 'Test User', role: 'merchant', isActive: true })
}

describe('requestPasswordReset', () => {
  it('returns success for non-existent email (does not reveal user existence)', async () => {
    const result = await requestPasswordReset('nobody@example.com')
    expect(result.success).toBe(true)
  })

  it('saves passwordResetToken and passwordResetExpiry for valid email', async () => {
    await createUser('merchant@example.com', 'Password1!')
    await requestPasswordReset('merchant@example.com')
    const user = await UserModel.findOne({ email: 'merchant@example.com' }).lean()
    expect(user?.passwordResetToken).toBeDefined()
    expect(user?.passwordResetExpiry).toBeDefined()
    expect(user!.passwordResetExpiry!.getTime()).toBeGreaterThan(Date.now())
  })

  it('sends email when user exists', async () => {
    const { sendEmail } = await import('@/lib/mail/mailgun')
    await createUser('merchant@example.com', 'Password1!')
    await requestPasswordReset('merchant@example.com')
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'merchant@example.com' })
    )
  })

  it('does not send email when user does not exist', async () => {
    const { sendEmail } = await import('@/lib/mail/mailgun')
    ;(sendEmail as jest.Mock).mockClear()
    await requestPasswordReset('nobody@example.com')
    expect(sendEmail).not.toHaveBeenCalled()
  })
})

describe('resetPassword', () => {
  it('returns error for invalid token', async () => {
    const result = await resetPassword('invalidtoken', 'NewPassword1!')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error for expired token', async () => {
    const user = await createUser('merchant@example.com', 'OldPassword1!')
    const expiredDate = new Date(Date.now() - 1000)
    await UserModel.findByIdAndUpdate(user._id, {
      passwordResetToken: 'expiredtoken123',
      passwordResetExpiry: expiredDate,
    })
    const result = await resetPassword('expiredtoken123', 'NewPassword1!')
    expect(result.success).toBe(false)
  })

  it('updates password and clears reset token on success', async () => {
    const user = await createUser('merchant@example.com', 'OldPassword1!')
    const token = 'validtoken12345678901234567890123456789012'
    await UserModel.findByIdAndUpdate(user._id, {
      passwordResetToken: token,
      passwordResetExpiry: new Date(Date.now() + 3600_000),
    })
    const result = await resetPassword(token, 'NewPassword1!')
    expect(result.success).toBe(true)
    const updated = await UserModel.findById(user._id).lean()
    expect(updated?.passwordResetToken).toBeUndefined()
    expect(updated?.passwordResetExpiry).toBeUndefined()
    const passwordChanged = await bcrypt.compare('NewPassword1!', updated!.password)
    expect(passwordChanged).toBe(true)
  })

  it('returns error for too-short password', async () => {
    const user = await createUser('merchant@example.com', 'OldPassword1!')
    const token = 'validtoken12345678901234567890123456789012'
    await UserModel.findByIdAndUpdate(user._id, {
      passwordResetToken: token,
      passwordResetExpiry: new Date(Date.now() + 3600_000),
    })
    const result = await resetPassword(token, 'short')
    expect(result.success).toBe(false)
  })
})
