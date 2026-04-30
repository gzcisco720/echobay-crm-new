import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'requires_info'

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
)

export interface IContact {
  name: string
  position?: string
  email?: string
  phone?: string
}

export interface IMerchantApplication {
  userId: Types.ObjectId
  invitationId: Types.ObjectId
  status: ApplicationStatus
  registeredCompanyName: string
  tradingName?: string
  acn: string
  abn: string
  registeredAddress: string
  postalAddress?: string
  sameAsRegistered: boolean
  countryOfIncorporation: string
  primaryContact: IContact
  isAuthorizedSignatory: boolean
  authorizedDirector?: IContact
  financeContact: IContact
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
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBsb: string
  paymentMethods: string[]
  interestedInChinesePayments: boolean
  paymentPromotions?: string
  selectedPlatforms: string[]
  otherPlatforms?: string
  notifyForFuturePlatforms: boolean
  upfrontBenefits?: string
  customerCashback?: number
  promotionStartDate?: Date
  promotionEndDate?: Date
  ongoingPromotion: boolean
  affiliateMarketing: boolean
  exclusions?: string
  additionalServices: string[]
  agreementAccepted: boolean
  setupFeeAccepted: boolean
  applicantSignature?: string
  applicantName?: string
  applicantPosition?: string
  applicantDate?: string
  witnessSignature?: string
  witnessName?: string
  witnessDate?: string
  adminNotes?: string
  requiresInfoReason?: string
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IMerchantApplicationDocument extends IMerchantApplication, Document {}

const MerchantApplicationSchema = new Schema<IMerchantApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitationId: { type: Schema.Types.ObjectId, ref: 'MerchantInvitation', required: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_info'],
      default: 'draft',
    },
    registeredCompanyName: { type: String, required: true, trim: true },
    tradingName: { type: String, trim: true },
    acn: { type: String, required: true, trim: true },
    abn: { type: String, required: true, trim: true },
    registeredAddress: { type: String, required: true },
    postalAddress: String,
    sameAsRegistered: { type: Boolean, default: false },
    countryOfIncorporation: { type: String, default: 'Australia' },
    primaryContact: { type: ContactSchema, required: true },
    isAuthorizedSignatory: { type: Boolean, default: true },
    authorizedDirector: ContactSchema,
    financeContact: { type: ContactSchema, required: true },
    brandNameEnglish: { type: String, required: true, trim: true },
    brandNameChinese: { type: String, trim: true },
    brandIntroductionEnglish: { type: String, required: true },
    website: String,
    socialMediaAccounts: { type: [String], default: [] },
    logoUploads: { type: Map, of: String, default: {} },
    mainCategories: { type: [String], required: true },
    storesInAustralia: { type: Number, required: true, min: 1 },
    storesToList: { type: Number, required: true, min: 1 },
    otherCountries: String,
    bankAccountName: { type: String, required: true, trim: true },
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String, required: true, trim: true },
    bankBsb: { type: String, required: true, trim: true },
    paymentMethods: { type: [String], required: true },
    interestedInChinesePayments: { type: Boolean, default: false },
    paymentPromotions: String,
    selectedPlatforms: { type: [String], default: [] },
    otherPlatforms: String,
    notifyForFuturePlatforms: { type: Boolean, default: false },
    upfrontBenefits: String,
    customerCashback: { type: Number, min: 0 },
    promotionStartDate: Date,
    promotionEndDate: Date,
    ongoingPromotion: { type: Boolean, default: false },
    affiliateMarketing: { type: Boolean, default: false },
    exclusions: String,
    additionalServices: { type: [String], default: [] },
    agreementAccepted: { type: Boolean, default: false },
    setupFeeAccepted: { type: Boolean, default: false },
    applicantSignature: String,
    applicantName: String,
    applicantPosition: String,
    applicantDate: String,
    witnessSignature: String,
    witnessName: String,
    witnessDate: String,
    adminNotes: String,
    requiresInfoReason: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
)

MerchantApplicationSchema.index({ userId: 1 })
MerchantApplicationSchema.index({ invitationId: 1 })
MerchantApplicationSchema.index({ status: 1 })

export const MerchantApplicationModel: Model<IMerchantApplicationDocument> =
  mongoose.models['MerchantApplication'] != null
    ? (mongoose.models['MerchantApplication'] as Model<IMerchantApplicationDocument>)
    : mongoose.model<IMerchantApplicationDocument>(
        'MerchantApplication',
        MerchantApplicationSchema
      )
