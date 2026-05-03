import { test, expect } from '@playwright/test'

const VALID_TOKEN = 'e2e-test-token-abc123'
const APPLY_EMAIL = 'e2e-merchant@test.com'

test.describe('Merchant Application — Token validation', () => {
  test('invalid token shows error page', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz-999')
    await expect(page.getByText('链接无效')).toBeVisible()
  })

  test('valid token loads the application form', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(APPLY_EMAIL)).toBeVisible()
    await expect(page.getByText('① 公司信息')).toBeVisible()
  })
})

test.describe('Merchant Application — Tab 1: Company info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
  })

  test('clicking next without filling shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(
      page.getByText(/不能为空/).or(page.getByText(/必填/)).or(page.getByText(/required/i))
    ).toBeVisible()
  })

  test('fills tab 1 and advances to tab 2', async ({ page }) => {
    await page.fill('#registeredCompanyName', 'E2E Test Co Pty Ltd')
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('② 联系人信息').or(page.getByText('联系人信息'))).toBeVisible()
  })
})

test.describe('Merchant Application — Tab navigation', () => {
  test('can navigate back to previous tab', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
    await page.fill('#registeredCompanyName', 'E2E Test Co Pty Ltd')
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('联系人信息')).toBeVisible()
    await page.getByRole('button', { name: /上一步/ }).click()
    await expect(page.getByText('① 公司信息').or(page.getByText('公司信息'))).toBeVisible()
  })
})
