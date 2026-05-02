'use server'

import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { encrypt } from '@/lib/crypto/encrypt'
import { sendEmail, buildConfirmationEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'

export async function saveDraftApplication(
  token: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await connectDB()
    const invitation = await MerchantInvitationModel.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!invitation) return { success: false, error: '邀请链接无效' }

    await MerchantApplicationModel.findOneAndUpdate(
      { invitationId: invitation._id, status: 'draft' },
      { $set: { ...data, userId: invitation._id, invitationId: invitation._id } },
      { upsert: true, new: true }
    )

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '保存草稿失败' }
  }
}

interface SubmitPayload extends Record<string, unknown> {
  token: string
  password: string
  bankAccountNumber: string
  registeredCompanyName: string
  primaryContact: { name: string; email?: string }
}

export async function submitApplication(
  payload: SubmitPayload
): Promise<ActionResult<{ userId: string }>> {
  try {
    await connectDB()

    const invitation = await MerchantInvitationModel.findOne({
      token: payload.token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })

    if (!invitation) return { success: false, error: '邀请链接无效或已过期' }

    const existing = await UserModel.findOne({ email: invitation.email }).lean()
    if (existing) return { success: false, error: '该邮箱已注册，请直接登录' }

    const hashed = await bcrypt.hash(payload.password, 12)
    const encryptedBankAccount = encrypt(payload.bankAccountNumber)

    const user = await UserModel.create({
      email: invitation.email,
      password: hashed,
      role: 'merchant',
      name: payload.primaryContact?.name ?? invitation.email,
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token: _token, password: _password, ...appData } = payload
    await MerchantApplicationModel.findOneAndUpdate(
      { invitationId: invitation._id },
      {
        $set: {
          ...appData,
          userId: user._id,
          invitationId: invitation._id,
          status: 'submitted',
          bankAccountNumber: encryptedBankAccount,
        },
      },
      { upsert: true, new: true }
    )

    invitation.status = 'used'
    await invitation.save()

    await NotificationModel.create({
      userId: user._id,
      type: 'general',
      title: '申请已提交，等待审核',
      message: `感谢您提交入驻申请！我们的团队将在 3-5 个工作日内审核您的申请 ${payload.registeredCompanyName}。`,
    })

    await sendEmail({
      to: invitation.email,
      subject: '您的 EchoBay 入驻申请已提交',
      html: buildConfirmationEmail(payload.registeredCompanyName),
    })

    return { success: true, data: { userId: user._id.toString() } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误'
    return { success: false, error: `提交失败: ${msg}` }
  }
}

export async function updateApplication(
  applicationId: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId)
    if (!app) return { success: false, error: '申请不存在' }
    if (!(['submitted', 'requires_info'] as string[]).includes(app.status)) {
      return { success: false, error: '当前状态不允许修改' }
    }

    if (typeof data.bankAccountNumber === 'string' && data.bankAccountNumber) {
      data.bankAccountNumber = encrypt(data.bankAccountNumber)
    }

    await MerchantApplicationModel.findByIdAndUpdate(applicationId, { $set: data })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新申请失败' }
  }
}

export async function resubmitApplication(
  applicationId: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId)
    if (!app) return { success: false, error: '申请不存在' }
    if (app.status !== 'requires_info') {
      return { success: false, error: '只有「需补充」状态的申请才可重新提交' }
    }

    app.status = 'submitted'
    app.requiresInfoReason = undefined
    await app.save()

    await NotificationModel.create({
      userId: app.userId,
      type: 'status_change',
      title: '申请已重新提交',
      message: '您的申请已重新提交，我们将重新审核。感谢您的配合！',
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '重新提交失败' }
  }
}
