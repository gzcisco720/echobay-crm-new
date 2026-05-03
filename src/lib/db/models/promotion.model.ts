import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type PromotionLevel = 'brand' | 'store'
export type PromotionStatus = 'active' | 'inactive' | 'scheduled' | 'expired'

export interface IPromotion {
  userId: Types.ObjectId
  brandId: Types.ObjectId
  storeId?: Types.ObjectId
  level: PromotionLevel
  promotionRule: string
  fromDate: Date
  toDate: Date
  exclusions?: string
  status: PromotionStatus
  createdAt: Date
  updatedAt: Date
}

export interface IPromotionDocument extends IPromotion, Document {}

const PromotionSchema = new Schema<IPromotionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
    level: { type: String, enum: ['brand', 'store'], required: true },
    promotionRule: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    exclusions: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
)

PromotionSchema.index({ brandId: 1 })
PromotionSchema.index({ storeId: 1 })
PromotionSchema.index({ level: 1 })
PromotionSchema.index({ status: 1 })
PromotionSchema.index({ fromDate: 1, toDate: 1 })

export const PromotionModel: Model<IPromotionDocument> =
  mongoose.models['Promotion'] != null
    ? (mongoose.models['Promotion'] as Model<IPromotionDocument>)
    : mongoose.model<IPromotionDocument>('Promotion', PromotionSchema)
