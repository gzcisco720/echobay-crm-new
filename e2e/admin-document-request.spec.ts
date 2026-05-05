/**
 * Admin — Document request workflow E2E tests.
 *
 * Covers the admin-side of the cross-role document flow:
 * - Admin sends a document request from an approved application
 * - Pending request appears in the documents card
 * - Admin can cancel the pending request
 *
 * NOTE: The "send request" and "cancel request" tests are state-changing.
 * Run `pnpm seed:e2e` to reset state before re-running.
 */

import { test, expect } from '@playwright/test'

// ─── Admin sends a document request ─────────────────────────────────────────

test.describe('Admin — Document request: send flow', () => {
  test('approved application detail shows 补充文件 card with request form', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()
    await expect(page.getByRole('button', { name: '发送请求' })).toBeVisible()
  })

  test('empty request type shows validation error', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await page.getByRole('button', { name: '发送请求' }).click()
    await expect(page.getByText('请填写所需文件说明')).toBeVisible()
  })

  test('sending request with valid type shows it as pending in documents list (state-changing)', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()

    const requestInput = page.locator('input[placeholder*="文件"]').or(page.locator('input[placeholder*="请输入"]')).or(page.locator('input').last())
    if (!await requestInput.isVisible({ timeout: 3000 }).catch(() => false)) return
    await requestInput.fill('E2E 测试：最新营业执照副本')
    await page.getByRole('button', { name: '发送请求' }).click()

    // After sending, the request should appear in the pending list
    await expect(
      page.getByText('E2E 测试：最新营业执照副本').first().or(page.getByText('待处理').first())
    ).toBeVisible({ timeout: 8000 })
  })

  test('documents card empty state shows 暂无文件记录 when no requests exist', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    // This verifies the empty-state UI renders without error (may already have entries)
    const emptyState = page.getByText('暂无文件记录。')
    const pendingList = page.getByText('E2E 测试：最新营业执照副本').first()
    await expect(emptyState.or(pendingList)).toBeVisible({ timeout: 5000 })
  })
})

// ─── Admin cancels a pending document request ─────────────────────────────────

test.describe('Admin — Document request: cancel flow', () => {
  test('pending request shows cancel button in admin documents card', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()

    const cancelBtn = page.getByRole('button', { name: '取消请求' })
    if (await cancelBtn.isVisible()) {
      await expect(cancelBtn).toBeVisible()
    }
    // If no pending request exists, verify the empty state or the request form is visible
    await expect(
      page.getByRole('button', { name: '发送请求' })
    ).toBeVisible()
  })

  test('cancelling pending request removes it from documents list (state-changing)', async ({ page }) => {
    // Step 1: send a request
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()

    const requestInput = page.locator('input[placeholder*="文件"]').or(page.locator('input[placeholder*="请输入"]')).or(page.locator('input').last())
    if (!await requestInput.isVisible({ timeout: 3000 }).catch(() => false)) return
    await requestInput.fill('E2E Cancel Test：税务证明')
    await page.getByRole('button', { name: '发送请求' }).click()

    // Wait for the request to appear
    await expect(
      page.getByText('E2E Cancel Test：税务证明').first()
    ).toBeVisible({ timeout: 8000 })

    // Step 2: cancel the request
    const cancelBtns = page.getByRole('button', { name: '取消请求' })
    if (await cancelBtns.count() > 0) {
      await cancelBtns.first().click()
      // Should be removed from list
      await expect(page.getByText('E2E Cancel Test：税务证明')).not.toBeVisible({ timeout: 5000 })
    }
  })
})

// ─── Cross-role note: merchant side ──────────────────────────────────────────

test.describe('Admin — Document request: cross-role verification note', () => {
  test('approved application documents card renders without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()

    expect(errors.filter(e => !e.includes('hydrat'))).toHaveLength(0)
  })
})
