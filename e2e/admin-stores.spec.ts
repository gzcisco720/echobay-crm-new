import { test, expect } from '@playwright/test'

test.describe('Admin — Stores', () => {
  test('stores list page loads and shows seeded store', async ({ page }) => {
    await page.goto('/admin/stores')
    await expect(page.getByText('门店管理').or(page.getByText('Stores'))).toBeVisible()
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
  })

  test('store detail page shows all fields', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await expect(page.getByText('基本信息')).toBeVisible()
    await expect(page.getByText('门店介绍')).toBeVisible()
    await expect(page.getByText('100 George St, Sydney NSW 2000')).toBeVisible()
    await expect(page.getByText('Mon-Sun 9am-6pm')).toBeVisible()
    await expect(page.getByText('Premium quality').or(page.getByText('亮点'))).toBeVisible()
    // Edit link present
    await expect(page.getByText('编辑')).toBeVisible()
  })

  test('new store page loads with brand selector', async ({ page }) => {
    await page.goto('/admin/stores/new')
    await expect(page.getByText('新增门店')).toBeVisible()
    await expect(page.getByLabel('品牌')).toBeVisible()
    await expect(page.getByLabel('门店英文名称')).toBeVisible()
  })

  test('creating a store with all fields redirects to stores list', async ({ page }) => {
    await page.goto('/admin/stores/new')
    await page.fill('#nameEnglishBranch', 'E2E Test Store Branch')
    await page.fill('#addressEnglish', '99 Test Ave, Melbourne VIC 3000')
    await page.fill('#phone', '0388880000')
    await page.fill('#storeType', 'Outlet')
    await page.fill('#businessCategory', 'Fashion & Apparel')
    await page.fill('#businessHours', 'Mon-Fri 9am-5pm')
    await page.fill('#introduction', 'An E2E test store for automated testing.')
    await page.fill('input[placeholder="亮点 1"]', 'Great prices')
    await page.getByRole('button', { name: /创建门店/ }).click()
    await expect(page).toHaveURL('/admin/stores', { timeout: 8000 })
    await expect(page.getByText('E2E Test Store Branch')).toBeVisible()
  })

  test('edit store page pre-fills existing data', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await page.getByText('编辑').click()
    const nameInput = page.locator('#nameEnglishBranch')
    await expect(nameInput).toHaveValue('ApprovedBrand Sydney CBD')
  })
})
