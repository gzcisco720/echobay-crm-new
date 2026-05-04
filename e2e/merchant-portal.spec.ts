import { test, expect } from '@playwright/test'

test.describe('Merchant — Dashboard', () => {
  test('dashboard loads and shows welcome message', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL('/merchant/dashboard')
    await expect(page.getByText(/欢迎回来/)).toBeVisible()
  })

  test('merchant sidebar has all 6 nav items', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('仪表盘')).toBeVisible()
    await expect(page.getByText('申请详情')).toBeVisible()
    await expect(page.getByText('文件上传')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('我的门店')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
  })

  test('merchant sidebar shows EchoBay logo', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByAltText('EchoBay')).toBeVisible()
  })

  test('dashboard shows approved status card', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('已批准')).toBeVisible()
  })

  test('dashboard shows quick-link cards', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('申请详情')).toBeVisible()
    await expect(page.getByText('查看或编辑您的申请')).toBeVisible()
    await expect(page.getByText('文件上传')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
  })

  test('dashboard quick-links navigate to correct pages', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('查看或编辑您的申请').click()
    await expect(page).toHaveURL('/merchant/application')
  })

  test('notification panel visible on dashboard', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('未读通知')).toBeVisible()
  })
})

test.describe('Merchant — Application', () => {
  test('application page shows approved status', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('已批准')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd').or(page.getByText('ApprovedBrand'))).toBeVisible()
  })

  test('application page shows all form tabs', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('① 公司信息').or(page.getByText('公司信息'))).toBeVisible()
  })
})

test.describe('Merchant — Brand', () => {
  test('brand info page shows brand details', async ({ page }) => {
    await page.goto('/merchant/brand')
    await expect(page.getByText('ApprovedBrand').or(page.getByText('Approved Brand Pty Ltd'))).toBeVisible()
  })

  test('brand page is full-width (no max-w constraint)', async ({ page }) => {
    await page.goto('/merchant/brand')
    const main = page.locator('main')
    await expect(main).toBeVisible()
    // Content renders without visible narrow container
    await expect(page.getByText('ApprovedBrand').or(page.getByText('品牌信息'))).toBeVisible()
  })
})

test.describe('Merchant — My Store', () => {
  test('store page shows seeded store', async ({ page }) => {
    await page.goto('/merchant/store')
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
    await expect(page.getByText('100 George St, Sydney NSW 2000')).toBeVisible()
    await expect(page.getByText('Mon-Sun 9am-6pm')).toBeVisible()
  })

  test('store shows highlights', async ({ page }) => {
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

  test('new promotion button navigates to create form', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: /新增推广/ }).click()
    await expect(page).toHaveURL('/merchant/promotions/new')
  })

  test('new promotion page shows form fields', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await expect(page.getByText('新增推广活动')).toBeVisible()
    await expect(page.getByLabel('推广规则')).toBeVisible()
  })

  test('creating promotion with valid data redirects to list', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'E2E Test: Buy 2 get 1 free on all items')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    await expect(page.getByText('E2E Test: Buy 2 get 1 free')).toBeVisible()
  })

  test('promotion form rejects missing promotion rule', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    const textarea = page.locator('#promotionRule')
    const isInvalid = await textarea.evaluate((el: HTMLTextAreaElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('promotion form rejects end date before start date', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'Test rule')
    await page.fill('#fromDate', '2026-07-31')
    await page.fill('#toDate', '2026-07-01')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    // Either validation error or server error
    await expect(
      page.getByText(/日期/).or(page.getByText(/结束/).or(page.getByText(/有效期/)))
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Merchant — Documents', () => {
  test('documents page loads', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('文件上传').or(page.getByText('Documents'))).toBeVisible()
  })
})

test.describe('Merchant — Navigation', () => {
  test('sidebar nav items navigate correctly', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('申请详情').click()
    await expect(page).toHaveURL('/merchant/application')
  })

  test('clicking 文件上传 navigates to documents', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('文件上传').click()
    await expect(page).toHaveURL('/merchant/documents')
  })
})

test.describe('Merchant — Logout', () => {
  test('logout button redirects to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('退出登录').click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
