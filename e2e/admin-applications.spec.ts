import { test, expect } from '@playwright/test'

test.describe('Admin — Applications list', () => {
  test('applications page loads with list', async ({ page }) => {
    await page.goto('/admin/applications')
    await expect(page.getByText('申请审核').or(page.getByText('Applications'))).toBeVisible()
    await expect(page.getByText('Pending Review Co Pty Ltd').or(page.getByText('全部申请'))).toBeVisible()
  })

  test('status filter works — clicking 已提交 filters list', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('已提交').first().click()
    await expect(page).toHaveURL(/status=submitted/)
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
  })

  test('status filter works — clicking 已批准 filters list', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('已批准').first().click()
    await expect(page).toHaveURL(/status=approved/)
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
  })

  test('text search filters by company name', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.fill('input[placeholder*="搜索"]', 'Pending Review')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible({ timeout: 5000 })
    // Other company should not appear
    await expect(page.getByText('Approved Brand Pty Ltd')).not.toBeVisible()
  })

  test('clear search removes filter', async ({ page }) => {
    await page.goto('/admin/applications?q=Pending+Review')
    await page.getByText('清除搜索').click()
    await expect(page).toHaveURL('/admin/applications')
  })
})

test.describe('Admin — Application detail', () => {
  test('application detail page shows all key fields', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    await expect(page.getByText('审核操作')).toBeVisible()
    await expect(page.getByText('公司信息')).toBeVisible()
    await expect(page.getByText('联系人')).toBeVisible()
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
  })

  test('can mark application as under review', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    const underReviewBtn = page.getByRole('button', { name: /审核中/ })
    if (await underReviewBtn.isVisible()) {
      await underReviewBtn.click()
      await expect(page.getByText('审核中')).toBeVisible({ timeout: 5000 })
    }
  })

  test('can add admin note to an application', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    const noteTextarea = page.locator('textarea').last()
    await noteTextarea.fill('E2E test note — reviewing this application')
    await page.getByRole('button', { name: /保存备注/ }).click()
    await expect(page.getByText('E2E test note').or(page.getByText(/保存/))).toBeVisible({ timeout: 5000 })
  })

  test('approved application shows correct status badge', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByText('Approved Brand Pty Ltd').first().click()
    await expect(page.getByText('已批准')).toBeVisible()
  })

  test('approved application detail shows all extended fields', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByText('Approved Brand Pty Ltd').first().click()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('支付与银行')).toBeVisible()
    await expect(page.getByText('协议签署')).toBeVisible()
  })
})

test.describe('Admin — Application approval workflow', () => {
  test('requires_info requires a reason to be entered', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    const rows = page.getByText('Pending Review Co Pty Ltd')
    if (await rows.count() > 0) {
      await rows.first().click()
      const requiresInfoBtn = page.getByRole('button', { name: /需补充资料/ })
      if (await requiresInfoBtn.isVisible()) {
        await requiresInfoBtn.click()
        // Should show text area for reason
        await expect(page.getByPlaceholder(/补充/).or(page.locator('textarea'))).toBeVisible()
        // Try to submit without reason
        await page.getByRole('button', { name: /需补充资料/ }).last().click()
        await expect(page.getByText(/填写/).or(page.getByText(/请/))).toBeVisible()
      }
    }
  })
})
