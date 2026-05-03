import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IStore {
  brandId: Types.ObjectId
  userId: Types.ObjectId
  nameEnglishBranch: string
  addressEnglish: string
  introduction: string
  highlights: string[]
  businessHours: string
  storeType: string
  businessCategory: string
  phone: string
  photos: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IStoreDocument extends IStore, Document {}

const StoreSchema = new Schema<IStoreDocument>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nameEnglishBranch: { type: String, required: true, trim: true },
    addressEnglish: { type: String, required: true },
    introduction: { type: String, required: true },
    highlights: { type: [String], required: true },
    businessHours: { type: String, required: true },
    storeType: { type: String, required: true },
    businessCategory: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    photos: { type: [String], default: [] },
  },
  { timestamps: true }
)

StoreSchema.index({ brandId: 1 })
StoreSchema.index({ userId: 1 })

export const StoreModel: Model<IStoreDocument> =
  mongoose.models['Store'] != null
    ? (mongoose.models['Store'] as Model<IStoreDocument>)
    : mongoose.model<IStoreDocument>('Store', StoreSchema)
