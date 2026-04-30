import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type InvitationStatus = 'pending' | 'used' | 'expired'

export interface IMerchantInvitation {
  email: string
  token: string
  expiresAt: Date
  status: InvitationStatus
  invitedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IMerchantInvitationDocument extends IMerchantInvitation, Document {}

const MerchantInvitationSchema = new Schema<IMerchantInvitationDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'used', 'expired'],
      default: 'pending',
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

MerchantInvitationSchema.index({ email: 1 })

export const MerchantInvitationModel: Model<IMerchantInvitationDocument> =
  mongoose.models['MerchantInvitation'] != null
    ? (mongoose.models['MerchantInvitation'] as Model<IMerchantInvitationDocument>)
    : mongoose.model<IMerchantInvitationDocument>(
        'MerchantInvitation',
        MerchantInvitationSchema
      )
