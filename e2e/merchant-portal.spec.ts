import { test, expect } from '@playwright/test'

test.describe('Merchant — Dashboard', () => {
  test('dashboard loads successfully', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL('/merchant/dashboard')
    await expect(page.getByText('EchoBay')).toBeVisible()
  })

  test('sidebar has all nav items', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('仪表盘')).toBeVisible()
    await expect(page.getByText('申请详情')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('我的门店')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
  })
})

test.describe('Merchant — Application', () => {
  test('application page shows approved status', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('已批准')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd').or(page.getByText('ApprovedBrand'))).toBeVisible()
  })
})

test.describe('Merchant — Brand', () => {
  test('brand info page shows brand details', async ({ page }) => {
    await page.goto('/merchant/brand')
    await expect(page.getByText('ApprovedBrand').or(page.getByText('品牌信息'))).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
  })
})

test.describe('Merchant — My Store', () => {
  test('store page shows seeded store', async ({ page }) => {
    await page.goto('/merchant/store')
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
    await expect(page.getByText('100 George St, Sydney NSW 2000')).toBeVisible()
    await expect(page.getByText('Mon-Sun 9am-6pm')).toBeVisible()
  })

  test('store highlights are displayed', async ({ page }) => {
    await page.goto('/merchant/store')
    await expect(page.getByText('Premium quality')).toBeVisible()
    await expect(page.getByText('Exclusive items')).toBeVisible()
  })
})

test.describe('Merchant — Promotions', () => {
  test('promotions list shows seeded promotion', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await expect(page.getByText('10% off all items this season')).toBeVisible()
    await expect(page.getByText('品牌级')).toBeVisible()
    await expect(page.getByText('活跃')).toBeVisible()
  })

  test('new promotion page loads form', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await expect(page.getByText('新增推广活动')).toBeVisible()
    await expect(page.getByLabel('推广规则')).toBeVisible()
  })

  test('creating a promotion redirects to list', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'E2E Test: Buy 2 get 1 free on all items')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    await expect(page.getByText('E2E Test: Buy 2 get 1 free')).toBeVisible()
  })

  test('promotion form rejects missing required fields', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    const textarea = page.locator('#promotionRule')
    const isInvalid = await textarea.evaluate((el: HTMLTextAreaElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })
})

test.describe('Merchant — Documents', () => {
  test('documents page loads', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('文件上传').or(page.getByText('Documents'))).toBeVisible()
  })
})

test.describe('Merchant — Logout', () => {
  test('logout redirects to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('退出登录').click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
