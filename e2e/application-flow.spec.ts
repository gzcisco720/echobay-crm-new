import { test, expect } from '@playwright/test'

// These tests require:
// 1. pnpm dev server running on localhost:3000
// 2. A valid MongoDB connection in .env.local
// 3. A seeded invitation token (use the seed script: pnpm seed:e2e)

const VALID_TOKEN = process.env.E2E_TEST_TOKEN ?? 'e2e-test-token-abc123'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-merchant@test.com'

test.describe('Merchant Application Flow', () => {
  test('invalid token shows error page', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz')
    await expect(page.getByText('链接无效')).toBeVisible()
  })

  test('valid token loads the application form', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible()
    await expect(page.getByText(TEST_EMAIL)).toBeVisible()
    await expect(page.getByText('① 公司信息')).toBeVisible()
  })

  test('tab 1 validates required fields', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('公司名称不能为空').or(page.getByText('不能为空'))).toBeVisible()
  })

  test('tab navigation works after filling tab 1', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await page.fill('[id="registeredCompanyName"]', 'E2E Test Pty Ltd')
    await page.fill('[id="acn"]', '123456789')
    await page.fill('[id="abn"]', '12345678901')
    await page.fill('[id="registeredAddress"]', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('联系人信息')).toBeVisible()
  })
})
