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

export function buildInvitationEmail(inviteUrl: string, recipientEmail: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 32px;">
        <span style="font-weight: 700; font-size: 18px;">EchoBay</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
        您已受邀成为 EchoBay 合作商家
      </h1>
      <p style="color: #52525b; margin-bottom: 24px;">
        You've been invited to become an EchoBay merchant partner.
      </p>
      <p style="color: #374151; margin-bottom: 24px;">
        请点击以下按钮开始填写入驻申请（链接 7 天内有效）：
      </p>
      <a href="${inviteUrl}"
         style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        开始申请 Start Application →
      </a>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">
        如果按钮无法点击，请复制此链接到浏览器：${inviteUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />
      <p style="color: #a1a1aa; font-size: 11px;">
        © ${new Date().getFullYear()} EchoBay. This email was sent to ${recipientEmail}.
      </p>
    </div>
  `
}

export function buildPasswordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 32px;">
        <span style="font-weight: 700; font-size: 18px;">EchoBay</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">重置您的密码</h1>
      <p style="color: #374151; margin-bottom: 24px;">
        我们收到了您的密码重置请求。请点击以下按钮设置新密码（链接 1 小时内有效）：
      </p>
      <a href="${resetUrl}"
         style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        重置密码 Reset Password →
      </a>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">
        如果您没有请求重置密码，请忽略此邮件。
      </p>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 8px;">
        如果按钮无法点击，请复制此链接到浏览器：${resetUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />
      <p style="color: #a1a1aa; font-size: 11px;">© ${new Date().getFullYear()} EchoBay</p>
    </div>
  `
}

export function buildConfirmationEmail(companyName: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
      <div style="margin-bottom: 32px;">
        <span style="font-weight: 700; font-size: 18px;">EchoBay</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">申请已成功提交</h1>
      <p style="color: #374151; margin-bottom: 16px;">
        感谢 ${companyName} 提交入驻申请！我们的团队将在 3-5 个工作日内完成审核。
      </p>
      <p style="color: #374151; margin-bottom: 24px;">
        您可以随时登录 EchoBay 商家门户查看申请进度。
      </p>
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />
      <p style="color: #a1a1aa; font-size: 11px;">© ${new Date().getFullYear()} EchoBay</p>
    </div>
  `
}
