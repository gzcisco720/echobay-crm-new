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

test.describe('Admin — Promotions', () => {
  test('promotions page loads and shows seeded promotion', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('推广活动').or(page.getByText('Promotions'))).toBeVisible()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
    await expect(page.getByText('品牌级')).toBeVisible()
  })

  test('promotions list shows status badge', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('活跃')).toBeVisible()
  })
})

test.describe('Admin — Dashboard', () => {
  test('admin dashboard loads with stats', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('数据概览').or(page.getByText('Dashboard'))).toBeVisible()
  })
})
