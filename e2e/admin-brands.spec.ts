import { test, expect } from '@playwright/test'

test.describe('Admin — Brands', () => {
  test('brands page loads and shows seeded brand', async ({ page }) => {
    await page.goto('/admin/brands')
    await expect(page.getByText('品牌管理').or(page.getByText('Brands'))).toBeVisible()
    await expect(page.getByText('ApprovedBrand')).toBeVisible()
  })

  test('brand detail page shows full info', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await expect(page.getByText('公司信息')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('联系人')).toBeVisible()
    await expect(page.getByText('支付与平台')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
    await expect(page.getByText('Alice Smith')).toBeVisible()
  })

  test('brand detail has link to original application', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await expect(page.getByText('查看原始申请')).toBeVisible()
  })

  test('brand detail has link to bank accounts', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await expect(page.getByText('银行账户管理')).toBeVisible()
  })

  test('bank accounts page loads for brand', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await page.getByText('银行账户管理').click()
    await expect(page.getByText('银行账户').or(page.getByText('Bank'))).toBeVisible()
    await expect(page.getByText('添加新银行账户')).toBeVisible()
  })

  test('can add bank account from brand page', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await page.getByText('银行账户管理').click()
    await page.fill('#accountName', 'Approved Brand Pty Ltd')
    await page.fill('#bankName', 'ANZ')
    await page.fill('#bsb', '012-345')
    await page.fill('#accountNumber', '987654321')
    await page.getByRole('button', { name: /添加银行账户/ }).click()
    await expect(page.getByText('Approved Brand Pty Ltd').or(page.getByText('ANZ'))).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin — Merchants', () => {
  test('merchants list loads showing approved merchants', async ({ page }) => {
    await page.goto('/admin/merchants')
    await expect(page.getByText('商户管理').or(page.getByText('Merchants'))).toBeVisible()
    await expect(page.getByText('ApprovedBrand')).toBeVisible()
  })

  test('merchant detail page shows profile', async ({ page }) => {
    await page.goto('/admin/merchants')
    await page.getByText('ApprovedBrand').first().click()
    await expect(page.getByText('账号信息')).toBeVisible()
    await expect(page.getByText('merchant-approved@test.com')).toBeVisible()
    await expect(page.getByText('查看完整申请详情')).toBeVisible()
  })
})
