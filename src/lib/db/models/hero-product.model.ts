import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IHeroProduct {
  brandId: Types.ObjectId
  name: string
  subtitle: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  createdAt: Date
  updatedAt: Date
}

export interface IHeroProductDocument extends IHeroProduct, Document {}

const HeroProductSchema = new Schema<IHeroProductDocument>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageWidth: { type: Number, required: true },
    imageHeight: { type: Number, required: true },
  },
  { timestamps: true }
)

HeroProductSchema.index({ brandId: 1, createdAt: 1 })
HeroProductSchema.index({ name: 1 })

export const HeroProductModel: Model<IHeroProductDocument> =
  mongoose.models['HeroProduct'] != null
    ? (mongoose.models['HeroProduct'] as Model<IHeroProductDocument>)
    : mongoose.model<IHeroProductDocument>('HeroProduct', HeroProductSchema)
