import { test, expect } from '@playwright/test'

test.describe('Admin — Documents card on application detail', () => {
  test('documents card is visible on application detail page', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()
    await expect(page.getByRole('button', { name: '发送请求' })).toBeVisible()
  })

  test('shows validation error when sending empty document request', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()
    await page.getByRole('button', { name: '发送请求' }).click()
    await expect(page.getByText('请填写所需文件说明')).toBeVisible()
  })

  test('shows empty document state on approved application', async ({ page }) => {
    await page.goto('/admin/applications?status=approved')
    await page.getByRole('link', { name: '查看' }).first().click()
    await expect(page.getByText('补充文件')).toBeVisible()
    await expect(page.getByText('暂无文件记录。')).toBeVisible()
  })
})
