'use server'

import { randomUUID } from 'crypto'
import { connectDB } from '@/lib/db/connect'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { sendEmail, buildInvitationEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'

export async function validateInvitationToken(
  token: string
): Promise<ActionResult<{ email: string; invitationId: string }>> {
  try {
    await connectDB()
    const invitation = await MerchantInvitationModel.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!invitation) {
      return { success: false, error: '邀请链接无效或已过期，请联系 EchoBay 重新发送邀请' }
    }

    return {
      success: true,
      data: { email: invitation.email, invitationId: invitation._id.toString() },
    }
  } catch {
    return { success: false, error: '验证邀请时发生错误，请稍后重试' }
  }
}

export async function sendMerchantInvitation(
  email: string,
  adminUserId: string
): Promise<ActionResult<{ token: string }>> {
  try {
    await connectDB()

    const existing = await MerchantInvitationModel.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (existing) {
      return { success: false, error: '该邮箱已有一个有效的待处理邀请' }
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await MerchantInvitationModel.create({
      email: email.toLowerCase(),
      token,
      expiresAt,
      invitedBy: adminUserId,
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL}/apply/${token}`
    const emailResult = await sendEmail({
      to: email,
      subject: '您已受邀成为 EchoBay 合作商家 | EchoBay Merchant Invitation',
      html: buildInvitationEmail(inviteUrl, email),
    })

    if (!emailResult.success) {
      return { success: false, error: `邀请已创建，但邮件发送失败: ${emailResult.error}` }
    }

    return { success: true, data: { token } }
  } catch {
    return { success: false, error: '发送邀请时发生错误，请稍后重试' }
  }
}
