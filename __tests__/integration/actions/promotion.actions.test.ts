import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { createPromotion, updatePromotion, deletePromotion, getPromotionsForBrand, getPromotionsByUser, getAllPromotionsForAdmin } from '@/lib/actions/promotion.actions'

let mongod: MongoMemoryServer

const userId = new Types.ObjectId().toString()
const brandId = new Types.ObjectId().toString()

const PROMO_INPUT = {
  userId,
  brandId,
  level: 'brand' as const,
  promotionRule: '10% off all items',
  fromDate: new Date('2026-06-01'),
  toDate: new Date('2026-06-30'),
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

beforeEach(async () => { await PromotionModel.deleteMany({}) })

describe('createPromotion', () => {
  it('creates a brand-level promotion', async () => {
    const result = await createPromotion(PROMO_INPUT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.promotionRule).toBe('10% off all items')
      expect(result.data.level).toBe('brand')
      expect(result.data.status).toBe('active')
    }
  })

  it('creates a store-level promotion', async () => {
    const storeId = new Types.ObjectId().toString()
    const result = await createPromotion({ ...PROMO_INPUT, level: 'store', storeId })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.level).toBe('store')
  })

  it('returns error when required fields are missing', async () => {
    const result = await createPromotion({ ...PROMO_INPUT, promotionRule: '' })
    expect(result.success).toBe(false)
  })
})

describe('updatePromotion', () => {
  it('updates promotion status', async () => {
    const promo = await PromotionModel.create({ ...PROMO_INPUT })
    const result = await updatePromotion(promo._id.toString(), { status: 'inactive' })
    expect(result.success).toBe(true)
    const updated = await PromotionModel.findById(promo._id).lean()
    expect(updated!.status).toBe('inactive')
  })
})

describe('deletePromotion', () => {
  it('deletes a promotion', async () => {
    const promo = await PromotionModel.create({ ...PROMO_INPUT })
    const result = await deletePromotion(promo._id.toString())
    expect(result.success).toBe(true)
    expect(await PromotionModel.findById(promo._id).lean()).toBeNull()
  })
})

describe('getPromotionsForBrand', () => {
  it('returns promotions for a brand', async () => {
    await PromotionModel.create({ ...PROMO_INPUT })
    const result = await getPromotionsForBrand(brandId)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getPromotionsByUser', () => {
  it('returns promotions by user', async () => {
    await PromotionModel.create({ ...PROMO_INPUT })
    const result = await getPromotionsByUser(userId)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getAllPromotionsForAdmin', () => {
  it('returns all promotions', async () => {
    await PromotionModel.create({ ...PROMO_INPUT })
    await PromotionModel.create({ ...PROMO_INPUT, level: 'store' as const })
    const result = await getAllPromotionsForAdmin()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(2)
  })
})
