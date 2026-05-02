'use server'

import { connectDB } from '@/lib/db/connect'
import { NotificationModel } from '@/lib/db/models/notification.model'
import type { ActionResult } from '@/types/action'

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  try {
    await connectDB()
    const result = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { $set: { isRead: true } },
      { new: true }
    ).exec()
    if (!result) return { success: false, error: '通知不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新通知失败' }
  }
}

export async function getUnreadNotifications(
  userId: string
): Promise<ActionResult<Array<{ id: string; type: string; title: string; message: string; createdAt: Date }>>> {
  try {
    await connectDB()
    const notifications = await NotificationModel.find({
      userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec()

    return {
      success: true,
      data: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      })),
    }
  } catch {
    return { success: false, error: '获取通知失败' }
  }
}
