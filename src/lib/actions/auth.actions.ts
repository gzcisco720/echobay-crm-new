'use server'

import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { sendEmail, buildPasswordResetEmail } from '@/lib/mail/mailgun'
import type { ActionResult } from '@/types/action'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour
const MIN_PASSWORD_LENGTH = 8

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    await connectDB()
    const normalised = email.toLowerCase().trim()
    const user = await UserModel.findOne({ email: normalised }).lean()

    if (!user) {
      return { success: true, data: undefined }
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { passwordResetToken: token, passwordResetExpiry: expiry },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/login/reset-password?token=${token}`
    const html = buildPasswordResetEmail(resetUrl)

    await sendEmail({
      to: normalised,
      subject: '重置您的 EchoBay 密码 / Reset your EchoBay password',
      html,
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '请求失败，请稍后重试' }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  try {
    if (!token || newPassword.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `密码至少需要 ${MIN_PASSWORD_LENGTH} 位` }
    }

    await connectDB()

    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).lean()

    if (!user) {
      return { success: false, error: '重置链接无效或已过期' }
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { password: hashed },
      $unset: { passwordResetToken: '', passwordResetExpiry: '' },
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '重置失败，请稍后重试' }
  }
}
