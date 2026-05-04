/**
 * Role-based access control E2E tests.
 *
 * Verifies that:
 * - Unauthenticated users cannot access protected routes
 * - Merchants cannot access admin routes
 * - Admins are redirected away from merchant routes (or see login)
 */

import { test, expect } from '@playwright/test'

// ─── Merchant cannot access admin routes ────────────────────────────────────

test.describe('Access Control — Merchant blocked from admin routes', () => {
  test.use({ storageState: 'e2e/.auth/merchant.json' })

  const adminRoutes = [
    '/admin/dashboard',
    '/admin/applications',
    '/admin/invitations',
    '/admin/merchants',
    '/admin/brands',
    '/admin/stores',
    '/admin/promotions',
    '/admin/hero-products',
  ]

  for (const route of adminRoutes) {
    test(`merchant accessing ${route} is redirected to login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    })
  }
})

// ─── Unauthenticated users blocked from all protected routes ────────────────

test.describe('Access Control — Unauthenticated blocked from all protected routes', () => {
  const protectedRoutes = [
    '/admin/dashboard',
    '/admin/applications',
    '/admin/invitations',
    '/admin/merchants',
    '/admin/brands',
    '/admin/stores',
    '/admin/promotions',
    '/admin/hero-products',
    '/merchant/dashboard',
    '/merchant/application',
    '/merchant/documents',
    '/merchant/brand',
    '/merchant/store',
    '/merchant/promotions',
  ]

  for (const route of protectedRoutes) {
    test(`unauthenticated access to ${route} redirects to login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    })
  }
})

// ─── Public routes accessible without auth ──────────────────────────────────

test.describe('Access Control — Public routes are accessible', () => {
  test('login page is publicly accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('欢迎回来')).toBeVisible()
  })

  test('forgot password page is publicly accessible', async ({ page }) => {
    await page.goto('/login/forgot-password')
    await expect(page).toHaveURL('/login/forgot-password')
    await expect(page.getByText('找回密码')).toBeVisible()
  })

  test('reset password page is publicly accessible', async ({ page }) => {
    await page.goto('/login/reset-password')
    await expect(page).toHaveURL('/login/reset-password')
    await expect(page.getByText('无效的重置链接')).toBeVisible()
  })

  test('apply page with valid token is publicly accessible', async ({ page }) => {
    await page.goto('/apply/e2e-test-token-abc123')
    // Should NOT redirect to login
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByText('EchoBay CRM')).toBeVisible()
  })

  test('apply page with invalid token shows error (not login)', async ({ page }) => {
    await page.goto('/apply/definitely-invalid-token-xyz')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByText('链接无效')).toBeVisible()
  })
})

// ─── Admin user is correctly scoped to admin portal ──────────────────────────

test.describe('Access Control — Admin redirected from merchant routes', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('admin accessing /merchant/dashboard is redirected', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    // Admin is redirected to login (role check fails)
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
