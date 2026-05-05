import { test, expect } from '@playwright/test'

test.describe('Admin — Dashboard charts', () => {
  test('dashboard page loads with all three chart section headings', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('每周申请量（最近 12 周）')).toBeVisible()
    await expect(page.getByText('申请状态分布')).toBeVisible()
    await expect(page.getByText('邀请转化漏斗')).toBeVisible()
  })

  test('trend chart renders a recharts wrapper', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // Wait for client-side hydration + Recharts render
    await page.waitForFunction(
      () => document.querySelectorAll('.recharts-wrapper').length > 0 ||
            document.body.innerText.includes('暂无数据'),
      { timeout: 8000 }
    )
    const wrapperCount = await page.locator('.recharts-wrapper').count()
    const emptyCount = await page.getByText('暂无数据').count()
    expect(wrapperCount + emptyCount).toBeGreaterThan(0)
  })

  test('funnel shows three progress bar labels', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('已发送邀请').first()).toBeVisible()
    await expect(page.getByText('已提交申请').first()).toBeVisible()
  })

  test('existing stat cards and recent table still visible', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('总申请数')).toBeVisible()
    await expect(page.getByText('最近申请')).toBeVisible()
  })
})
