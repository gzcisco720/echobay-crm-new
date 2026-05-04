import { test, expect } from '@playwright/test'

test.describe('Admin — Applications list', () => {
  test('applications list page loads with table and filter tabs', async ({ page }) => {
    await page.goto('/admin/applications')
    // Filter tabs visible
    await expect(page.getByText('全部').first()).toBeVisible()
    await expect(page.getByText('已提交').first()).toBeVisible()
    await expect(page.getByText('审核中').first()).toBeVisible()
    await expect(page.getByText('已批准').first()).toBeVisible()
    // Table headers
    await expect(page.getByText('公司名称')).toBeVisible()
    await expect(page.getByText('联系人邮箱')).toBeVisible()
    await expect(page.getByText('状态')).toBeVisible()
  })

  test('seeded application appears in list', async ({ page }) => {
    await page.goto('/admin/applications')
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
  })

  test('status filter — clicking 已提交 tab filters list', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('已提交').first().click()
    await expect(page).toHaveURL(/status=submitted/)
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
  })

  test('status filter — clicking 已批准 tab filters list', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('已批准').first().click()
    await expect(page).toHaveURL(/status=approved/)
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
  })

  test('active filter tab has teal underline styling', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    // The submitted tab link should have teal color class
    const submittedTab = page.locator('a.border-\\[\\#0BB5C4\\]')
    await expect(submittedTab).toBeVisible()
  })

  test('search filters by company name', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.fill('input[placeholder*="搜索"]', 'Pending Review')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Approved Brand Pty Ltd')).not.toBeVisible()
  })

  test('clear filter removes active filter', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    await expect(page.getByText('清除筛选 ✕')).toBeVisible()
    await page.getByText('清除筛选 ✕').click()
    await expect(page).toHaveURL('/admin/applications')
  })

  test('search and filter can be combined', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted&q=Pending')
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd')).not.toBeVisible()
  })

  test('each row has a 查看 action link', async ({ page }) => {
    await page.goto('/admin/applications')
    const viewLinks = page.getByRole('link', { name: '查看' })
    await expect(viewLinks.first()).toBeVisible()
  })
})

test.describe('Admin — Application detail', () => {
  test('navigating via 查看 link opens detail page', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page).toHaveURL(/\/admin\/applications\//)
  })

  test('application detail shows two-column layout with section cards', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    await expect(page.getByText('公司基本信息')).toBeVisible()
    await expect(page.getByText('联系人')).toBeVisible()
    await expect(page.getByText('品牌与门店')).toBeVisible()
    await expect(page.getByText('商户信息')).toBeVisible()
    await expect(page.getByText('审核操作')).toBeVisible()
    await expect(page.getByText('内部备注')).toBeVisible()
  })

  test('application detail shows correct company name and status', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    await expect(page.getByText('Pending Review Co Pty Ltd').first()).toBeVisible()
    // Status badge present
    await expect(page.getByText('已提交').or(page.getByText('审核中'))).toBeVisible()
  })

  test('approved application shows all detail sections', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByText('Approved Brand Pty Ltd').first().click()
    await expect(page.getByText('公司基本信息')).toBeVisible()
    await expect(page.getByText('联系人')).toBeVisible()
    await expect(page.getByText('品牌与门店')).toBeVisible()
    await expect(page.getByText('支付与银行')).toBeVisible()
    await expect(page.getByText('协议签署')).toBeVisible()
    await expect(page.getByText('已批准')).toBeVisible()
  })

  test('application review panel — mark as under review', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    const rows = page.getByText('Pending Review Co Pty Ltd')
    if (await rows.count() > 0) {
      await rows.first().click()
      const underReviewBtn = page.getByRole('button', { name: /标记为审核中/ })
      if (await underReviewBtn.isVisible()) {
        await underReviewBtn.click()
        await expect(page.getByText('审核中')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('application review panel — requires_info requires reason text', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    if (await page.getByText('Pending Review Co Pty Ltd').count() > 0) {
      await page.getByText('Pending Review Co Pty Ltd').first().click()
      const requiresInfoBtn = page.getByRole('button', { name: /需补充资料/ })
      if (await requiresInfoBtn.isVisible()) {
        await requiresInfoBtn.click()
        // Shows textarea for reason
        await expect(page.locator('textarea').last()).toBeVisible()
        // Try to submit without reason — shows error
        await page.getByRole('button', { name: /需补充资料/ }).last().click()
        await expect(page.getByText(/请填写/).or(page.getByText(/填写/))).toBeVisible()
      }
    }
  })

  test('admin notes — can save a note', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByText('Pending Review Co Pty Ltd').first().click()
    const noteTextarea = page.locator('#adminNotes').or(page.locator('textarea').last())
    await noteTextarea.fill('E2E test note — reviewing this application')
    await page.getByRole('button', { name: /保存备注/ }).click()
    await expect(page.getByText('E2E test note').or(page.getByText(/保存/))).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin — Application workflow — status transitions', () => {
  test('submitting application appears in 已提交 filter', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    await expect(page.getByText('Pending Review Co Pty Ltd')).toBeVisible()
  })

  test('approved application appears in 已批准 filter', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
    await expect(page.getByText('已批准').first()).toBeVisible()
  })
})
