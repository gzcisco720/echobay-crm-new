// Run with: pnpm seed:e2e
import mongoose from 'mongoose'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  if (!db) throw new Error('No DB connection')

  const users = db.collection('users')
  const existing = await users.findOne({ email: 'admin@echobay.com' })
  let adminId: mongoose.Types.ObjectId

  if (!existing) {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('Admin@123456', 12)
    const result = await users.insertOne({
      email: 'admin@echobay.com',
      password: hashed,
      role: 'admin',
      name: 'EchoBay Admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    adminId = result.insertedId as mongoose.Types.ObjectId
    console.log('✓ Admin user created: admin@echobay.com / Admin@123456')
  } else {
    adminId = existing._id as mongoose.Types.ObjectId
    console.log('✓ Admin user already exists')
  }

  const invitations = db.collection('merchantinvitations')
  await invitations.deleteOne({ token: 'e2e-test-token-abc123' })
  await invitations.insertOne({
    email: 'e2e-merchant@test.com',
    token: 'e2e-test-token-abc123',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending',
    invitedBy: adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('✓ E2E invitation token created: e2e-test-token-abc123')
  console.log('  URL: http://localhost:3000/apply/e2e-test-token-abc123')

  await mongoose.disconnect()
}

seed().catch(console.error)
