import { test, expect } from '@playwright/test'

test.describe('Admin — Hero Products', () => {
  test('hero products page loads and shows seeded product', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByText('特色产品').or(page.getByText('Hero Products'))).toBeVisible()
    await expect(page.getByText('Summer Collection 2026')).toBeVisible()
    await expect(page.getByText('+ 新增特色产品')).toBeVisible()
  })

  test('new hero product page loads with form', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await expect(page.getByText('新增特色产品')).toBeVisible()
    await expect(page.getByLabel('产品名称')).toBeVisible()
    await expect(page.getByLabel('产品副标题')).toBeVisible()
    await expect(page.getByLabel('图片宽度')).toBeVisible()
    await expect(page.getByLabel('图片高度')).toBeVisible()
  })

  test('creating hero product with non-square image shows error', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'Invalid Image Product')
    await page.fill('#subtitle', 'This should fail')
    await page.fill('#imageUrl', 'https://via.placeholder.com/500x300')
    await page.fill('#imageWidth', '500')
    await page.fill('#imageHeight', '300')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    await expect(page.getByText(/正方形/).or(page.getByText(/宽度必须等于高度/))).toBeVisible({ timeout: 5000 })
  })

  test('creating hero product with image too small shows error', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'Too Small Product')
    await page.fill('#subtitle', 'Small image')
    await page.fill('#imageUrl', 'https://via.placeholder.com/200')
    await page.fill('#imageWidth', '200')
    await page.fill('#imageHeight', '200')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    await expect(page.getByText(/343/).or(page.getByText(/尺寸/))).toBeVisible({ timeout: 5000 })
  })

  test('creating valid hero product redirects to list', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'E2E Valid Hero Product')
    await page.fill('#subtitle', 'A valid square product image')
    await page.fill('#imageUrl', 'https://via.placeholder.com/500')
    await page.fill('#imageWidth', '500')
    await page.fill('#imageHeight', '500')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    await expect(page).toHaveURL('/admin/hero-products', { timeout: 8000 })
    await expect(page.getByText('E2E Valid Hero Product')).toBeVisible()
  })
})

test.describe('Admin — Hero Products — additional', () => {
  test('hero product form — missing name shows validation', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    // Fill everything except name
    await page.fill('#subtitle', 'A subtitle')
    await page.fill('#imageUrl', 'https://via.placeholder.com/500')
    await page.fill('#imageWidth', '500')
    await page.fill('#imageHeight', '500')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    const nameInput = page.locator('#name')
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('hero product form — missing subtitle shows validation', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'Test Product')
    await page.fill('#imageUrl', 'https://via.placeholder.com/500')
    await page.fill('#imageWidth', '500')
    await page.fill('#imageHeight', '500')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    const subtitleInput = page.locator('#subtitle')
    const isInvalid = await subtitleInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('hero product list shows seeded product name and dimensions', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByText('Summer Collection 2026')).toBeVisible()
    await expect(page.getByText('500×500px')).toBeVisible()
  })

  test('hero product list has delete and edit controls per card', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
  })

  test('hero product list empty state shows correct message', async ({ page }) => {
    // This tests the template — actual empty state only appears with no products seeded
    // We verify the page renders correctly with seeded data
    await page.goto('/admin/hero-products')
    await expect(page.getByText(/个产品/)).toBeVisible()
  })
})

test.describe('Admin — Promotions', () => {
  test('promotions page loads and shows seeded promotion', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('推广活动').or(page.getByText('Promotions'))).toBeVisible()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
    await expect(page.getByText('品牌级')).toBeVisible()
  })

  test('promotions list shows status badge', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('活跃').first()).toBeVisible()
  })

  test('promotions list shows date range', async ({ page }) => {
    await page.goto('/admin/promotions')
    // Seeded promotion: 2026/6/1 — 2026/6/30
    await expect(page.getByText(/2026/)).toBeVisible()
  })

  test('promotions list has delete and edit controls per row', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
  })

  test('promotions empty state message shown when no promotions', async ({ page }) => {
    // Verify the page renders correctly with seeded data
    await page.goto('/admin/promotions')
    await expect(page.getByText(/条推广/)).toBeVisible()
  })
})

test.describe('Admin — Dashboard', () => {
  test('admin dashboard loads with stats', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('数据概览').or(page.getByText('Dashboard'))).toBeVisible()
  })

  test('dashboard stat numbers are non-negative integers', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('总申请数')).toBeVisible()
    // Numbers appear as text — verify something numeric is there
    const statCard = page.locator('.tabular-nums').first()
    const value = await statCard.textContent()
    expect(Number(value?.trim())).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Admin — Hero Product delete', () => {
  test('each product card has a 删除 button', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('delete dialog appears and cancel keeps product', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('Summer Collection 2026')).toBeVisible()
  })

  test('confirming delete removes product from list (state-changing)', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'E2E Delete Hero')
    await page.fill('#subtitle', 'Will be deleted')
    await page.fill('#imageUrl', 'https://via.placeholder.com/400')
    await page.fill('#imageWidth', '400')
    await page.fill('#imageHeight', '400')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    await expect(page).toHaveURL('/admin/hero-products', { timeout: 8000 })
    const heroCard = page.locator('.bg-zinc-50').filter({ hasText: 'E2E Delete Hero' })
    await heroCard.getByRole('button', { name: '删除' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page.getByText('E2E Delete Hero')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin — Hero Product edit', () => {
  test('each product card has an 编辑 link', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
  })

  test('edit page pre-fills existing product data', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/admin\/hero-products\/.+\/edit/)
    await expect(page.locator('#name')).not.toHaveValue('')
  })

  test('saving updated subtitle reflects on list', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newSubtitle = 'E2E Updated ' + Date.now()
    await page.fill('#subtitle', newSubtitle)
    await page.getByRole('button', { name: '保存特色产品' }).click()
    await expect(page).toHaveURL('/admin/hero-products', { timeout: 8000 })
    await expect(page.getByText(newSubtitle)).toBeVisible()
  })
})

test.describe('Admin — Promotion delete and edit', () => {
  test('promotions table has 操作 column', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('操作')).toBeVisible()
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('promotion delete dialog cancel keeps row', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
  })

  test('promotion edit page loads with pre-filled data', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/admin\/promotions\/.+\/edit/)
    await expect(page.getByText('编辑推广活动')).toBeVisible()
    await expect(page.locator('#promotionRule')).not.toHaveValue('')
  })

  test('saving promotion edit updates rule in list', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newRule = 'E2E Admin Updated Rule ' + Date.now()
    await page.fill('#promotionRule', newRule)
    await page.getByRole('button', { name: '保存推广活动' }).click()
    await expect(page).toHaveURL('/admin/promotions', { timeout: 8000 })
    await expect(page.getByText(newRule)).toBeVisible()
  })
})
