import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  // Reset singleton cache so this test gets a fresh connection
  global.mongooseCache = { conn: null, promise: null }
})

afterAll(async () => {
  global.mongooseCache = { conn: null, promise: null }
  try { await mongoose.disconnect() } catch { /* already disconnected */ }
  await mongod.stop()
})

it('connectDB returns a mongoose instance', async () => {
  const { connectDB } = await import('@/lib/db/connect')
  const conn = await connectDB()
  expect(conn.connection.readyState).toBe(1) // 1 = connected
})

it('connectDB returns the same instance on repeated calls', async () => {
  const { connectDB } = await import('@/lib/db/connect')
  const a = await connectDB()
  const b = await connectDB()
  expect(a).toBe(b)
})
