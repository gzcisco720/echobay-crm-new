import { test, expect } from '@playwright/test'

test.describe('Auth — Login', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('EchoBay')).toBeVisible()
    await expect(page.getByLabel(/邮箱/)).toBeVisible()
    await expect(page.getByLabel(/密码/)).toBeVisible()
    await expect(page.getByRole('button', { name: /登录/ })).toBeVisible()
    await expect(page.getByText('忘记密码')).toBeVisible()
  })

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'wrong@email.com')
    await page.fill('#password', 'wrongpassword')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page.getByText(/邮箱或密码错误/)).toBeVisible()
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
  test('unauthenticated access to /merchant/dashboard redirects to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('unauthenticated access to /admin/dashboard redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('unauthenticated access to /admin/applications redirects to login', async ({ page }) => {
    await page.goto('/admin/applications')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Auth — Forgot password', () => {
  test('forgot password page loads', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await expect(page.getByText('忘记密码')).toBeVisible()
    await expect(page.getByLabel(/邮箱/)).toBeVisible()
    await expect(page.getByRole('button', { name: /发送重置链接/ })).toBeVisible()
  })

  test('forgot password with unknown email returns success (does not reveal existence)', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await page.fill('input[type="email"]', 'nobody@example.com')
    await page.getByRole('button', { name: /发送重置链接/ }).click()
    await expect(page.getByText('邮件已发送')).toBeVisible({ timeout: 5000 })
  })

  test('reset password page without token shows invalid message', async ({ page }) => {
    await page.goto('/login/reset-password')
    await expect(page.getByText('链接无效')).toBeVisible()
  })

  test('reset password page with token shows form', async ({ page }) => {
    await page.goto('/login/reset-password?token=sometoken')
    await expect(page.getByText('设置新密码')).toBeVisible()
    await expect(page.getByLabel(/新密码/)).toBeVisible()
  })
})

test.describe('Auth — Root redirect', () => {
  test('root path redirects (unauthenticated) to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
