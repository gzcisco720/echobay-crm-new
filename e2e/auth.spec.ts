import { test, expect } from '@playwright/test'

test.describe('Auth — Login page UI', () => {
  test('login page renders two-column brand layout', async ({ page }) => {
    await page.goto('/login')
    // Right panel form content
    await expect(page.getByText('欢迎回来')).toBeVisible()
    await expect(page.getByText('请登录您的账户')).toBeVisible()
    await expect(page.getByLabel(/邮箱/)).toBeVisible()
    await expect(page.getByLabel(/密码/)).toBeVisible()
    await expect(page.getByRole('button', { name: /登录/ })).toBeVisible()
    // Logo image present
    await expect(page.getByAltText('EchoBay').first()).toBeVisible()
    // Left panel brand text (visible on desktop viewport)
    await expect(page.getByText('EchoBay CRM').first()).toBeVisible()
  })

  test('login page has forgot password link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('忘记密码？')).toBeVisible()
  })

  test('invalid credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'wrong@email.com')
    await page.fill('#password', 'wrongpassword')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page.getByText(/邮箱或密码错误/)).toBeVisible()
  })

  test('empty form submission shows validation', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /登录/ }).click()
    // Either HTML5 validation or JS validation
    const emailInput = page.locator('#email')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('admin login redirects to /admin/dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'admin@echobay.com')
    await page.fill('#password', 'Admin@123456')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 8000 })
  })

  test('merchant login redirects to /merchant/dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'merchant-approved@test.com')
    await page.fill('#password', 'Merchant@123456')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page).toHaveURL(/\/merchant\/dashboard/, { timeout: 8000 })
  })
})

test.describe('Auth — Protected routes', () => {
  test('unauthenticated /merchant/dashboard redirects to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('unauthenticated /admin/dashboard redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('unauthenticated /admin/applications redirects to login', async ({ page }) => {
    await page.goto('/admin/applications')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('unauthenticated /admin/invitations redirects to login', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Auth — Forgot password', () => {
  test('forgot password page has brand layout', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await expect(page.getByText('找回密码')).toBeVisible()
    await expect(page.getByText('输入注册邮箱，我们将发送重置链接')).toBeVisible()
    await expect(page.getByLabel(/邮箱/)).toBeVisible()
    await expect(page.getByRole('button', { name: /发送重置链接/ })).toBeVisible()
    await expect(page.getByText('返回登录')).toBeVisible()
  })

  test('forgot password with unknown email shows success (does not reveal existence)', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await page.fill('input[type="email"]', 'nobody@example.com')
    await page.getByRole('button', { name: /发送重置链接/ }).click()
    await expect(page.getByText('邮件已发送')).toBeVisible({ timeout: 5000 })
  })

  test('forgot password with empty email shows validation', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await page.getByRole('button', { name: /发送重置链接/ }).click()
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('back to login link works', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await page.getByText('返回登录').click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Auth — Reset password', () => {
  test('reset password page without token shows invalid link message', async ({ page }) => {
    await page.goto('/login/reset-password')
    await expect(page.getByText('无效的重置链接')).toBeVisible()
    await expect(page.getByText('重新申请')).toBeVisible()
  })

  test('invalid link re-apply link goes to forgot password', async ({ page }) => {
    await page.goto('/login/reset-password')
    await page.getByText('重新申请').click()
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('reset password page with token shows form', async ({ page }) => {
    await page.goto('/login/reset-password?token=sometoken')
    await expect(page.getByText('设置新密码')).toBeVisible()
    await expect(page.getByLabel(/新密码/)).toBeVisible()
    await expect(page.getByLabel(/确认新密码/)).toBeVisible()
  })

  test('reset password with mismatched passwords shows error', async ({ page }) => {
    await page.goto('/login/reset-password?token=sometoken')
    await page.fill('#password', 'NewPassword1!')
    await page.fill('#confirmPassword', 'DifferentPassword1!')
    await page.getByRole('button', { name: /保存新密码/ }).click()
    await expect(page.getByText('两次密码不一致')).toBeVisible()
  })
})

test.describe('Auth — Root redirect', () => {
  test('root path redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
