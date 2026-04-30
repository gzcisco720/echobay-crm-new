import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type NotificationType = 'status_change' | 'info_required' | 'approved' | 'general'

export interface INotification {
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['status_change', 'info_required', 'approved', 'general'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

NotificationSchema.index({ userId: 1, isRead: 1 })

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models['Notification'] != null
    ? (mongoose.models['Notification'] as Model<INotificationDocument>)
    : mongoose.model<INotificationDocument>('Notification', NotificationSchema)
