import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type BrandStatus = 'active' | 'inactive' | 'suspended'

export interface IBrand {
  merchantApplicationId: Types.ObjectId
  userId: Types.ObjectId
  status: BrandStatus
  // Company
  registeredCompanyName: string
  tradingName?: string
  abn: string
  acn: string
  registeredAddress: string
  postalAddress?: string
  countryOfIncorporation: string
  // Brand
  brandNameEnglish: string
  brandNameChinese?: string
  brandIntroductionEnglish: string
  website?: string
  socialMediaAccounts: string[]
  logoUploads: Map<string, string>
  mainCategories: string[]
  storesInAustralia: number
  storesToList: number
  otherCountries?: string
  // Payment & Platforms
  paymentMethods: string[]
  interestedInChinesePayments: boolean
  selectedPlatforms: string[]
  otherPlatforms?: string
  notifyForFuturePlatforms: boolean
  affiliateMarketing: boolean
  additionalServices: string[]
  // Contacts (denormalized)
  primaryContactName: string
  primaryContactPosition?: string
  primaryContactEmail: string
  primaryContactPhone: string
  financeContactName?: string
  financeContactPosition?: string
  financeContactEmail?: string
  isAuthorizedSignatory: boolean
  authorizedDirectorName?: string
  authorizedDirectorPosition?: string
  authorizedDirectorEmail?: string
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface IBrandDocument extends IBrand, Document {}

const BrandSchema = new Schema<IBrandDocument>(
  {
    merchantApplicationId: { type: Schema.Types.ObjectId, ref: 'MerchantApplication', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    registeredCompanyName: { type: String, required: true, trim: true },
    tradingName: { type: String, trim: true },
    abn: { type: String, required: true, trim: true },
    acn: { type: String, required: true, trim: true },
    registeredAddress: { type: String, required: true },
    postalAddress: String,
    countryOfIncorporation: { type: String, default: 'Australia' },
    brandNameEnglish: { type: String, required: true, trim: true },
    brandNameChinese: { type: String, trim: true },
    brandIntroductionEnglish: { type: String, required: true },
    website: String,
    socialMediaAccounts: { type: [String], default: [] },
    logoUploads: { type: Map, of: String, default: {} },
    mainCategories: { type: [String], required: true },
    storesInAustralia: { type: Number, required: true },
    storesToList: { type: Number, required: true },
    otherCountries: String,
    paymentMethods: { type: [String], default: [] },
    interestedInChinesePayments: { type: Boolean, default: false },
    selectedPlatforms: { type: [String], default: [] },
    otherPlatforms: String,
    notifyForFuturePlatforms: { type: Boolean, default: false },
    affiliateMarketing: { type: Boolean, default: false },
    additionalServices: { type: [String], default: [] },
    primaryContactName: { type: String, required: true, trim: true },
    primaryContactPosition: String,
    primaryContactEmail: { type: String, required: true, trim: true, lowercase: true },
    primaryContactPhone: { type: String, required: true, trim: true },
    financeContactName: String,
    financeContactPosition: String,
    financeContactEmail: { type: String, lowercase: true },
    isAuthorizedSignatory: { type: Boolean, default: true },
    authorizedDirectorName: String,
    authorizedDirectorPosition: String,
    authorizedDirectorEmail: { type: String, lowercase: true },
  },
  { timestamps: true }
)

BrandSchema.index({ merchantApplicationId: 1 }, { unique: true })
BrandSchema.index({ userId: 1 })
BrandSchema.index({ brandNameEnglish: 1 })
BrandSchema.index({ abn: 1 })
BrandSchema.index({ status: 1 })

export const BrandModel: Model<IBrandDocument> =
  mongoose.models['Brand'] != null
    ? (mongoose.models['Brand'] as Model<IBrandDocument>)
    : mongoose.model<IBrandDocument>('Brand', BrandSchema)
