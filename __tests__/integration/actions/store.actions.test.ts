import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { BrandModel } from '@/lib/db/models/brand.model'
import { StoreModel } from '@/lib/db/models/store.model'
import {
  createStore, updateStore, deleteStore,
  getStoresForAdmin, getStoresByBrand, getStoreByUserId,
} from '@/lib/actions/store.actions'

let mongod: MongoMemoryServer

async function seedBrand() {
  const hash = await bcrypt.hash('P@ssword1', 10)
  const merchantUser = await UserModel.create({
    email: 'merchant@example.com', password: hash, name: 'Merchant', role: 'merchant', isActive: true,
  })
  const adminUser = await UserModel.create({
    email: 'admin@echobay.com', password: hash, name: 'Admin', role: 'admin', isActive: true,
  })
  const brand = await BrandModel.create({
    merchantApplicationId: new Types.ObjectId(),
    userId: merchantUser._id,
    registeredCompanyName: 'Test Co',
    abn: '11111111111',
    acn: '111111111',
    registeredAddress: '1 Test St',
    countryOfIncorporation: 'Australia',
    brandNameEnglish: 'TestBrand',
    brandIntroductionEnglish: 'Great brand',
    mainCategories: ['Fashion & Apparel'],
    storesInAustralia: 2,
    storesToList: 1,
    paymentMethods: ['Alipay'],
    primaryContactName: 'John',
    primaryContactEmail: 'john@test.com',
    primaryContactPhone: '0400000000',
    isAuthorizedSignatory: true,
  })
  return { merchantUser, adminUser, brand }
}

const STORE_DATA = {
  nameEnglishBranch: 'TestBrand Pitt St',
  addressEnglish: '100 Pitt St, Sydney NSW 2000',
  introduction: 'Our flagship store.',
  highlights: ['Great service', 'Wide selection', 'Easy parking'],
  businessHours: 'Mon-Sun 9am-6pm',
  storeType: 'Retail',
  businessCategory: 'Fashion & Apparel',
  phone: '0299990000',
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
  await BrandModel.deleteMany({})
  await StoreModel.deleteMany({})
})

describe('createStore', () => {
  it('creates a store for a brand', async () => {
    const { merchantUser, brand } = await seedBrand()
    const result = await createStore({
      brandId: brand._id.toString(),
      userId: merchantUser._id.toString(),
      ...STORE_DATA,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nameEnglishBranch).toBe('TestBrand Pitt St')
      expect(result.data.brandId.toString()).toBe(brand._id.toString())
    }
  })

  it('returns error for missing required fields', async () => {
    const { merchantUser, brand } = await seedBrand()
    const result = await createStore({
      brandId: brand._id.toString(),
      userId: merchantUser._id.toString(),
      nameEnglishBranch: '',
      addressEnglish: '',
      introduction: '',
      highlights: [],
      businessHours: '',
      storeType: '',
      businessCategory: '',
      phone: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateStore', () => {
  it('updates a store', async () => {
    const { merchantUser, brand } = await seedBrand()
    const store = await StoreModel.create({
      brandId: brand._id, userId: merchantUser._id, ...STORE_DATA,
    })
    const result = await updateStore(store._id.toString(), { phone: '0288880000' })
    expect(result.success).toBe(true)
    const updated = await StoreModel.findById(store._id).lean()
    expect(updated!.phone).toBe('0288880000')
  })
})

describe('deleteStore', () => {
  it('deletes a store', async () => {
    const { merchantUser, brand } = await seedBrand()
    const store = await StoreModel.create({
      brandId: brand._id, userId: merchantUser._id, ...STORE_DATA,
    })
    const result = await deleteStore(store._id.toString())
    expect(result.success).toBe(true)
    const deleted = await StoreModel.findById(store._id).lean()
    expect(deleted).toBeNull()
  })
})

describe('getStoresForAdmin', () => {
  it('returns all stores', async () => {
    const { merchantUser, brand } = await seedBrand()
    await StoreModel.create({ brandId: brand._id, userId: merchantUser._id, ...STORE_DATA })
    const result = await getStoresForAdmin()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getStoresByBrand', () => {
  it('returns stores for a specific brand', async () => {
    const { merchantUser, brand } = await seedBrand()
    await StoreModel.create({ brandId: brand._id, userId: merchantUser._id, ...STORE_DATA })
    const result = await getStoresByBrand(brand._id.toString())
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getStoreByUserId', () => {
  it('returns the store for a merchant user', async () => {
    const { merchantUser, brand } = await seedBrand()
    await StoreModel.create({ brandId: brand._id, userId: merchantUser._id, ...STORE_DATA })
    const result = await getStoreByUserId(merchantUser._id.toString())
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.nameEnglishBranch).toBe('TestBrand Pitt St')
  })

  it('returns error if merchant has no store', async () => {
    const { merchantUser } = await seedBrand()
    const result = await getStoreByUserId(merchantUser._id.toString())
    expect(result.success).toBe(false)
  })
})
