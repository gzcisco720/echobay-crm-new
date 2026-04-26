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
  const { UserModel } = await import('@/lib/db/models/user.model')
  await UserModel.deleteMany({})
})

describe('UserModel', () => {
  it('saves a user with valid fields', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    const user = await UserModel.create({
      email: 'test@example.com',
      password: 'hashed_pw',
      role: 'merchant',
      name: 'Test User',
    })
    expect(user._id).toBeDefined()
    expect(user.isActive).toBe(true)
    expect(user.createdAt).toBeDefined()
  })

  it('lowercases email', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    const user = await UserModel.create({
      email: 'UPPER@EXAMPLE.COM',
      password: 'x',
      role: 'admin',
      name: 'Admin',
    })
    expect(user.email).toBe('upper@example.com')
  })

  it('enforces unique email', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    await UserModel.create({ email: 'dup@ex.com', password: 'x', role: 'admin', name: 'A' })
    await expect(
      UserModel.create({ email: 'dup@ex.com', password: 'y', role: 'admin', name: 'B' })
    ).rejects.toThrow()
  })

  it('rejects invalid role', async () => {
    const { UserModel } = await import('@/lib/db/models/user.model')
    await expect(
      UserModel.create({ email: 'a@b.com', password: 'x', role: 'superuser', name: 'A' })
    ).rejects.toThrow()
  })
})
