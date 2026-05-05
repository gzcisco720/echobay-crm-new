import type { ActionResult } from '@/types/action'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<ActionResult> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const from = process.env.MAILGUN_FROM ?? 'EchoBay <noreply@echobay.com.au>'

  if (!apiKey || !domain) {
    return { success: false, error: 'Mailgun environment variables are not configured' }
  }

  const body = new URLSearchParams({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
  })

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `Mailgun error: ${text}` }
    }

    return { success: true, data: undefined }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to send email: ${message}` }
  }
}

export function buildBaseEmail(title: string, body: string, footer?: string): string {
  const year = new Date().getFullYear()
  return `
<div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
  <div style="background: #0BB5C4; padding: 20px 24px;">
    <span style="color: #ffffff; font-weight: 700; font-size: 18px; letter-spacing: -0.3px;">EchoBay</span>
  </div>
  <div style="padding: 32px 24px;">
    <h1 style="font-size: 20px; font-weight: 700; color: #1B3F72; margin: 0 0 16px 0;">${title}</h1>
    ${body}
  </div>
  <div style="border-top: 1px solid #f1f5f9; padding: 20px 24px;">
    ${footer ? `<p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">${footer}</p>` : ''}
    <p style="color: #cbd5e1; font-size: 11px; margin: 0;">© ${year} EchoBay. All rights reserved.</p>
  </div>
</div>
  `.trim()
}

export function buildInvitationEmail(inviteUrl: string, recipientEmail: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 16px 0;">
      您已受邀成为 EchoBay 合作商家。<br>
      You've been invited to become an EchoBay merchant partner.
    </p>
    <p style="color: #475569; margin: 0 0 24px 0;">
      请点击以下按钮开始填写入驻申请（链接 7 天内有效）：
    </p>
    <a href="${inviteUrl}"
       style="display: inline-block; background: #0BB5C4; color: #ffffff; padding: 12px 24px;
              border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
      开始申请 Start Application →
    </a>
    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
      如果按钮无法点击，请复制此链接到浏览器：${inviteUrl}
    </p>
  `
  return buildBaseEmail(
    '您已受邀成为 EchoBay 合作商家',
    body,
    `This email was sent to ${recipientEmail}.`
  )
}

export function buildPasswordResetEmail(resetUrl: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 16px 0;">
      我们收到了您的密码重置请求。请点击以下按钮设置新密码（链接 1 小时内有效）：
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: #0BB5C4; color: #ffffff; padding: 12px 24px;
              border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
      重置密码 Reset Password →
    </a>
    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0;">
      如果您没有请求重置密码，请忽略此邮件。<br>
      如果按钮无法点击，请复制此链接到浏览器：${resetUrl}
    </p>
  `
  return buildBaseEmail('重置您的密码', body)
}

export function buildConfirmationEmail(companyName: string): string {
  const body = `
    <p style="color: #475569; margin: 0 0 12px 0;">
      感谢 <strong>${companyName}</strong> 提交入驻申请！我们的团队将在 3–5 个工作日内完成审核。
    </p>
    <p style="color: #475569; margin: 0;">
      您可以随时登录 EchoBay 商家门户查看申请进度。
    </p>
  `
  return buildBaseEmail('申请已成功提交 ✓', body)
}
