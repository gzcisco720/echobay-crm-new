import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'merchant' | 'admin' | 'super_admin'

export interface IUser {
  email: string
  password: string
  role: UserRole
  name: string
  isActive: boolean
  passwordResetToken?: string
  passwordResetExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['merchant', 'admin', 'super_admin'], required: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
  },
  { timestamps: true }
)

UserSchema.index({ email: 1 })

export const UserModel: Model<IUserDocument> =
  mongoose.models['User'] != null
    ? (mongoose.models['User'] as Model<IUserDocument>)
    : mongoose.model<IUserDocument>('User', UserSchema)
