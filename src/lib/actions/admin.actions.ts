'use server'

import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { UserModel } from '@/lib/db/models/user.model'
import { sendEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'
import type { Types } from 'mongoose'

const STATUS_NOTIFICATION: Partial<
  Record<
    ApplicationStatus,
    { type: 'status_change' | 'info_required' | 'approved' | 'general'; title: string; message: string }
  >
> = {
  approved: {
    type: 'approved',
    title: '🎉 申请已批准！',
    message: '恭喜！您的 EchoBay 商家入驻申请已获批准。请登录商家门户查看详情。',
  },
  rejected: {
    type: 'status_change',
    title: '申请未通过审核',
    message: '您的入驻申请未通过审核。如有疑问，请联系 EchoBay 团队。',
  },
  requires_info: {
    type: 'info_required',
    title: '申请需要补充资料',
    message: '您的申请需要补充资料，请查看申请详情页了解具体要求。',
  },
  under_review: {
    type: 'status_change',
    title: '申请进入审核阶段',
    message: '您的申请已进入审核阶段，我们将在 3-5 个工作日内完成审核。',
  },
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  reason: string | undefined,
  adminUserId: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId).exec()
    if (!app) return { success: false, error: '申请不存在' }

    app.status = status
    app.reviewedBy = adminUserId as unknown as Types.ObjectId
    app.reviewedAt = new Date()
    if (reason !== undefined) app.requiresInfoReason = reason
    await app.save()

    const notifConfig = STATUS_NOTIFICATION[status]
    if (notifConfig) {
      await NotificationModel.create({
        userId: app.userId,
        type: notifConfig.type,
        title: notifConfig.title,
        message: notifConfig.message,
      })
    }

    // Send email notification to merchant
    const merchant = await UserModel.findById(app.userId).select('email').lean().exec()
    if (merchant && notifConfig) {
      const emailSubject = status === 'approved'
        ? '🎉 您的 EchoBay 入驻申请已批准 Your application has been approved'
        : status === 'rejected'
        ? '您的 EchoBay 入驻申请结果通知'
        : '您的 EchoBay 入驻申请需要补充资料'

      await sendEmail({
        to: merchant.email,
        subject: emailSubject,
        html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;">
          <div style="margin-bottom:24px;"><span style="font-weight:700;font-size:18px;">EchoBay</span></div>
          <h2 style="margin-bottom:16px;">${notifConfig.title}</h2>
          <p style="color:#374151;margin-bottom:24px;">${notifConfig.message}</p>
          ${reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;padding:12px 16px;border-radius:6px;margin-bottom:24px;"><strong>补充说明：</strong>${reason}</div>` : ''}
          <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/merchant/dashboard"
             style="display:inline-block;background:#18181b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
            前往商家门户
          </a>
          <hr style="border:none;border-top:1px solid #f4f4f5;margin:32px 0;"/>
          <p style="color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} EchoBay</p>
        </div>`,
      })
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新申请状态失败' }
  }
}

interface ApplicationSummary {
  id: string
  status: ApplicationStatus
  registeredCompanyName: string
  createdAt: Date
  reviewedAt?: Date
}

export async function getApplicationsForAdmin(
  statusFilter?: ApplicationStatus
): Promise<ActionResult<ApplicationSummary[]>> {
  try {
    await connectDB()
    const query = statusFilter !== undefined ? { status: statusFilter } : {}
    const apps = await MerchantApplicationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec()

    return {
      success: true,
      data: apps.map((a) => ({
        id: a._id.toString(),
        status: a.status,
        registeredCompanyName: a.registeredCompanyName,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
      })),
    }
  } catch {
    return { success: false, error: '获取申请列表失败' }
  }
}
