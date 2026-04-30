import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IMerchantDocument {
  userId: Types.ObjectId
  applicationId: Types.ObjectId
  type: string
  fileName: string
  cloudinaryPublicId: string
  requestedBy?: Types.ObjectId
  uploadedAt: Date
}

export interface IMerchantDocumentDocument extends IMerchantDocument, Document {}

const MerchantDocumentSchema = new Schema<IMerchantDocumentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'MerchantApplication', required: true },
    type: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

MerchantDocumentSchema.index({ userId: 1 })
MerchantDocumentSchema.index({ applicationId: 1 })

export const MerchantDocumentModel: Model<IMerchantDocumentDocument> =
  mongoose.models['MerchantDocument'] != null
    ? (mongoose.models['MerchantDocument'] as Model<IMerchantDocumentDocument>)
    : mongoose.model<IMerchantDocumentDocument>('MerchantDocument', MerchantDocumentSchema)
