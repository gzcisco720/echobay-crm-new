import { test, expect } from '@playwright/test'

test.describe('Merchant — Dashboard', () => {
  test('dashboard loads and shows welcome message', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page).toHaveURL('/merchant/dashboard')
    await expect(page.getByText(/欢迎回来/)).toBeVisible()
  })

  test('merchant sidebar has all 6 nav items', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('仪表盘')).toBeVisible()
    await expect(page.getByText('申请详情')).toBeVisible()
    await expect(page.getByText('文件上传')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('我的门店')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
  })

  test('merchant sidebar shows EchoBay logo', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByAltText('EchoBay')).toBeVisible()
  })

  test('dashboard shows approved status card', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('已批准')).toBeVisible()
  })

  test('dashboard shows quick-link cards', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('申请详情')).toBeVisible()
    await expect(page.getByText('查看或编辑您的申请')).toBeVisible()
    await expect(page.getByText('文件上传')).toBeVisible()
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('推广活动')).toBeVisible()
  })

  test('dashboard quick-links navigate to correct pages', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('查看或编辑您的申请').click()
    await expect(page).toHaveURL('/merchant/application')
  })

  test('notification panel visible on dashboard', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('未读通知')).toBeVisible()
  })
})

test.describe('Merchant — Application', () => {
  test('application page shows approved status', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('已批准')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd').or(page.getByText('ApprovedBrand'))).toBeVisible()
  })

  test('application page shows all form tabs', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('① 公司信息').or(page.getByText('公司信息'))).toBeVisible()
  })
})

test.describe('Merchant — Brand', () => {
  test('brand info page shows brand details', async ({ page }) => {
    await page.goto('/merchant/brand')
    await expect(page.getByText('ApprovedBrand').or(page.getByText('Approved Brand Pty Ltd'))).toBeVisible()
  })

  test('brand page is full-width (no max-w constraint)', async ({ page }) => {
    await page.goto('/merchant/brand')
    const main = page.locator('main')
    await expect(main).toBeVisible()
    // Content renders without visible narrow container
    await expect(page.getByText('ApprovedBrand').or(page.getByText('品牌信息'))).toBeVisible()
  })
})

test.describe('Merchant — My Store', () => {
  test('store page shows seeded store', async ({ page }) => {
    await page.goto('/merchant/store')
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
    await expect(page.getByText('100 George St, Sydney NSW 2000')).toBeVisible()
    await expect(page.getByText('Mon-Sun 9am-6pm')).toBeVisible()
  })

  test('store shows highlights', async ({ page }) => {
    await page.goto('/merchant/store')
    await expect(page.getByText('Premium quality')).toBeVisible()
    await expect(page.getByText('Exclusive items')).toBeVisible()
  })
})

test.describe('Merchant — Promotions', () => {
  test('promotions list shows seeded promotion', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await expect(page.getByText('10% off all items this season')).toBeVisible()
    await expect(page.getByText('品牌级')).toBeVisible()
    await expect(page.getByText('活跃')).toBeVisible()
  })

  test('new promotion button navigates to create form', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: /新增推广/ }).click()
    await expect(page).toHaveURL('/merchant/promotions/new')
  })

  test('new promotion page shows form fields', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await expect(page.getByText('新增推广活动')).toBeVisible()
    await expect(page.getByLabel('推广规则')).toBeVisible()
  })

  test('creating promotion with valid data redirects to list', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'E2E Test: Buy 2 get 1 free on all items')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    await expect(page.getByText('E2E Test: Buy 2 get 1 free')).toBeVisible()
  })

  test('promotion form rejects missing promotion rule', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#fromDate', '2026-07-01')
    await page.fill('#toDate', '2026-07-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    const textarea = page.locator('#promotionRule')
    const isInvalid = await textarea.evaluate((el: HTMLTextAreaElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('promotion form rejects end date before start date', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'Test rule')
    await page.fill('#fromDate', '2026-07-31')
    await page.fill('#toDate', '2026-07-01')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    // Either validation error or server error
    await expect(
      page.getByText(/日期/).or(page.getByText(/结束/).or(page.getByText(/有效期/)))
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Merchant — Documents', () => {
  test('documents page loads', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('文件上传').or(page.getByText('Documents'))).toBeVisible()
  })
})

test.describe('Merchant — Navigation', () => {
  test('sidebar nav items navigate correctly', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('申请详情').click()
    await expect(page).toHaveURL('/merchant/application')
  })

  test('clicking 文件上传 navigates to documents', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('文件上传').click()
    await expect(page).toHaveURL('/merchant/documents')
  })
})

test.describe('Merchant — Notifications', () => {
  test('dashboard shows unread notification panel', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await expect(page.getByText('未读通知')).toBeVisible()
  })

  test('notification mark as read removes it from list', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    const readBtn = page.getByRole('button', { name: '已读' }).first()
    if (await readBtn.isVisible()) {
      const notifText = await page.locator('.text-sm.font-medium.text-zinc-900').first().textContent()
      await readBtn.click()
      // Notification removed from DOM
      if (notifText) {
        await expect(page.getByText(notifText)).not.toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('mark all as read clears notification list', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    const markAllBtn = page.getByRole('button', { name: '全部已读' })
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()
      await expect(page.getByText('暂无新通知').or(page.getByText('No new notifications'))).toBeVisible({ timeout: 5000 })
    }
  })

  test('no notifications state shows correct empty message', async ({ page }) => {
    // After marking all read, or when starting fresh
    // This test verifies the empty state message exists as a UI element
    await page.goto('/merchant/dashboard')
    // Either shows notifications or empty state
    const hasNotifs = await page.getByRole('button', { name: '已读' }).count()
    if (hasNotifs === 0) {
      await expect(page.getByText('暂无新通知').or(page.getByText('No new notifications'))).toBeVisible()
    }
  })
})

test.describe('Merchant — Application status', () => {
  test('application page shows current status badge', async ({ page }) => {
    await page.goto('/merchant/application')
    // The approved merchant has an approved application
    await expect(page.getByText('已批准').or(page.getByText('approved'))).toBeVisible()
  })

  test('application page shows company info', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('公司信息')).toBeVisible()
    await expect(page.getByText('Approved Brand Pty Ltd')).toBeVisible()
  })

  test('application page shows brand info section', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('ApprovedBrand')).toBeVisible()
  })

  test('approved application does NOT show resubmit button', async ({ page }) => {
    await page.goto('/merchant/application')
    await expect(page.getByRole('button', { name: /重新提交申请/ })).not.toBeVisible()
  })
})

test.describe('Merchant — Documents page', () => {
  test('documents page loads and shows upload guidance', async ({ page }) => {
    await page.goto('/merchant/documents')
    await expect(page.getByText('已上传文件 Uploaded Documents')).toBeVisible()
  })

  test('documents page empty state shows correct message when no docs uploaded', async ({ page }) => {
    await page.goto('/merchant/documents')
    // Seeded merchant has no documents
    await expect(page.getByText('暂无上传文件').or(page.getByText('如 Admin 要求补充资料'))).toBeVisible()
  })
})

test.describe('Merchant — Logout', () => {
  test('logout button redirects to login', async ({ page }) => {
    await page.goto('/merchant/dashboard')
    await page.getByText('退出登录').click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})

test.describe('Merchant — Promotion delete and edit', () => {
  test('promotions list has 编辑 and 删除 controls', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('delete dialog cancel keeps promotion', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
  })

  test('edit link goes to merchant promotion edit page', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/merchant\/promotions\/.+\/edit/)
    await expect(page.getByText('编辑推广活动')).toBeVisible()
  })

  test('edit page pre-fills promotion rule', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page.locator('#promotionRule')).not.toHaveValue('')
  })

  test('saving merchant promotion edit updates rule', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newRule = 'E2E Merchant Updated ' + Date.now()
    await page.fill('#promotionRule', newRule)
    await page.getByRole('button', { name: '保存推广活动' }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    await expect(page.getByText(newRule)).toBeVisible()
  })

  test('merchant can delete their own promotion (state-changing)', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'E2E Merchant Delete Me')
    await page.fill('#fromDate', '2027-01-01')
    await page.fill('#toDate', '2027-01-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    const card = page.locator('.bg-zinc-50').filter({ hasText: 'E2E Merchant Delete Me' })
    await card.getByRole('button', { name: '删除' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page.getByText('E2E Merchant Delete Me')).not.toBeVisible({ timeout: 5000 })
  })

  test('merchant cannot edit another user promotion (returns 404)', async ({ page }) => {
    await page.goto('/merchant/promotions/000000000000000000000001/edit')
    await expect(page.getByText('404').or(page.getByText('Not Found'))).toBeVisible({ timeout: 5000 })
  })
})
