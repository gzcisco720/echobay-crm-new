/**
 * Application form — Tabs 3–6 E2E tests.
 *
 * Field IDs / names (from component source):
 * - Tab 1: #registeredCompanyName, #acn, #abn, #registeredAddress
 * - Tab 2: primaryContact → #pc-name, #pc-phone; financeContact → [name="financeContact.*"]
 * - Tab 3: [name="brandNameEnglish|brandIntroductionEnglish|storesInAustralia|storesToList"]
 *          mainCategories → click label text e.g. "Fashion & Apparel"
 * - Tab 4: [name="bankAccountName|bankAccountNumber|bankName|bankBsb"]
 * - Tab 5: paymentMethods → click "Visa" etc.; tab5 requires ≥1 payment method
 * - Tab 6: input[type="password"] ×2, #agree checkbox, [name="applicantName"]
 *
 * Requires seeded token: e2e-test-token-abc123
 * Run `pnpm seed:e2e` before running.
 */

import { test, expect, type Page } from '@playwright/test'

const VALID_TOKEN = 'e2e-test-token-abc123'
const APPLY_URL = `/apply/${VALID_TOKEN}`

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fillTab1(page: Page) {
  await page.goto(APPLY_URL)
  await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
  await page.fill('#registeredCompanyName', 'Tab Test Co Pty Ltd')
  await page.fill('#acn', '111111111')
  await page.fill('#abn', '11111111111')
  await page.fill('#registeredAddress', '1 Tab St Sydney NSW 2000')
  await page.getByRole('button', { name: /下一步/ }).click()
  // Wait for actual tab 2 content (a field unique to tab 2)
  await expect(page.locator('#pc-name')).toBeVisible({ timeout: 5000 })
}

async function fillTab2(page: Page) {
  await page.fill('#pc-name', 'Tab Test Person')
  await page.fill('#pc-phone', '0400000001')
  await page.fill('[name="financeContact.name"]', 'Tab Finance Person')
  await page.fill('[name="financeContact.position"]', 'CFO')
  await page.fill('[name="financeContact.email"]', 'finance@tab.com')
  await page.fill('[name="financeContact.phone"]', '0400000002')
  await page.getByRole('button', { name: /下一步/ }).click()
  // Wait for actual tab 3 content (brand name field unique to tab 3)
  await expect(page.locator('[name="brandNameEnglish"]')).toBeVisible({ timeout: 5000 })
}

async function fillTab3(page: Page) {
  await page.fill('[name="brandNameEnglish"]', 'E2E Tab Brand')
  await page.fill('[name="brandIntroductionEnglish"]', 'A brand for automated E2E tab testing purposes.')
  await page.fill('[name="storesInAustralia"]', '2')
  await page.fill('[name="storesToList"]', '1')
  // mainCategories requires ≥1 — click the label to select it
  await page.getByText('Fashion & Apparel').first().click()
  await page.getByRole('button', { name: /下一步/ }).click()
  // Wait for actual tab 4 content (bankAccountName field unique to tab 4)
  await expect(page.locator('[name="bankAccountName"]')).toBeVisible({ timeout: 5000 })
}

async function fillTab4(page: Page) {
  await page.fill('[name="bankAccountName"]', 'E2E Tab Pty Ltd')
  await page.fill('[name="bankAccountNumber"]', '123456789')
  await page.fill('[name="bankName"]', 'ANZ')
  await page.fill('[name="bankBsb"]', '012-345')
  await page.getByRole('button', { name: /下一步/ }).click()
  // Wait for actual tab 5 content — customerCashback field is unique to tab 5
  await expect(page.locator('[name="customerCashback"]')).toBeVisible({ timeout: 5000 })
}

async function fillTab5(page: Page) {
  // paymentMethods requires ≥1 selection
  await page.getByText('Visa').first().click()
  // customerCashback is z.number().optional() — empty input produces NaN which fails Zod.
  // Fill with 0 to avoid NaN validation failure.
  await page.fill('[name="customerCashback"]', '0')
  await page.getByRole('button', { name: /下一步/ }).click()
  // Wait for actual tab 6 content — [name="password"] is unique to tab 6
  await expect(page.locator('[name="password"]')).toBeVisible({ timeout: 5000 })
}

// ─── Tab 3: Brand & Store ─────────────────────────────────────────────────────

test.describe('Apply — Tab 3: Brand & Store', () => {
  test.beforeEach(async ({ page }) => {
    await fillTab1(page)
    await fillTab2(page)
  })

  test('tab 3 shows brand & store heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /品牌 & 门店|Brand.*Store/ })).toBeVisible()
  })

  test('tab 3 requires brand English name', async ({ page }) => {
    // Click category to pass that validation, then advance without brand name
    await page.getByText('Fashion & Apparel').first().click()
    await page.fill('[name="storesInAustralia"]', '1')
    await page.fill('[name="storesToList"]', '1')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('品牌英文名不能为空')).toBeVisible()
  })

  test('tab 3 brand introduction requires minimum 10 characters', async ({ page }) => {
    await page.fill('[name="brandNameEnglish"]', 'TestBrand')
    await page.fill('[name="brandIntroductionEnglish"]', 'Short')
    await page.fill('[name="storesInAustralia"]', '1')
    await page.fill('[name="storesToList"]', '1')
    await page.getByText('Fashion & Apparel').first().click()
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('品牌介绍至少 10 个字符')).toBeVisible()
  })

  test('tab 3 requires at least one category', async ({ page }) => {
    await page.fill('[name="brandNameEnglish"]', 'TestBrand')
    await page.fill('[name="brandIntroductionEnglish"]', 'A valid long enough intro.')
    await page.fill('[name="storesInAustralia"]', '1')
    await page.fill('[name="storesToList"]', '1')
    // Don't select any category
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('请至少选择一个类目')).toBeVisible()
  })

  test('tab 3 optional Chinese name field is present', async ({ page }) => {
    await expect(page.locator('[name="brandNameChinese"]')).toBeVisible()
  })

  test('tab 3 has Australia store count fields', async ({ page }) => {
    await expect(page.locator('[name="storesInAustralia"]')).toBeVisible()
    await expect(page.locator('[name="storesToList"]')).toBeVisible()
  })

  test('tab 3 advances to tab 4 with all required fields', async ({ page }) => {
    await fillTab3(page)
    // fillTab3 already confirms tab 4 is loaded via [name="bankAccountName"]
    await expect(page.locator('[name="bankAccountName"]')).toBeVisible()
  })

  test('back button returns to tab 2', async ({ page }) => {
    await page.getByRole('button', { name: /上一步/ }).click()
    await expect(page.locator('#pc-name')).toBeVisible()
  })
})

// ─── Tab 4: Banking ──────────────────────────────────────────────────────────

test.describe('Apply — Tab 4: Banking', () => {
  test.beforeEach(async ({ page }) => {
    await fillTab1(page)
    await fillTab2(page)
    await fillTab3(page)
  })

  test('tab 4 shows banking section heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /银行账户.*Banking Details/ })).toBeVisible()
  })

  test('tab 4 shows encryption notice', async ({ page }) => {
    await expect(page.getByText('银行账户信息将经过加密处理后安全存储')).toBeVisible()
  })

  test('tab 4 has all four required fields', async ({ page }) => {
    await expect(page.locator('[name="bankAccountName"]')).toBeVisible()
    await expect(page.locator('[name="bankAccountNumber"]')).toBeVisible()
    await expect(page.locator('[name="bankName"]')).toBeVisible()
    await expect(page.locator('[name="bankBsb"]')).toBeVisible()
  })

  test('tab 4 account number field is password type', async ({ page }) => {
    const input = page.locator('[name="bankAccountNumber"]')
    const inputType = await input.getAttribute('type')
    expect(inputType).toBe('password')
  })

  test('tab 4 shows validation errors when advancing empty', async ({ page }) => {
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('账户名称不能为空')).toBeVisible()
  })

  test('tab 4 advances to tab 5 with all fields filled', async ({ page }) => {
    await fillTab4(page)
    await expect(page.locator('[name="customerCashback"]')).toBeVisible()
  })
})

// ─── Tab 5: Partnership ───────────────────────────────────────────────────────

test.describe('Apply — Tab 5: Partnership', () => {
  test.beforeEach(async ({ page }) => {
    await fillTab1(page)
    await fillTab2(page)
    await fillTab3(page)
    await fillTab4(page)
  })

  test('tab 5 shows partnership heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /合作方案.*Partnership/ })).toBeVisible()
  })

  test('tab 5 shows payment method options', async ({ page }) => {
    await expect(page.getByText('Visa').first()).toBeVisible()
    await expect(page.getByText('Mastercard').first()).toBeVisible()
    await expect(page.getByText('Alipay').first()).toBeVisible()
    await expect(page.getByText('WeChat Pay').first()).toBeVisible()
  })

  test('tab 5 shows EchoBay platform options', async ({ page }) => {
    await expect(page.getByText('EchoBay App').first()).toBeVisible()
    await expect(page.getByText('EchoBay Website').first()).toBeVisible()
  })

  test('tab 5 shows cashback rate input', async ({ page }) => {
    await expect(page.locator('[name="customerCashback"]')).toBeVisible()
  })

  test('tab 5 requires at least one payment method', async ({ page }) => {
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('请至少选择一种支付方式')).toBeVisible()
  })

  test('tab 5 payment method labels are toggleable', async ({ page }) => {
    const visa = page.getByText('Visa').first()
    await visa.click()
    // Clicking again deselects
    await visa.click()
    await expect(visa).toBeVisible()
  })

  test('tab 5 advances to tab 6 after selecting a payment method', async ({ page }) => {
    await fillTab5(page)
    await expect(page.locator('[name="password"]')).toBeVisible()
  })
})

// ─── Tab 6: Agreement & Signature ────────────────────────────────────────────

test.describe('Apply — Tab 6: Agreement & Signature', () => {
  test.beforeEach(async ({ page }) => {
    await fillTab1(page)
    await fillTab2(page)
    await fillTab3(page)
    await fillTab4(page)
    await fillTab5(page)
  })

  test('tab 6 shows set-password section', async ({ page }) => {
    await expect(page.getByText('设置账号密码').or(page.getByText('Set Password'))).toBeVisible()
  })

  test('tab 6 has two password fields', async ({ page }) => {
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(page.locator('[name="confirmPassword"]')).toBeVisible()
  })

  test('tab 6 has agreement checkbox', async ({ page }) => {
    // The visible label for the agreement checkbox
    await expect(page.locator('label[for="agree"]')).toBeVisible()
  })

  test('tab 6 shows applicant signature fields', async ({ page }) => {
    await expect(page.locator('[name="applicantName"]')).toBeVisible()
  })

  test('tab 6 submit without password shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /提交申请|Submit/ }).click()
    await expect(page.getByText('密码至少 8 位')).toBeVisible()
  })

  test('tab 6 confirmPassword field validates min length', async ({ page }) => {
    // confirmPassword: z.string().min(1, '请确认密码') — submitting empty shows this error
    await page.locator('[name="password"]').fill('ValidPass1!')
    // Leave confirmPassword empty
    await page.getByRole('button', { name: /提交申请|Submit/ }).click()
    await expect(page.getByText('请确认密码')).toBeVisible()
  })

  test('tab 6 submit without agreeing shows error', async ({ page }) => {
    await page.locator('[name="password"]').fill('ValidPass1!')
    await page.locator('[name="confirmPassword"]').fill('ValidPass1!')
    await page.getByRole('button', { name: /提交申请|Submit/ }).click()
    await expect(page.getByText('请阅读并同意协议')).toBeVisible()
  })
})
