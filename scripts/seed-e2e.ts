// Run with: pnpm seed:e2e
import mongoose from 'mongoose'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

export const ADMIN_EMAIL = 'admin@echobay.com'
export const ADMIN_PASSWORD = 'Admin@123456'
export const MERCHANT_APPROVED_EMAIL = 'merchant-approved@test.com'
export const MERCHANT_SUBMITTED_EMAIL = 'merchant-submitted@test.com'
export const MERCHANT_PASSWORD = 'Merchant@123456'
export const INVITATION_TOKEN = 'e2e-test-token-abc123'
export const CANCEL_INVITE_TOKEN = 'e2e-cancel-token-xyz789'
export const APPLY_EMAIL = 'e2e-merchant@test.com'

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  if (!db) throw new Error('No DB connection')

  const bcrypt = await import('bcryptjs')
  const users = db.collection('users')
  const invitations = db.collection('merchantinvitations')
  const applications = db.collection('merchantapplications')
  const brands = db.collection('brands')
  const stores = db.collection('stores')
  const promotions = db.collection('promotions')
  const heroproducts = db.collection('heroproducts')
  const notifications = db.collection('notifications')

  // Admin user
  let adminId: mongoose.Types.ObjectId
  const existingAdmin = await users.findOne({ email: ADMIN_EMAIL })
  if (!existingAdmin) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const r = await users.insertOne({
      email: ADMIN_EMAIL, password: hash, role: 'admin',
      name: 'EchoBay Admin', isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
    })
    adminId = r.insertedId as mongoose.Types.ObjectId
    console.log(`✓ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } else {
    adminId = existingAdmin._id as mongoose.Types.ObjectId
    console.log(`✓ Admin exists: ${ADMIN_EMAIL}`)
  }

  // Approved merchant + brand + store + promotion + hero product + notification
  await users.deleteOne({ email: MERCHANT_APPROVED_EMAIL })
  const approvedHash = await bcrypt.hash(MERCHANT_PASSWORD, 12)
  const { insertedId: approvedMerchantId } = await users.insertOne({
    email: MERCHANT_APPROVED_EMAIL, password: approvedHash,
    role: 'merchant', name: 'Approved Merchant',
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  })

  const { insertedId: approvedInviteId } = await invitations.insertOne({
    email: MERCHANT_APPROVED_EMAIL, token: `invite-approved-${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400_000), status: 'used',
    invitedBy: adminId, createdAt: new Date(), updatedAt: new Date(),
  })

  await applications.deleteOne({ userId: approvedMerchantId })
  const { insertedId: approvedAppId } = await applications.insertOne({
    userId: approvedMerchantId, invitationId: approvedInviteId,
    status: 'approved',
    registeredCompanyName: 'Approved Brand Pty Ltd', tradingName: 'ApprovedBrand',
    acn: '111111111', abn: '11111111111',
    registeredAddress: '100 George St, Sydney NSW 2000',
    sameAsRegistered: true, countryOfIncorporation: 'Australia',
    primaryContact: { name: 'Alice Smith', email: MERCHANT_APPROVED_EMAIL, phone: '0411111111', position: 'CEO' },
    financeContact: { name: 'Bob Smith', email: 'finance@approvedbrand.com', position: 'CFO' },
    brandNameEnglish: 'ApprovedBrand', brandNameChinese: '已批准品牌',
    brandIntroductionEnglish: 'A premium approved brand on EchoBay.',
    website: 'https://approvedbrand.com', socialMediaAccounts: ['@approvedbrand'],
    logoUploads: {}, mainCategories: ['Fashion & Apparel', 'Beauty & Health'],
    storesInAustralia: 3, storesToList: 2,
    bankAccountName: 'Approved Brand Pty Ltd', bankAccountNumber: 'placeholder',
    bankName: 'ANZ', bankBsb: '012-345',
    paymentMethods: ['Alipay', 'WeChat Pay'], interestedInChinesePayments: true,
    selectedPlatforms: ['EchoBay App'], notifyForFuturePlatforms: false,
    ongoingPromotion: false, affiliateMarketing: false,
    additionalServices: [], isAuthorizedSignatory: true,
    agreementAccepted: true, setupFeeAccepted: true,
    applicantName: 'Alice Smith', applicantPosition: 'CEO',
    reviewedBy: adminId, reviewedAt: new Date(),
    createdAt: new Date(), updatedAt: new Date(),
  })

  await brands.deleteOne({ userId: approvedMerchantId })
  const { insertedId: brandId } = await brands.insertOne({
    merchantApplicationId: approvedAppId, userId: approvedMerchantId, status: 'active',
    registeredCompanyName: 'Approved Brand Pty Ltd', tradingName: 'ApprovedBrand',
    abn: '11111111111', acn: '111111111',
    registeredAddress: '100 George St, Sydney NSW 2000',
    countryOfIncorporation: 'Australia',
    brandNameEnglish: 'ApprovedBrand', brandNameChinese: '已批准品牌',
    brandIntroductionEnglish: 'A premium approved brand on EchoBay.',
    website: 'https://approvedbrand.com', socialMediaAccounts: ['@approvedbrand'],
    logoUploads: {}, mainCategories: ['Fashion & Apparel', 'Beauty & Health'],
    storesInAustralia: 3, storesToList: 2,
    paymentMethods: ['Alipay', 'WeChat Pay'], interestedInChinesePayments: true,
    selectedPlatforms: ['EchoBay App'], notifyForFuturePlatforms: false,
    affiliateMarketing: false, additionalServices: [],
    primaryContactName: 'Alice Smith', primaryContactPosition: 'CEO',
    primaryContactEmail: MERCHANT_APPROVED_EMAIL, primaryContactPhone: '0411111111',
    financeContactName: 'Bob Smith', financeContactPosition: 'CFO',
    financeContactEmail: 'finance@approvedbrand.com',
    isAuthorizedSignatory: true, createdAt: new Date(), updatedAt: new Date(),
  })

  await stores.deleteOne({ userId: approvedMerchantId })
  const { insertedId: storeId } = await stores.insertOne({
    brandId, userId: approvedMerchantId,
    nameEnglishBranch: 'ApprovedBrand Sydney CBD',
    addressEnglish: '100 George St, Sydney NSW 2000',
    introduction: 'Our flagship store in the heart of Sydney.',
    highlights: ['Premium quality', 'Exclusive items', 'Expert staff'],
    businessHours: 'Mon-Sun 9am-6pm', storeType: 'Flagship',
    businessCategory: 'Fashion & Apparel', phone: '0299990000', photos: [],
    createdAt: new Date(), updatedAt: new Date(),
  })

  await promotions.deleteMany({ userId: approvedMerchantId })
  await promotions.insertOne({
    userId: approvedMerchantId, brandId, storeId, level: 'brand',
    promotionRule: '10% off all items this season',
    fromDate: new Date('2026-06-01'), toDate: new Date('2026-06-30'),
    exclusions: 'Not valid on sale items', status: 'active',
    createdAt: new Date(), updatedAt: new Date(),
  })

  await heroproducts.deleteMany({ brandId })
  await heroproducts.insertOne({
    brandId, name: 'Summer Collection 2026',
    subtitle: 'Fresh styles for the warm season',
    imageUrl: 'https://via.placeholder.com/500',
    imageWidth: 500, imageHeight: 500,
    createdAt: new Date(), updatedAt: new Date(),
  })

  await notifications.deleteMany({ userId: approvedMerchantId })
  await notifications.insertOne({
    userId: approvedMerchantId, type: 'approved',
    title: '🎉 申请已批准！',
    message: '恭喜！您的 EchoBay 商家入驻申请已获批准。',
    isRead: false, createdAt: new Date(),
  })
  console.log(`✓ Approved merchant seeded: ${MERCHANT_APPROVED_EMAIL} / ${MERCHANT_PASSWORD}`)

  // Submitted merchant (for admin review tests)
  await users.deleteOne({ email: MERCHANT_SUBMITTED_EMAIL })
  const submittedHash = await bcrypt.hash(MERCHANT_PASSWORD, 12)
  const { insertedId: submittedMerchantId } = await users.insertOne({
    email: MERCHANT_SUBMITTED_EMAIL, password: submittedHash,
    role: 'merchant', name: 'Submitted Merchant',
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  })
  const { insertedId: submittedInviteId } = await invitations.insertOne({
    email: MERCHANT_SUBMITTED_EMAIL, token: `invite-submitted-${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400_000), status: 'used',
    invitedBy: adminId, createdAt: new Date(), updatedAt: new Date(),
  })
  await applications.deleteOne({ userId: submittedMerchantId })
  await applications.insertOne({
    userId: submittedMerchantId, invitationId: submittedInviteId,
    status: 'submitted',
    registeredCompanyName: 'Pending Review Co Pty Ltd', tradingName: 'PendingBrand',
    acn: '222222222', abn: '22222222222',
    registeredAddress: '200 Pitt St, Sydney NSW 2000',
    sameAsRegistered: true, countryOfIncorporation: 'Australia',
    primaryContact: { name: 'Charlie Brown', email: MERCHANT_SUBMITTED_EMAIL, phone: '0422222222', position: 'CEO' },
    financeContact: { name: 'Dave Brown', email: 'finance@pending.com', position: 'CFO' },
    brandNameEnglish: 'PendingBrand', brandIntroductionEnglish: 'A brand awaiting review.',
    mainCategories: ['Food & Beverage'], storesInAustralia: 1, storesToList: 1,
    bankAccountName: 'Pending Co', bankAccountNumber: 'placeholder',
    bankName: 'CBA', bankBsb: '062-000',
    paymentMethods: ['Alipay'], interestedInChinesePayments: false,
    selectedPlatforms: [], notifyForFuturePlatforms: false,
    ongoingPromotion: false, affiliateMarketing: false,
    additionalServices: [], isAuthorizedSignatory: true,
    agreementAccepted: true, setupFeeAccepted: true,
    createdAt: new Date(), updatedAt: new Date(),
  })
  console.log(`✓ Submitted merchant seeded: ${MERCHANT_SUBMITTED_EMAIL} / ${MERCHANT_PASSWORD}`)

  // Fresh invitation for application form tests
  await invitations.deleteOne({ token: INVITATION_TOKEN })
  await invitations.insertOne({
    email: APPLY_EMAIL, token: INVITATION_TOKEN,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending', invitedBy: adminId,
    createdAt: new Date(), updatedAt: new Date(),
  })
  console.log(`✓ Application invite token: ${INVITATION_TOKEN}`)

  // Cancellable invitation
  await invitations.deleteOne({ token: CANCEL_INVITE_TOKEN })
  await invitations.insertOne({
    email: 'cancel-test@test.com', token: CANCEL_INVITE_TOKEN,
    expiresAt: new Date(Date.now() + 86400_000), status: 'pending',
    invitedBy: adminId, createdAt: new Date(), updatedAt: new Date(),
  })
  console.log(`✓ Cancellable invite token: ${CANCEL_INVITE_TOKEN}`)

  await mongoose.disconnect()
  console.log('\n✅ E2E seed complete')
}

seed().catch((err) => { console.error(err); process.exit(1) })
