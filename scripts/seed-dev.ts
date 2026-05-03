/**
 * Dev database seed script.
 * Wipes all app collections and injects a full set of realistic test data.
 * Run with: pnpm seed:dev
 */
import mongoose from 'mongoose'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

// ── Accounts ──────────────────────────────────────────────────────────────────
const ACCOUNTS = {
  superAdmin: { email: 'superadmin@echobay.com', password: 'Admin@123456', role: 'super_admin', name: 'Super Admin' },
  admin:      { email: 'admin@echobay.com',      password: 'Admin@123456', role: 'admin',       name: 'EchoBay Admin' },
  admin2:     { email: 'admin2@echobay.com',     password: 'Admin@123456', role: 'admin',       name: 'Review Admin' },
  merchant1:  { email: 'merchant1@test.com',     password: 'Merchant@123', role: 'merchant',    name: 'Alice Wang' },
  merchant2:  { email: 'merchant2@test.com',     password: 'Merchant@123', role: 'merchant',    name: 'Bob Chen' },
  merchant3:  { email: 'merchant3@test.com',     password: 'Merchant@123', role: 'merchant',    name: 'Carol Li' },
  merchant4:  { email: 'merchant4@test.com',     password: 'Merchant@123', role: 'merchant',    name: 'David Zhang' },
  merchant5:  { email: 'merchant5@test.com',     password: 'Merchant@123', role: 'merchant',    name: 'Eve Liu' },
}

function encrypt(plaintext: string): string {
  const { createCipheriv, randomBytes } = require('crypto') as typeof import('crypto')
  const keyHex = process.env.ENCRYPTION_KEY ?? ''
  if (!keyHex || keyHex === 'REPLACE_ME') {
    return `unencrypted:${plaintext}`
  }
  const key = Buffer.from(keyHex, 'hex')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env.local')

  await mongoose.connect(uri)
  const db = mongoose.connection.db!
  console.log(`\n🔗 Connected to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}\n`)

  // ── Collections ────────────────────────────────────────────────────────────
  const cols = {
    users:        db.collection('users'),
    invitations:  db.collection('merchantinvitations'),
    applications: db.collection('merchantapplications'),
    brands:       db.collection('brands'),
    stores:       db.collection('stores'),
    promotions:   db.collection('promotions'),
    heroProducts: db.collection('heroproducts'),
    bankAccounts: db.collection('bankaccounts'),
    notifications: db.collection('notifications'),
    documents:    db.collection('merchantdocuments'),
  }

  // ── Wipe ───────────────────────────────────────────────────────────────────
  console.log('🗑  Wiping collections...')
  await Promise.all(Object.values(cols).map((c) => c.deleteMany({})))

  const bcrypt = await import('bcryptjs')

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...')
  const userIds: Record<string, mongoose.Types.ObjectId> = {}
  for (const [key, acc] of Object.entries(ACCOUNTS)) {
    const hash = await bcrypt.hash(acc.password, 10)
    const { insertedId } = await cols.users.insertOne({
      email: acc.email, password: hash, role: acc.role,
      name: acc.name, isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
    })
    userIds[key] = insertedId as mongoose.Types.ObjectId
  }
  console.log(`   ✓ ${Object.keys(ACCOUNTS).length} users`)

  const adminId = userIds['admin']!

  // ── Invitations ────────────────────────────────────────────────────────────
  console.log('📨 Creating invitations...')
  const invTokens: Record<string, string> = {
    merchant1: 'dev-invite-merchant1-abc',
    merchant2: 'dev-invite-merchant2-def',
    merchant3: 'dev-invite-merchant3-ghi',
    merchant4: 'dev-invite-merchant4-jkl',
    merchant5: 'dev-invite-merchant5-mno',
    pending1:  'dev-invite-pending1-ppp',
    pending2:  'dev-invite-pending2-qqq',
    expired:   'dev-invite-expired-rrr',
  }
  const invIds: Record<string, mongoose.Types.ObjectId> = {}
  for (const [key, token] of Object.entries(invTokens)) {
    const merchantEmail = ACCOUNTS[key as keyof typeof ACCOUNTS]?.email ?? `${key}@test.com`
    const isExpired = key === 'expired'
    const isPending = key.startsWith('pending')
    const { insertedId } = await cols.invitations.insertOne({
      email: merchantEmail,
      token,
      expiresAt: isExpired
        ? new Date(Date.now() - 86400_000)
        : new Date(Date.now() + 30 * 86400_000),
      status: isExpired ? 'expired' : isPending ? 'pending' : 'used',
      invitedBy: adminId,
      createdAt: new Date(), updatedAt: new Date(),
    })
    invIds[key] = insertedId as mongoose.Types.ObjectId
  }
  console.log(`   ✓ ${Object.keys(invTokens).length} invitations`)
  console.log(`   ℹ  Application form URLs:`)
  for (const [key, token] of Object.entries(invTokens)) {
    if (!key.startsWith('pending') && key !== 'expired') continue
    console.log(`      http://localhost:3000/apply/${token}`)
  }

  // ── Helper: application template ──────────────────────────────────────────
  function makeApp(opts: {
    userId: mongoose.Types.ObjectId
    invitationId: mongoose.Types.ObjectId
    status: string
    companyName: string
    brandName: string
    brandNameChinese?: string
    email: string
    phone: string
    categories: string[]
    acn: string
    abn: string
    reviewedBy?: mongoose.Types.ObjectId
  }) {
    return {
      userId: opts.userId,
      invitationId: opts.invitationId,
      status: opts.status,
      registeredCompanyName: opts.companyName,
      tradingName: opts.brandName,
      acn: opts.acn, abn: opts.abn,
      registeredAddress: `Level 10, 1 ${opts.brandName} St, Sydney NSW 2000`,
      postalAddress: `Level 10, 1 ${opts.brandName} St, Sydney NSW 2000`,
      sameAsRegistered: true,
      countryOfIncorporation: 'Australia',
      primaryContact: { name: opts.companyName.split(' ')[0], email: opts.email, phone: opts.phone, position: 'CEO' },
      financeContact: { name: 'Finance Team', email: `finance@${opts.brandName.toLowerCase()}.com`, position: 'CFO' },
      brandNameEnglish: opts.brandName,
      brandNameChinese: opts.brandNameChinese,
      brandIntroductionEnglish: `${opts.brandName} is a leading brand trusted by thousands of Australian consumers.`,
      website: `https://www.${opts.brandName.toLowerCase()}.com.au`,
      socialMediaAccounts: [`@${opts.brandName.toLowerCase()}`, `fb.com/${opts.brandName.toLowerCase()}`],
      logoUploads: {},
      mainCategories: opts.categories,
      storesInAustralia: 3, storesToList: 2,
      bankAccountName: opts.companyName,
      bankAccountNumber: encrypt('123456789'),
      bankName: 'ANZ', bankBsb: '012-345',
      paymentMethods: ['Alipay', 'WeChat Pay', 'Credit Card'],
      interestedInChinesePayments: true,
      paymentPromotions: 'Competitive rates available',
      selectedPlatforms: ['EchoBay App', 'EchoBay Web'],
      otherPlatforms: '', notifyForFuturePlatforms: true,
      upfrontBenefits: 'Featured placement in first 3 months',
      customerCashback: 5,
      promotionStartDate: new Date('2026-07-01'),
      promotionEndDate: new Date('2026-12-31'),
      ongoingPromotion: true, affiliateMarketing: false,
      exclusions: 'Sale items excluded',
      additionalServices: ['Premium placement', 'Analytics dashboard'],
      agreementAccepted: true, setupFeeAccepted: true,
      applicantName: opts.companyName.split(' ')[0],
      applicantPosition: 'CEO', applicantDate: '2026-05-01',
      witnessName: 'Jane Witness', witnessDate: '2026-05-01',
      isAuthorizedSignatory: true,
      adminNotes: opts.status === 'approved' ? 'Verified all documents. Approved.' : undefined,
      requiresInfoReason: opts.status === 'requires_info' ? 'Please provide updated bank statement and ACN certificate.' : undefined,
      reviewedBy: opts.reviewedBy,
      reviewedAt: opts.reviewedBy ? new Date() : undefined,
      createdAt: new Date(), updatedAt: new Date(),
    }
  }

  // ── Applications ───────────────────────────────────────────────────────────
  console.log('📋 Creating applications...')
  const appDefs = [
    { key: 'merchant1', status: 'approved', company: 'LuxeStyle Australia Pty Ltd', brand: 'LuxeStyle', brandCn: '奢尚生活', categories: ['Fashion & Apparel', 'Jewelry & Accessories'], acn: '111111111', abn: '11111111111', reviewer: adminId },
    { key: 'merchant2', status: 'approved', company: 'FreshBite Foods Pty Ltd',      brand: 'FreshBite', brandCn: '鲜食',  categories: ['Food & Beverage'],                              acn: '222222222', abn: '22222222222', reviewer: adminId },
    { key: 'merchant3', status: 'submitted', company: 'TechGadget Pro Pty Ltd',       brand: 'TechGadget', categories: ['Electronics'],                                              acn: '333333333', abn: '33333333333', reviewer: undefined },
    { key: 'merchant4', status: 'under_review', company: 'KidsWorld Pty Ltd',         brand: 'KidsWorld', brandCn: '儿童世界', categories: ['Kids & Baby'],                             acn: '444444444', abn: '44444444444', reviewer: adminId },
    { key: 'merchant5', status: 'requires_info', company: 'HomeGarden Co Pty Ltd',    brand: 'HomeGarden', categories: ['Home & Garden'],                                            acn: '555555555', abn: '55555555555', reviewer: adminId },
  ]
  const appIds: Record<string, mongoose.Types.ObjectId> = {}
  for (const d of appDefs) {
    const { insertedId } = await cols.applications.insertOne(makeApp({
      userId: userIds[d.key]!,
      invitationId: invIds[d.key]!,
      status: d.status,
      companyName: d.company,
      brandName: d.brand,
      brandNameChinese: d.brandCn,
      email: ACCOUNTS[d.key as keyof typeof ACCOUNTS]!.email,
      phone: `040${d.acn.slice(0, 7)}`,
      categories: d.categories,
      acn: d.acn, abn: d.abn,
      reviewedBy: d.reviewer,
    }))
    appIds[d.key] = insertedId as mongoose.Types.ObjectId
  }
  console.log(`   ✓ ${appDefs.length} applications (2 approved, 1 submitted, 1 under_review, 1 requires_info)`)

  // ── Brands (for approved merchants) ───────────────────────────────────────
  console.log('🏷  Creating brands...')
  const brandIds: Record<string, mongoose.Types.ObjectId> = {}
  const approvedMerchants = appDefs.filter((d) => d.status === 'approved')
  for (const d of approvedMerchants) {
    const { insertedId } = await cols.brands.insertOne({
      merchantApplicationId: appIds[d.key],
      userId: userIds[d.key],
      status: 'active',
      registeredCompanyName: d.company,
      tradingName: d.brand,
      abn: d.abn, acn: d.acn,
      registeredAddress: `Level 10, 1 ${d.brand} St, Sydney NSW 2000`,
      countryOfIncorporation: 'Australia',
      brandNameEnglish: d.brand,
      brandNameChinese: d.brandCn,
      brandIntroductionEnglish: `${d.brand} is a leading brand trusted by thousands of Australian consumers.`,
      website: `https://www.${d.brand.toLowerCase()}.com.au`,
      socialMediaAccounts: [`@${d.brand.toLowerCase()}`],
      logoUploads: {},
      mainCategories: d.categories,
      storesInAustralia: 3, storesToList: 2,
      paymentMethods: ['Alipay', 'WeChat Pay'],
      interestedInChinesePayments: true,
      selectedPlatforms: ['EchoBay App'],
      notifyForFuturePlatforms: true,
      affiliateMarketing: false,
      additionalServices: ['Premium placement'],
      primaryContactName: d.company.split(' ')[0] ?? 'Contact',
      primaryContactPosition: 'CEO',
      primaryContactEmail: ACCOUNTS[d.key as keyof typeof ACCOUNTS]!.email,
      primaryContactPhone: `040${d.acn.slice(0, 7)}`,
      financeContactName: 'Finance Team',
      financeContactPosition: 'CFO',
      financeContactEmail: `finance@${d.brand.toLowerCase()}.com`,
      isAuthorizedSignatory: true,
      createdAt: new Date(), updatedAt: new Date(),
    })
    brandIds[d.key] = insertedId as mongoose.Types.ObjectId
  }
  console.log(`   ✓ ${approvedMerchants.length} brands`)

  // ── Stores ─────────────────────────────────────────────────────────────────
  console.log('🏪 Creating stores...')
  const storeDefs = [
    { merchant: 'merchant1', name: 'LuxeStyle Sydney CBD', address: '100 Pitt St, Sydney NSW 2000', category: 'Fashion & Apparel', type: 'Flagship' },
    { merchant: 'merchant1', name: 'LuxeStyle Westfield Bondi', address: 'Shop 120 Westfield Bondi, NSW 2026', category: 'Fashion & Apparel', type: 'Retail' },
    { merchant: 'merchant2', name: 'FreshBite Circular Quay', address: '1 Circular Quay, Sydney NSW 2000', category: 'Food & Beverage', type: 'Cafe' },
    { merchant: 'merchant2', name: 'FreshBite Darling Harbour', address: '1 Darling Dr, Sydney NSW 2000', category: 'Food & Beverage', type: 'Restaurant' },
  ]
  const storeIds: mongoose.Types.ObjectId[] = []
  for (const s of storeDefs) {
    const { insertedId } = await cols.stores.insertOne({
      brandId: brandIds[s.merchant],
      userId: userIds[s.merchant],
      nameEnglishBranch: s.name,
      addressEnglish: s.address,
      introduction: `${s.name} offers an exceptional ${s.category} experience in a premium location.`,
      highlights: ['Expert staff', 'Exclusive range', 'Easy parking'],
      businessHours: 'Mon-Sun 9am-9pm',
      storeType: s.type,
      businessCategory: s.category,
      phone: '0299990000',
      photos: [],
      createdAt: new Date(), updatedAt: new Date(),
    })
    storeIds.push(insertedId as mongoose.Types.ObjectId)
  }
  console.log(`   ✓ ${storeDefs.length} stores`)

  // ── Promotions ─────────────────────────────────────────────────────────────
  console.log('🎯 Creating promotions...')
  const promoDefs = [
    { merchant: 'merchant1', level: 'brand', rule: '15% off all fashion items this winter', from: '2026-06-01', to: '2026-08-31', status: 'active' },
    { merchant: 'merchant1', level: 'store', rule: 'Buy 2 get 1 free on selected accessories', from: '2026-06-15', to: '2026-07-15', status: 'active' },
    { merchant: 'merchant2', level: 'brand', rule: '$5 off orders over $30', from: '2026-05-01', to: '2026-05-31', status: 'expired' },
    { merchant: 'merchant2', level: 'brand', rule: 'Free delivery on orders over $50 with EchoBay', from: '2026-07-01', to: '2026-09-30', status: 'scheduled' },
  ]
  for (let i = 0; i < promoDefs.length; i++) {
    const p = promoDefs[i]!
    await cols.promotions.insertOne({
      userId: userIds[p.merchant],
      brandId: brandIds[p.merchant],
      storeId: p.level === 'store' ? storeIds[0] : undefined,
      level: p.level,
      promotionRule: p.rule,
      fromDate: new Date(p.from), toDate: new Date(p.to),
      exclusions: 'Sale items excluded',
      status: p.status,
      createdAt: new Date(), updatedAt: new Date(),
    })
  }
  console.log(`   ✓ ${promoDefs.length} promotions`)

  // ── Hero Products ──────────────────────────────────────────────────────────
  console.log('⭐ Creating hero products...')
  const heroDefs = [
    { merchant: 'merchant1', name: 'LuxeStyle Winter Coat', subtitle: 'Stay warm in style' },
    { merchant: 'merchant1', name: 'LuxeStyle Diamond Ring', subtitle: 'Timeless elegance' },
    { merchant: 'merchant2', name: 'FreshBite Signature Bowl', subtitle: 'Fresh ingredients, bold flavours' },
  ]
  for (const h of heroDefs) {
    await cols.heroProducts.insertOne({
      brandId: brandIds[h.merchant],
      name: h.name, subtitle: h.subtitle,
      imageUrl: 'https://via.placeholder.com/500',
      imageWidth: 500, imageHeight: 500,
      createdAt: new Date(), updatedAt: new Date(),
    })
  }
  console.log(`   ✓ ${heroDefs.length} hero products`)

  // ── Bank Accounts ─────────────────────────────────────────────────────────
  console.log('🏦 Creating bank accounts...')
  for (const d of approvedMerchants) {
    await cols.bankAccounts.insertOne({
      brandId: brandIds[d.key],
      merchantApplicationId: appIds[d.key],
      accountNumber: encrypt('123456789'),
      accountName: d.company,
      bankName: 'ANZ', bsb: '012-345',
      status: 'active', isPrimary: true,
      verifiedAt: new Date(), verifiedBy: adminId,
      notes: 'Verified via bank statement.',
      createdAt: new Date(), updatedAt: new Date(),
    })
  }
  console.log(`   ✓ ${approvedMerchants.length} bank accounts`)

  // ── Notifications ─────────────────────────────────────────────────────────
  console.log('🔔 Creating notifications...')
  const notifDefs = [
    { key: 'merchant1', type: 'approved',      title: '🎉 申请已批准！', msg: '恭喜！您的 EchoBay 商家入驻申请已获批准。请登录商家门户查看详情。', read: false },
    { key: 'merchant1', type: 'general',       title: '欢迎加入 EchoBay！', msg: '感谢您选择 EchoBay 作为您的推广平台。', read: true },
    { key: 'merchant2', type: 'approved',      title: '🎉 申请已批准！', msg: '恭喜！您的 EchoBay 商家入驻申请已获批准。', read: false },
    { key: 'merchant3', type: 'status_change', title: '申请进入审核阶段', msg: '您的申请已进入审核阶段，我们将在 3-5 个工作日内完成审核。', read: false },
    { key: 'merchant4', type: 'status_change', title: '申请进入审核阶段', msg: '您的申请已进入审核阶段。', read: false },
    { key: 'merchant5', type: 'info_required', title: '申请需要补充资料', msg: '请查看申请详情页了解具体补充要求。', read: false },
  ]
  for (const n of notifDefs) {
    await cols.notifications.insertOne({
      userId: userIds[n.key],
      type: n.type, title: n.title, message: n.msg, isRead: n.read,
      createdAt: new Date(),
    })
  }
  console.log(`   ✓ ${notifDefs.length} notifications`)

  await mongoose.disconnect()

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Dev seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' LOGIN CREDENTIALS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Super Admin:  superadmin@echobay.com    Admin@123456')
  console.log(' Admin:        admin@echobay.com         Admin@123456')
  console.log(' Admin 2:      admin2@echobay.com        Admin@123456')
  console.log(' Merchant 1:   merchant1@test.com        Merchant@123  (approved — LuxeStyle)')
  console.log(' Merchant 2:   merchant2@test.com        Merchant@123  (approved — FreshBite)')
  console.log(' Merchant 3:   merchant3@test.com        Merchant@123  (submitted — TechGadget)')
  console.log(' Merchant 4:   merchant4@test.com        Merchant@123  (under_review — KidsWorld)')
  console.log(' Merchant 5:   merchant5@test.com        Merchant@123  (requires_info — HomeGarden)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' OPEN INVITATION LINKS (status: pending)')
  console.log(`  http://localhost:3000/apply/${invTokens['pending1']}`)
  console.log(`  http://localhost:3000/apply/${invTokens['pending2']}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch((err) => { console.error('\n❌', err.message); process.exit(1) })
