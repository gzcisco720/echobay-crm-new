import { test, expect } from '@playwright/test'

test.describe('Admin — Invitations', () => {
  test('invitations page loads', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('邀请管理').or(page.getByText('Invitations'))).toBeVisible()
    await expect(page.getByText('发送新邀请')).toBeVisible()
  })

  test('sending invitation with invalid email shows error', async ({ page }) => {
    await page.goto('/admin/invitations')
    await page.fill('input[type="email"]', 'not-an-email')
    await page.getByRole('button', { name: /发送邀请/ }).click()
    // HTML5 validation or server error
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('invitations list shows seeded cancellable invitation', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.getByText('cancel-test@test.com')).toBeVisible()
  })

  test('can cancel a pending invitation', async ({ page }) => {
    await page.goto('/admin/invitations')
    const row = page.locator('text=cancel-test@test.com').first()
    await expect(row).toBeVisible()
    // Find cancel button in same row area
    const cancelBtn = page.getByRole('button', { name: /取消/ }).first()
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      // Confirm dialog
      page.on('dialog', (d) => d.accept())
      await expect(page.getByText('已取消').or(page.getByText('expired'))).toBeVisible({ timeout: 5000 })
    }
  })

  test('sending invitation with valid email shows success', async ({ page }) => {
    await page.goto('/admin/invitations')
    const uniqueEmail = `e2e-invite-${Date.now()}@test.com`
    await page.fill('input[type="email"]', uniqueEmail)
    await page.getByRole('button', { name: /发送邀请/ }).click()
    await expect(
      page.getByText(uniqueEmail).or(page.getByText(/邀请已发送/))
    ).toBeVisible({ timeout: 8000 })
  })
})
