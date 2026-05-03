import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Types } from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import { HeroProductModel } from '@/lib/db/models/hero-product.model'
import { createHeroProduct, updateHeroProduct, deleteHeroProduct, getHeroProductsByBrand, getAllHeroProductsForAdmin } from '@/lib/actions/hero-product.actions'

let mongod: MongoMemoryServer

const brandId = new Types.ObjectId().toString()

const PRODUCT_INPUT = {
  brandId,
  name: 'Summer Collection',
  subtitle: 'Fresh styles for summer',
  imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/hero.jpg',
  imageWidth: 500,
  imageHeight: 500,
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

beforeEach(async () => { await HeroProductModel.deleteMany({}) })

describe('createHeroProduct', () => {
  it('creates a valid hero product', async () => {
    const result = await createHeroProduct(PRODUCT_INPUT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Summer Collection')
      expect(result.data.imageWidth).toBe(500)
    }
  })

  it('rejects non-square image', async () => {
    const result = await createHeroProduct({ ...PRODUCT_INPUT, imageWidth: 400, imageHeight: 600 })
    expect(result.success).toBe(false)
  })

  it('rejects image too small', async () => {
    const result = await createHeroProduct({ ...PRODUCT_INPUT, imageWidth: 200, imageHeight: 200 })
    expect(result.success).toBe(false)
  })

  it('rejects image too large', async () => {
    const result = await createHeroProduct({ ...PRODUCT_INPUT, imageWidth: 900, imageHeight: 900 })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', async () => {
    const result = await createHeroProduct({ ...PRODUCT_INPUT, name: '' })
    expect(result.success).toBe(false)
  })
})

describe('updateHeroProduct', () => {
  it('updates product name', async () => {
    const prod = await HeroProductModel.create({ ...PRODUCT_INPUT })
    const result = await updateHeroProduct(prod._id.toString(), { name: 'Winter Collection' })
    expect(result.success).toBe(true)
    const updated = await HeroProductModel.findById(prod._id).lean()
    expect(updated!.name).toBe('Winter Collection')
  })
})

describe('deleteHeroProduct', () => {
  it('deletes a product', async () => {
    const prod = await HeroProductModel.create({ ...PRODUCT_INPUT })
    const result = await deleteHeroProduct(prod._id.toString())
    expect(result.success).toBe(true)
    expect(await HeroProductModel.findById(prod._id).lean()).toBeNull()
  })
})

describe('getHeroProductsByBrand', () => {
  it('returns products for a brand', async () => {
    await HeroProductModel.create({ ...PRODUCT_INPUT })
    const result = await getHeroProductsByBrand(brandId)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})

describe('getAllHeroProductsForAdmin', () => {
  it('returns all products', async () => {
    await HeroProductModel.create({ ...PRODUCT_INPUT })
    const result = await getAllHeroProductsForAdmin()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.length).toBe(1)
  })
})
