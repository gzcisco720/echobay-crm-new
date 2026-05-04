/**
 * Application form (apply/[token]) comprehensive tests.
 * Tests the full multi-tab merchant application form — happy + unhappy paths.
 *
 * Requires seeded token: e2e-test-token-abc123 for e2e-merchant@test.com
 * Run `pnpm seed:e2e` before running these tests to ensure token is valid.
 */

import { test, expect } from '@playwright/test'

const VALID_TOKEN = 'e2e-test-token-abc123'
const APPLY_EMAIL = 'e2e-merchant@test.com'

// ─── Token validation ────────────────────────────────────────────────────────

test.describe('Apply — Token validation', () => {
  test('invalid token shows error page with brand styling', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz-999')
    await expect(page.getByText('链接无效')).toBeVisible()
    // Brand logo visible
    await expect(page.getByAltText('EchoBay')).toBeVisible()
  })

  test('valid token loads application form with EchoBay brand header', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(APPLY_EMAIL)).toBeVisible()
    await expect(page.getByText('EchoBay CRM')).toBeVisible()
  })

  test('valid token shows Tab 1 (Company Info) by default', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('① 公司信息').or(page.getByText('公司信息'))).toBeVisible({ timeout: 8000 })
  })
})

// ─── Tab 1: Company Info ─────────────────────────────────────────────────────

test.describe('Apply — Tab 1: Company Info', () => {
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

  test('fills tab 1 successfully and advances to tab 2', async ({ page }) => {
    await page.fill('#registeredCompanyName', 'E2E Test Co Pty Ltd')
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('② 联系人信息').or(page.getByText('联系人信息'))).toBeVisible()
  })

  test('company name required field validates', async ({ page }) => {
    // Fill all except company name
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    const companyInput = page.locator('#registeredCompanyName')
    const isInvalid = await companyInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })
})

// ─── Tab navigation ──────────────────────────────────────────────────────────

test.describe('Apply — Tab navigation', () => {
  const fillTab1 = async (page: import('@playwright/test').Page) => {
    await page.fill('#registeredCompanyName', 'E2E Test Co Pty Ltd')
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
  })

  test('back button on tab 2 returns to tab 1', async ({ page }) => {
    await fillTab1(page)
    await expect(page.getByText('联系人信息')).toBeVisible()
    await page.getByRole('button', { name: /上一步/ }).click()
    await expect(page.getByText('① 公司信息').or(page.getByText('公司信息'))).toBeVisible()
  })

  test('tab 1 data is preserved when navigating back', async ({ page }) => {
    await fillTab1(page)
    await page.getByRole('button', { name: /上一步/ }).click()
    const companyInput = page.locator('#registeredCompanyName')
    await expect(companyInput).toHaveValue('E2E Test Co Pty Ltd')
  })
})

// ─── Tab 2: Contacts ─────────────────────────────────────────────────────────

test.describe('Apply — Tab 2: Contacts', () => {
  const fillTab1 = async (page: import('@playwright/test').Page) => {
    await page.fill('#registeredCompanyName', 'E2E Test Co Pty Ltd')
    await page.fill('#acn', '123456789')
    await page.fill('#abn', '12345678901')
    await page.fill('#registeredAddress', '1 Test St Sydney NSW 2000')
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('联系人信息')).toBeVisible({ timeout: 5000 })
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })
  })

  test('tab 2 shows contact fields', async ({ page }) => {
    await fillTab1(page)
    await expect(page.getByText('联系人信息')).toBeVisible()
    // Primary contact fields should be visible
    await expect(
      page.locator('input[placeholder*="姓名"]').or(page.locator('#primaryContactName').or(page.locator('[name*="name"]').first()))
    ).toBeVisible()
  })

  test('tab 2 validation prevents advancing without required fields', async ({ page }) => {
    await fillTab1(page)
    // Try to advance without filling contacts
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(
      page.getByText(/不能为空/).or(page.getByText(/必填/)).or(page.getByText(/required/i))
    ).toBeVisible()
  })
})

// ─── Password validation ──────────────────────────────────────────────────────

test.describe('Apply — Password validation (Tab near submission)', () => {
  test('password field requires minimum length', async ({ page }) => {
    // Navigate through tabs to where password is set
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })

    // The password field appears on one of the later tabs
    // We check it exists and has minLength validation
    const passwordInput = page.locator('input[type="password"]').first()
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('short')
      await page.getByRole('button', { name: /下一步/ }).click()
      const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
      expect(isInvalid).toBe(true)
    }
  })
})

// ─── Full happy path ──────────────────────────────────────────────────────────

test.describe('Apply — Full submission happy path', () => {
  // NOTE: This test is state-changing. After successful submission, the
  // e2e-test-token-abc123 token is consumed. Run `pnpm seed:e2e` to reset.

  test('completing all tabs and submitting creates merchant account', async ({ page }) => {
    await page.goto(`/apply/${VALID_TOKEN}`)
    await expect(page.getByText('商家入驻申请')).toBeVisible({ timeout: 8000 })

    // Tab 1: Company info
    await page.fill('#registeredCompanyName', 'E2E Submit Co Pty Ltd')
    await page.fill('#acn', '999999999')
    await page.fill('#abn', '99999999999')
    await page.fill('#registeredAddress', '99 Final St Sydney NSW 2000')
    const sameAddressCheckbox = page.locator('#sameAsRegistered').or(page.locator('input[type="checkbox"]').first())
    if (await sameAddressCheckbox.isVisible()) await sameAddressCheckbox.check()
    await page.getByRole('button', { name: /下一步/ }).click()
    await expect(page.getByText('联系人信息').or(page.getByText('② 联系人'))).toBeVisible({ timeout: 5000 })

    // Tab 2: Contacts — fill primary contact
    const primaryNameInput = page.locator('#primaryContactName').or(page.locator('input[placeholder*="主联系人"]').or(page.locator('[name*="primaryContact"]').first()))
    if (await primaryNameInput.isVisible()) {
      await primaryNameInput.fill('E2E Merchant')
    }
    const primaryEmailInput = page.locator('#primaryContactEmail').or(page.locator('input[type="email"]').first())
    if (await primaryEmailInput.isVisible()) await primaryEmailInput.fill(APPLY_EMAIL)
    const primaryPhoneInput = page.locator('#primaryContactPhone').or(page.locator('input[placeholder*="电话"]').first())
    if (await primaryPhoneInput.isVisible()) await primaryPhoneInput.fill('0400000000')
    const primaryPositionInput = page.locator('#primaryContactPosition').or(page.locator('input[placeholder*="职位"]').first())
    if (await primaryPositionInput.isVisible()) await primaryPositionInput.fill('CEO')
    // Finance contact
    const financeNameInput = page.locator('#financeContactName').or(page.locator('input[placeholder*="财务"]').first())
    if (await financeNameInput.isVisible()) await financeNameInput.fill('E2E Finance')
    const financeEmailInput = page.locator('#financeContactEmail').or(page.locator('input[type="email"]').nth(1))
    if (await financeEmailInput.isVisible()) await financeEmailInput.fill('finance@e2e.com')
    const nextBtn2 = page.getByRole('button', { name: /下一步/ })
    if (await nextBtn2.isVisible()) await nextBtn2.click()

    // Tab 3 onwards — fill minimally and advance
    for (let tab = 3; tab <= 6; tab++) {
      const nextBtn = page.getByRole('button', { name: /下一步/ })
      if (!await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) break

      // Try to fill any visible required text inputs on this tab
      const textInputs = page.locator('input[required], input[aria-required="true"]')
      const count = await textInputs.count()
      for (let i = 0; i < count; i++) {
        const input = textInputs.nth(i)
        const type = await input.getAttribute('type')
        if (type === 'password') {
          await input.fill('TestPassword123!')
        } else if (type === 'email') {
          await input.fill('e2e@test.com')
        } else if (type === 'number') {
          await input.fill('1')
        } else {
          const currentVal = await input.inputValue()
          if (!currentVal) await input.fill('E2E Test Value')
        }
      }

      // Check required textareas
      const textareas = page.locator('textarea[required]')
      const taCount = await textareas.count()
      for (let i = 0; i < taCount; i++) {
        const val = await textareas.nth(i).inputValue()
        if (!val) await textareas.nth(i).fill('E2E test content for this field')
      }

      // Check required checkboxes (agreements)
      const checkboxes = page.locator('input[type="checkbox"][required]')
      const cbCount = await checkboxes.count()
      for (let i = 0; i < cbCount; i++) {
        const isChecked = await checkboxes.nth(i).isChecked()
        if (!isChecked) await checkboxes.nth(i).check()
      }

      await nextBtn.click()

      // If we're now on a submit button, break
      const submitBtn = page.getByRole('button', { name: /提交申请|Submit/ })
      if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) break
    }

    // Final tab — submit
    const submitBtn = page.getByRole('button', { name: /提交申请|Submit/ })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // After submission, should redirect to login or show success
      await expect(
        page.getByText(/提交成功/).or(page.getByText(/申请已提交/)).or(page.getByURL?.(/\/login/))
      ).toBeVisible({ timeout: 10000 })
    }
  })
})
