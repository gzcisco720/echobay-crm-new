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
