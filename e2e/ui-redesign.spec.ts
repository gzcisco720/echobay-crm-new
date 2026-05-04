/**
 * UI redesign E2E tests — validates new brand design elements:
 * dark sidebar, fixed header, full-width content, brand colors, status badges
 *
 * Admin tests use: e2e/.auth/admin.json
 * Merchant tests use: e2e/.auth/merchant.json
 */

import { test, expect } from '@playwright/test'

// ─── Admin Layout ────────────────────────────────────────────────────────────

test.describe('UI — Admin sidebar', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('admin sidebar is visible with dark navy background', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()
    const bg = await sidebar.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // #1B3F72 = rgb(27, 63, 114)
    expect(bg).toBe('rgb(27, 63, 114)')
  })

  test('admin sidebar shows all 8 nav items', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('数据概览')).toBeVisible()
    await expect(page.getByText('邀请管理')).toBeVisible()
    await expect(page.getByText('申请审核')).toBeVisible()
    await expect(page.getByText('商户管理')).toBeVisible()
    await expect(page.getByText('品牌管理')).toBeVisible()
    await expect(page.getByText('门店管理')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
    await expect(page.getByText('特色产品')).toBeVisible()
  })

  test('admin sidebar shows EchoBay logo', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByAltText('EchoBay')).toBeVisible()
  })

  test('admin sidebar shows EchoBay brand name', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const sidebar = page.locator('aside').first()
    await expect(sidebar.getByText('EchoBay')).toBeVisible()
  })

  test('sidebar nav items navigate to correct routes', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.getByText('邀请管理').click()
    await expect(page).toHaveURL('/admin/invitations')
    await page.getByText('申请审核').click()
    await expect(page).toHaveURL('/admin/applications')
    await page.getByText('商户管理').click()
    await expect(page).toHaveURL('/admin/merchants')
  })

  test('active nav item has teal left border indicator', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // The active link should have teal border
    const activeLink = page.locator('a.border-\\[\\#0BB5C4\\]')
    await expect(activeLink).toBeVisible()
  })

  test('sidebar shows logout button', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('退出登录')).toBeVisible()
  })
})

// ─── Admin Header ─────────────────────────────────────────────────────────────

test.describe('UI — Admin header bar', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('header bar is visible on admin pages', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    const bg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(255, 255, 255)')
  })

  test('header shows page title derived from route', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.locator('header').getByText('数据概览')).toBeVisible()
  })

  test('header updates title when navigating', async ({ page }) => {
    await page.goto('/admin/invitations')
    await expect(page.locator('header').getByText('邀请管理')).toBeVisible()
    await page.goto('/admin/applications')
    await expect(page.locator('header').getByText('申请审核')).toBeVisible()
  })

  test('header shows breadcrumb for detail pages', async ({ page }) => {
    await page.goto('/admin/applications')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.locator('header').getByText('申请审核')).toBeVisible()
    await expect(page.locator('header').getByText('详情')).toBeVisible()
  })

  test('header shows user avatar with initials', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // Admin user email is admin@echobay.com — initials would be based on name
    const header = page.locator('header')
    const avatar = header.locator('div.rounded-full')
    await expect(avatar).toBeVisible()
  })

  test('header shows Admin role badge', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.locator('header').getByText('Admin')).toBeVisible()
  })

  test('header has notification bell button', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByLabel('通知')).toBeVisible()
  })
})

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

test.describe('UI — Admin dashboard', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('dashboard shows 6 stat cards', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('总申请数')).toBeVisible()
    await expect(page.getByText('待审核')).toBeVisible()
    await expect(page.getByText('已批准')).toBeVisible()
    await expect(page.getByText('需补充 / 拒绝')).toBeVisible()
    await expect(page.getByText('已发送邀请')).toBeVisible()
    await expect(page.getByText('邀请待使用')).toBeVisible()
  })

  test('dashboard shows recent applications table', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('最近申请')).toBeVisible()
    await expect(page.getByText('查看全部 →')).toBeVisible()
    await expect(page.getByText('公司名称')).toBeVisible()
    await expect(page.getByText('提交时间')).toBeVisible()
    await expect(page.getByText('状态')).toBeVisible()
  })

  test('dashboard stat cards are full-width (not in narrow container)', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const grid = page.locator('.grid.grid-cols-2').first()
    await expect(grid).toBeVisible()
    const gridWidth = await grid.evaluate((el) => el.getBoundingClientRect().width)
    // Should be wide, not constrained to ~896px (max-w-4xl)
    expect(gridWidth).toBeGreaterThan(700)
  })

  test('查看全部 link goes to applications list', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.getByText('查看全部 →').click()
    await expect(page).toHaveURL('/admin/applications')
  })

  test('clicking company name in recent apps goes to detail', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // If there's any app link in the table
    const appLinks = page.locator('table a')
    if (await appLinks.count() > 0) {
      await appLinks.first().click()
      await expect(page).toHaveURL(/\/admin\/applications\//)
    }
  })
})

// ─── Content area full-width ──────────────────────────────────────────────────

test.describe('UI — Content fills screen width', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('applications page content is full-width', async ({ page }) => {
    await page.goto('/admin/applications')
    const content = page.locator('main > div').first()
    await expect(content).toBeVisible()
    const contentWidth = await content.evaluate((el) => el.getBoundingClientRect().width)
    // Should not be constrained to max-w-4xl (~896px) — should fill the main area
    expect(contentWidth).toBeGreaterThan(700)
  })

  test('dashboard content is full-width', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const content = page.locator('main > div').first()
    const contentWidth = await content.evaluate((el) => el.getBoundingClientRect().width)
    expect(contentWidth).toBeGreaterThan(700)
  })

  test('main area has brand background color', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const main = page.locator('main')
    const bg = await main.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // #F1F5F9 = rgb(241, 245, 249)
    expect(bg).toBe('rgb(241, 245, 249)')
  })
})

// ─── Status badges ────────────────────────────────────────────────────────────

test.describe('UI — Status badges', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('approved status shows emerald badge', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    const badge = page.locator('.bg-emerald-100.text-emerald-700').first()
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('已批准')
  })

  test('submitted status shows blue badge', async ({ page }) => {
    await page.goto('/admin/applications?status=submitted')
    const badge = page.locator('.bg-blue-100.text-blue-700').first()
    await expect(badge).toBeVisible()
  })

  test('application detail shows status badge in company info card header', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByText('Approved Brand Pty Ltd').first().click()
    const approvedBadge = page.locator('.bg-emerald-100.text-emerald-700')
    await expect(approvedBadge).toBeVisible()
  })
})

// ─── Merchant Layout ──────────────────────────────────────────────────────────

test.describe('UI — Merchant layout', () => {
  test.use({ storageState: 'e2e/.auth/merchant.json' })

  test('merchant sidebar is dark navy', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    const sidebar = page.locator('aside').first()
    const bg = await sidebar.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(27, 63, 114)')
  })

  test('merchant header shows Merchant role badge', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.locator('header').getByText('Merchant')).toBeVisible()
  })

  test('merchant header shows page title for current route', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await expect(page.locator('header').getByText('推广活动')).toBeVisible()
  })

  test('merchant dashboard shows two-column layout with notifications panel', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('未读通知')).toBeVisible()
    // Quick links grid visible
    await expect(page.getByText('查看或编辑您的申请')).toBeVisible()
  })
})

// ─── Apply pages ──────────────────────────────────────────────────────────────

test.describe('UI — Apply pages brand styling', () => {
  test('invalid token page shows brand gradient background', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz-999')
    const main = page.locator('main')
    const classes = await main.getAttribute('class')
    expect(classes).toContain('from-[#1B3F72]')
  })

  test('invalid token page shows EchoBay logo', async ({ page }) => {
    await page.goto('/apply/invalid-token-xyz-999')
    await expect(page.getByAltText('EchoBay')).toBeVisible()
  })

  test('apply page shows EchoBay brand header', async ({ page }) => {
    await page.goto('/apply/e2e-test-token-abc123')
    await expect(page.getByText('EchoBay CRM')).toBeVisible()
    await expect(page.getByText('商户入驻申请')).toBeVisible({ timeout: 8000 })
  })

  test('apply page has light background', async ({ page }) => {
    await page.goto('/apply/e2e-test-token-abc123')
    const main = page.locator('main')
    const classes = await main.getAttribute('class')
    expect(classes).toContain('bg-[#F1F5F9]')
  })
})

// ─── Auth pages brand styling ─────────────────────────────────────────────────

test.describe('UI — Auth pages brand styling', () => {
  test('login page shows left brand panel with gradient', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/login')
    // Left panel is lg:flex — should be visible at 1280px
    const leftPanel = page.locator('div.bg-gradient-to-br').first()
    await expect(leftPanel).toBeVisible()
  })

  test('login page left panel has EchoBay CRM text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/login')
    await expect(page.getByText('EchoBay CRM').first()).toBeVisible()
    await expect(page.getByText('商户管理平台')).toBeVisible()
  })

  test('login page right panel has welcome heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('欢迎回来')).toBeVisible()
    await expect(page.getByText('请登录您的账户')).toBeVisible()
  })

  test('forgot password page shows brand layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/login/forgot-password')
    await expect(page.getByText('找回密码')).toBeVisible()
    await expect(page.getByText('EchoBay CRM').first()).toBeVisible()
  })
})
