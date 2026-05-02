import { test, expect } from '@playwright/test'

test.describe('Merchant Portal', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('EchoBay')).toBeVisible()
    await expect(page.getByLabelText(/邮箱/)).toBeVisible()
    await expect(page.getByLabelText(/密码/)).toBeVisible()
  })

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="email"]', 'wrong@email.com')
    await page.fill('[id="password"]', 'wrongpassword')
    await page.getByRole('button', { name: /登录/ }).click()
    await expect(page.getByText(/邮箱或密码错误/)).toBeVisible()
  })

  test('admin can access invitations page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="email"]', 'admin@echobay.com')
    await page.fill('[id="password"]', 'Admin@123456')
    await page.getByRole('button', { name: /登录/ }).click()
    await page.goto('/admin/invitations')
    await expect(page.getByText('邀请管理')).toBeVisible()
    await expect(page.getByText('发送新邀请')).toBeVisible()
  })
})
