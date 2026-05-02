import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NotificationModel } from '@/lib/db/models/notification.model'

jest.mock('@/lib/db/connect', () => ({ connectDB: jest.fn().mockResolvedValue({}) }))

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
  await NotificationModel.deleteMany({})
})

describe('markNotificationRead', () => {
  it('sets isRead to true for the given notification', async () => {
    const uid = new mongoose.Types.ObjectId()
    const notif = await NotificationModel.create({
      userId: uid,
      type: 'general',
      title: 'Test',
      message: 'Hello',
    })

    const { markNotificationRead } = await import('@/lib/actions/notification.actions')
    const result = await markNotificationRead(notif._id.toString())
    expect(result.success).toBe(true)

    const updated = await NotificationModel.findById(notif._id)
    expect(updated?.isRead).toBe(true)
  })

  it('returns error for non-existent notification', async () => {
    const { markNotificationRead } = await import('@/lib/actions/notification.actions')
    const result = await markNotificationRead(new mongoose.Types.ObjectId().toString())
    expect(result.success).toBe(false)
  })
})
