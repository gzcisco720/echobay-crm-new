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

  test('edit store — save updated business hours', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await page.getByText('编辑').click()
    await page.fill('#businessHours', 'Mon-Fri 9am-5pm, Sat 10am-4pm')
    await page.getByRole('button', { name: /保存/ }).click()
    await expect(page).toHaveURL(/\/admin\/stores/, { timeout: 8000 })
    // Verify the updated value is reflected
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await expect(page.getByText('Mon-Fri 9am-5pm, Sat 10am-4pm').or(page.getByText('Mon-Fri'))).toBeVisible()
  })

  test('edit store — required fields cannot be cleared', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await page.getByText('编辑').click()
    // Clear a required field
    await page.fill('#nameEnglishBranch', '')
    await page.getByRole('button', { name: /保存/ }).click()
    await expect(
      page.getByText(/必填/).or(page.getByText(/不能为空/).or(page.getByText(/required/i)))
    ).toBeVisible({ timeout: 5000 })
  })

  test('new store — required fields validation', async ({ page }) => {
    await page.goto('/admin/stores/new')
    // Try submitting empty form
    await page.getByRole('button', { name: /创建门店/ }).click()
    await expect(
      page.getByText(/必填/).or(page.getByText(/不能为空/).or(page.getByText(/required/i)))
    ).toBeVisible({ timeout: 5000 })
  })

  test('store detail has a delete button', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await expect(page.getByRole('button', { name: '删除门店' })).toBeVisible()
  })
})

test.describe('Admin — Store delete', () => {
  test('delete button shows confirmation dialog', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await expect(page.getByRole('button', { name: '删除门店' })).toBeVisible()
    await page.getByRole('button', { name: '删除门店' }).click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await expect(page.getByText('此操作不可撤销')).toBeVisible()
  })

  test('cancel on delete dialog keeps store intact', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await page.getByRole('button', { name: '删除门店' }).click()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
  })

  test('confirming delete removes store and redirects to list (state-changing)', async ({ page }) => {
    await page.goto('/admin/stores/new')
    await page.fill('#nameEnglishBranch', 'E2E Delete Me Store')
    await page.fill('#addressEnglish', '1 Delete St Melbourne VIC 3000')
    await page.fill('#phone', '0311110000')
    await page.fill('#storeType', 'Kiosk')
    await page.fill('#businessCategory', 'Food & Beverage')
    await page.fill('#businessHours', 'Mon-Fri 9am-5pm')
    await page.fill('#introduction', 'This store will be deleted by E2E test.')
    await page.getByRole('button', { name: /创建门店/ }).click()
    await expect(page).toHaveURL('/admin/stores', { timeout: 8000 })
    await page.getByText('E2E Delete Me Store').first().click()
    await page.getByRole('button', { name: '删除门店' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page).toHaveURL('/admin/stores', { timeout: 8000 })
    await expect(page.getByText('E2E Delete Me Store')).not.toBeVisible({ timeout: 5000 })
  })
})
