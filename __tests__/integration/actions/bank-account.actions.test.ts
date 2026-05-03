import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { BankAccountModel } from '@/lib/db/models/bank-account.model'
import { createBankAccount, updateBankAccount, getBankAccountsByBrand, getBankAccountById } from '@/lib/actions/bank-account.actions'

jest.mock('@/lib/crypto/encrypt', () => ({
  encrypt: jest.fn((v: string) => `encrypted:${v}`),
  decrypt: jest.fn((v: string) => v.replace('encrypted:', '')),
}))

let mongod: MongoMemoryServer

const brandId = new Types.ObjectId().toString()

const ACCOUNT_INPUT = {
  brandId,
  accountNumber: '123456789',
  accountName: 'Test Co Pty Ltd',
  bankName: 'ANZ',
  bsb: '012-345',
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.ENCRYPTION_KEY = 'a'.repeat(64)
  global.mongooseCache = { conn: null, promise: null }
  await connectDB()
})

afterAll(async () => {
  global.mongooseCache = { conn: null, promise: null }
  try { await mongoose.disconnect() } catch { /* already disconnected */ }
  await mongod.stop()
})

beforeEach(async () => { await BankAccountModel.deleteMany({}) })

describe('createBankAccount', () => {
  it('creates a bank account with encrypted account number', async () => {
    const result = await createBankAccount(ACCOUNT_INPUT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.accountName).toBe('Test Co Pty Ltd')
      expect(result.data.accountNumber).toBe('encrypted:123456789')
      expect(result.data.status).toBe('pending_verification')
    }
  })

  it('returns error when required fields missing', async () => {
    const result = await createBankAccount({ ...ACCOUNT_INPUT, accountNumber: '' })
    expect(result.success).toBe(false)
  })
})

describe('updateBankAccount', () => {
  it('updates bank account status', async () => {
    const acc = await BankAccountModel.create({
      ...ACCOUNT_INPUT, accountNumber: 'encrypted:123',
    })
    const result = await updateBankAccount(acc._id.toString(), { status: 'active', notes: 'Verified by admin' })
    expect(result.success).toBe(true)
    const updated = await BankAccountModel.findById(acc._id).lean()
    expect(updated!.status).toBe('active')
    expect(updated!.notes).toBe('Verified by admin')
  })
})

describe('getBankAccountsByBrand', () => {
  it('returns accounts for a brand', async () => {
    await BankAccountModel.create({ ...ACCOUNT_INPUT, accountNumber: 'enc:1' })
    const result = await getBankAccountsByBrand(brandId)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getBankAccountById', () => {
  it('returns account by id', async () => {
    const acc = await BankAccountModel.create({ ...ACCOUNT_INPUT, accountNumber: 'enc:1' })
    const result = await getBankAccountById(acc._id.toString())
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.bankName).toBe('ANZ')
  })

  it('returns error for non-existent id', async () => {
    const result = await getBankAccountById(new Types.ObjectId().toString())
    expect(result.success).toBe(false)
  })
})
