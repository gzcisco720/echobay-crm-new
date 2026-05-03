import { test as setup, expect } from '@playwright/test'
import path from 'path'

const ADMIN_FILE = path.join(__dirname, '.auth/admin.json')
const MERCHANT_FILE = path.join(__dirname, '.auth/merchant.json')

setup('create admin auth state', async ({ page }) => {
  await page.goto('/login')
  await page.fill('#email', 'admin@echobay.com')
  await page.fill('#password', 'Admin@123456')
  await page.getByRole('button', { name: /登录/ }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 })
  await page.context().storageState({ path: ADMIN_FILE })
})

setup('create merchant auth state', async ({ page }) => {
  await page.goto('/login')
  await page.fill('#email', 'merchant-approved@test.com')
  await page.fill('#password', 'Merchant@123456')
  await page.getByRole('button', { name: /登录/ }).click()
  await expect(page).toHaveURL(/\/merchant\/dashboard/, { timeout: 10000 })
  await page.context().storageState({ path: MERCHANT_FILE })
})
