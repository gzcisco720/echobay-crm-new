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

const uid = new mongoose.Types.ObjectId()

describe('NotificationModel', () => {
  it('creates notification with isRead=false by default', async () => {
    const { NotificationModel } = await import('@/lib/db/models/notification.model')
    const n = await NotificationModel.create({
      userId: uid,
      type: 'status_change',
      title: '申请状态已更新',
      message: '您的申请已进入审核阶段',
    })
    expect(n.isRead).toBe(false)
    expect(n.type).toBe('status_change')
  })

  it('rejects invalid type', async () => {
    const { NotificationModel } = await import('@/lib/db/models/notification.model')
    await expect(
      NotificationModel.create({ userId: uid, type: 'unknown', title: 'x', message: 'y' })
    ).rejects.toThrow()
  })
})
