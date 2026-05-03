/**
 * Resets the development database by dropping all app collections.
 * Run with: pnpm db:reset
 * To reset and re-seed:  pnpm db:reset && pnpm seed:dev
 */
import mongoose from 'mongoose'
import { config } from 'dotenv'
import path from 'path'
import * as readline from 'readline'

config({ path: path.resolve(process.cwd(), '.env.local') })

const COLLECTIONS = [
  'users',
  'merchantinvitations',
  'merchantapplications',
  'brands',
  'stores',
  'promotions',
  'heroproducts',
  'bankaccounts',
  'notifications',
  'merchantdocuments',
]

async function confirm(question: string): Promise<boolean> {
  if (process.argv.includes('--yes') || process.argv.includes('-y')) return true
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close()
      resolve(ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes')
    })
  })
}

async function reset() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env.local')

  const shortUri = uri.replace(/\/\/.*@/, '//<credentials>@')
  console.log(`\n⚠️  This will DELETE ALL DATA in: ${shortUri}\n`)

  const ok = await confirm('Are you sure? (y/N) ')
  if (!ok) { console.log('Aborted.'); return }

  await mongoose.connect(uri)
  const db = mongoose.connection.db!

  console.log('\n🗑  Dropping collections...')
  const existing = (await db.listCollections().toArray()).map((c) => c.name)
  let dropped = 0
  for (const name of COLLECTIONS) {
    if (existing.includes(name)) {
      const count = await db.collection(name).countDocuments()
      await db.collection(name).deleteMany({})
      console.log(`   ✓ ${name.padEnd(25)} ${count} documents removed`)
      dropped++
    } else {
      console.log(`   – ${name.padEnd(25)} (not found, skipped)`)
    }
  }

  await mongoose.disconnect()
  console.log(`\n✅ Reset complete — ${dropped} collections cleared.`)
  console.log('   Run  pnpm seed:dev  to repopulate with test data.\n')
}

reset().catch((err) => { console.error('\n❌', err.message); process.exit(1) })
