import { test, expect } from '@playwright/test'
import path from 'path'

const SAMPLE_PDF = path.join(__dirname, 'fixtures/sample.pdf')

test.describe('Merchant — Documents page', () => {
  test('documents page loads with upload form and file list sections', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('主动上传文件', { exact: true })).toBeVisible()
    await expect(page.getByText('已上传文件', { exact: true })).toBeVisible()
  })

  test('shows empty state when no uploads', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('暂无已上传文件。')).toBeVisible()
  })

  test('shows validation error when clicking upload without selecting file', async ({ page }) => {
    await page.goto('/merchant/documents')
    await page.fill('input[placeholder*="营业执照"]', '测试文件类别')
    await page.getByRole('button', { name: '上传文件' }).click()
    await expect(page.getByText('请选择文件')).toBeVisible()
  })

  test('shows validation error when clicking upload without entering type', async ({ page }) => {
    await page.goto('/merchant/documents')
    await page.setInputFiles('input[type="file"]', SAMPLE_PDF)
    await page.getByRole('button', { name: '上传文件' }).click()
    await expect(page.getByText('请填写文件类别')).toBeVisible()
  })
})
