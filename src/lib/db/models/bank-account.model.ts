import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type BankAccountStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended'

export interface IBankAccount {
  brandId: Types.ObjectId
  merchantApplicationId?: Types.ObjectId
  accountNumber: string
  accountName: string
  bankName: string
  bsb: string
  status: BankAccountStatus
  isPrimary: boolean
  verifiedAt?: Date
  verifiedBy?: Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface IBankAccountDocument extends IBankAccount, Document {}

const BankAccountSchema = new Schema<IBankAccountDocument>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    merchantApplicationId: { type: Schema.Types.ObjectId, ref: 'MerchantApplication' },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    bsb: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_verification', 'suspended'],
      default: 'pending_verification',
    },
    isPrimary: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
)

BankAccountSchema.index({ brandId: 1, isPrimary: 1 })
BankAccountSchema.index({ brandId: 1, status: 1 })
BankAccountSchema.index({ merchantApplicationId: 1 })

export const BankAccountModel: Model<IBankAccountDocument> =
  mongoose.models['BankAccount'] != null
    ? (mongoose.models['BankAccount'] as Model<IBankAccountDocument>)
    : mongoose.model<IBankAccountDocument>('BankAccount', BankAccountSchema)
