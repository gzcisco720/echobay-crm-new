// Mock global fetch before importing the module
const mockFetch = jest.fn()
global.fetch = mockFetch

import { sendEmail } from '@/lib/mail/mailgun'

beforeEach(() => {
  process.env.MAILGUN_API_KEY = 'test-key'
  process.env.MAILGUN_DOMAIN = 'mg.example.com'
  process.env.MAILGUN_FROM = 'EchoBay <noreply@echobay.com.au>'
  mockFetch.mockReset()
})

describe('sendEmail', () => {
  it('posts to the Mailgun API with correct body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'msg-id' }) })

    const result = await sendEmail({
      to: 'merchant@shop.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    })

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('mg.example.com')
  })

  it('returns failure when API responds with error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Unauthorized' })
    const result = await sendEmail({ to: 'x@x.com', subject: 'X', html: '<p>X</p>' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Mailgun')
  })

  it('returns failure on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))
    const result = await sendEmail({ to: 'x@x.com', subject: 'X', html: '<p>X</p>' })
    expect(result.success).toBe(false)
  })
})

import {
  buildBaseEmail,
  buildInvitationEmail,
  buildPasswordResetEmail,
  buildConfirmationEmail,
} from '@/lib/mail/mailgun'

describe('buildBaseEmail', () => {
  it('includes the title in the output', () => {
    const html = buildBaseEmail('Test Title', '<p>body</p>')
    expect(html).toContain('Test Title')
  })

  it('includes the body content', () => {
    const html = buildBaseEmail('Title', '<p>My body content</p>')
    expect(html).toContain('My body content')
  })

  it('includes EchoBay brand header', () => {
    const html = buildBaseEmail('Title', '<p>body</p>')
    expect(html).toContain('EchoBay')
    expect(html).toContain('#0BB5C4')
  })

  it('includes custom footer when provided', () => {
    const html = buildBaseEmail('Title', '<p>body</p>', 'Custom footer text')
    expect(html).toContain('Custom footer text')
  })
})

describe('buildInvitationEmail', () => {
  it('includes the invite URL', () => {
    const html = buildInvitationEmail('https://example.com/apply/tok123', 'merchant@test.com')
    expect(html).toContain('https://example.com/apply/tok123')
  })

  it('includes recipient email in footer', () => {
    const html = buildInvitationEmail('https://example.com/apply/tok123', 'merchant@test.com')
    expect(html).toContain('merchant@test.com')
  })
})

describe('buildPasswordResetEmail', () => {
  it('includes the reset URL', () => {
    const html = buildPasswordResetEmail('https://example.com/reset/abc')
    expect(html).toContain('https://example.com/reset/abc')
  })
})

describe('buildConfirmationEmail', () => {
  it('includes the company name', () => {
    const html = buildConfirmationEmail('Acme Retail Pty Ltd')
    expect(html).toContain('Acme Retail Pty Ltd')
  })
})
