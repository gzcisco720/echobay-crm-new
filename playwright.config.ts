import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Phase 1: create auth state files (must run first)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 2: unauthenticated flows
    {
      name: 'public',
      testMatch: /(auth|application-form)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 3: admin flows
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
    },
    // Phase 4: merchant flows
    {
      name: 'merchant',
      testMatch: /merchant-.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/merchant.json' },
    },
    // Phase 5: submitted merchant flows (empty states, resubmit, post-approval view)
    {
      name: 'merchant-submitted',
      testMatch: /merchant-submitted\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/merchant-submitted.json' },
    },
    // Phase 6: role-based access control
    {
      name: 'access-control',
      testMatch: /access-control\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 7: UI redesign — tests run with auth state overridden per describe block
    {
      name: 'ui-redesign',
      testMatch: /ui-redesign\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 8: full merchant application flow
    {
      name: 'application-flow',
      testMatch: /application-flow\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 9: application form tabs 3-6 detail tests
    {
      name: 'application-tabs',
      testMatch: /application-form-tabs\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Phase 10: i18n locale switching
    {
      name: 'i18n',
      testMatch: /i18n\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
