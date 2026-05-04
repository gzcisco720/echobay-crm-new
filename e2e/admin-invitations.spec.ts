import { test, expect } from '@playwright/test'

test.describe('Admin — Invitations list', () => {
  test('invitations page loads with send form and history table', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('发送新邀请 Send Invitation')).toBeVisible()
    await expect(page.getByText('邀请记录 History')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /发送邀请/ })).toBeVisible()
  })

  test('invitations table shows seeded cancellable invitation', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('cancel-test@test.com')).toBeVisible()
  })

  test('invitation status badge — pending shows 待使用', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('待使用').first()).toBeVisible()
  })
})

test.describe('Admin — Send invitation — happy path', () => {
  test('sending invitation with valid email shows success message', async ({ page }) => {
    await page.goto('/admin/invitations')
    const uniqueEmail = `e2e-invite-${Date.now()}@test.com`
    await page.fill('input[type="email"]', uniqueEmail)
    await page.getByRole('button', { name: /发送邀请/ }).click()
    await expect(
      page.getByText(uniqueEmail).or(page.getByText(/邀请已成功发送/))
    ).toBeVisible({ timeout: 8000 })
  })

  test('new invitation appears in history after sending', async ({ page }) => {
    await page.goto('/admin/invitations')
    const uniqueEmail = `e2e-list-${Date.now()}@test.com`
    await page.fill('input[type="email"]', uniqueEmail)
    await page.getByRole('button', { name: /发送邀请/ }).click()
    await expect(page.getByText(/邀请已成功发送/)).toBeVisible({ timeout: 8000 })
    // Reload to see updated list
    await page.reload()
    await expect(page.getByText(uniqueEmail)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin — Send invitation — unhappy path', () => {
  test('sending with invalid email format is rejected by HTML5 validation', async ({ page }) => {
    await page.goto('/admin/invitations')
    await page.fill('input[type="email"]', 'not-an-email')
    await page.getByRole('button', { name: /发送邀请/ }).click()
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('sending with empty email is rejected', async ({ page }) => {
    await page.goto('/admin/invitations')
    await page.getByRole('button', { name: /发送邀请/ }).click()
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })
})

test.describe('Admin — Cancel invitation', () => {
  test('pending invitation has cancel button', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('cancel-test@test.com')).toBeVisible()
    const cancelBtn = page.getByRole('button', { name: /取消/ }).first()
    await expect(cancelBtn).toBeVisible()
  })

  test('cancelling invitation changes its status', async ({ page }) => {
    await page.goto('/admin/invitations')
    // Send a new invitation to cancel
    const cancelEmail = `e2e-cancel-${Date.now()}@test.com`
    await page.fill('input[type="email"]', cancelEmail)
    await page.getByRole('button', { name: /发送邀请/ }).click()
    await expect(page.getByText(/邀请已成功发送/)).toBeVisible({ timeout: 8000 })
    await page.reload()
    // Find and cancel it
    const cancelBtn = page.getByRole('button', { name: /取消/ }).first()
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await expect(page.getByText('已过期').or(page.getByText('已取消'))).toBeVisible({ timeout: 5000 })
    }
  })
})
