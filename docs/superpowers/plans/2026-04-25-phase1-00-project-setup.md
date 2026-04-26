# Phase 1-00: Project Setup & Configuration

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js 15 project with all tooling — ShadCN, Tailwind v4, Jest, Playwright, CLAUDE.md, docs/INDEX.md, and git initialised.

**Architecture:** Next.js 15 App Router, TypeScript strict mode, pnpm, ShadCN/ui + Tailwind CSS v4. Jest for unit/integration tests, Playwright for E2E.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, ShadCN/ui, Tailwind CSS v4, Jest 29, Playwright, pnpm

**Working directory:** `/Users/eric/Desktop/echobay/echobay-crm`

---

### Task 1: Scaffold Next.js project

**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx` (auto-generated)

- [ ] **Step 1: Create Next.js app inside the existing folder**

```bash
cd /Users/eric/Desktop/echobay/echobay-crm
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Accept all defaults when prompted. The `.` installs into the current directory.

- [ ] **Step 2: Verify scaffold**

```bash
ls src/app
```

Expected: `layout.tsx  page.tsx  globals.css`

---

### Task 2: Install all dependencies

**Files:** `package.json`

- [ ] **Step 1: Install production dependencies**

```bash
pnpm add next-auth@beta mongoose bcryptjs zod cloudinary uuid
pnpm add -D @types/bcryptjs @types/uuid
```

- [ ] **Step 2: Install test dependencies**

```bash
pnpm add -D jest jest-environment-jsdom @jest/globals @testing-library/react @testing-library/jest-dom @testing-library/user-event mongodb-memory-server ts-jest
```

- [ ] **Step 3: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm playwright install chromium
```

- [ ] **Step 4: Verify**

```bash
pnpm list next-auth mongoose zod bcryptjs
```

Expected: all four listed with version numbers

---

### Task 3: Configure Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Write Jest config**

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.test.ts',
    '<rootDir>/__tests__/integration/**/*.test.ts',
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts'],
      testEnvironment: 'node',
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
      testEnvironment: 'node',
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
    },
  ],
}

export default createJestConfig(config)
```

- [ ] **Step 2: Write Jest setup file**

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to package.json**

Open `package.json`, replace the `"scripts"` section with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:unit": "jest --selectProjects unit",
  "test:integration": "jest --selectProjects integration",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Create test directories**

```bash
mkdir -p __tests__/unit/validations __tests__/unit/crypto
mkdir -p __tests__/integration/models __tests__/integration/actions
mkdir -p e2e
```

---

### Task 4: Configure Playwright

**Files:** `playwright.config.ts`

- [ ] **Step 1: Write Playwright config**

```typescript
// playwright.config.ts
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

### Task 5: Initialise ShadCN

**Files:** `components.json`, `src/app/globals.css`

- [ ] **Step 1: Run ShadCN init**

```bash
pnpm dlx shadcn@latest init
```

When prompted: Style → **Default**, Base color → **Neutral**, CSS variables → **Yes**

- [ ] **Step 2: Add core components**

```bash
pnpm dlx shadcn@latest add button input label card tabs badge alert separator
pnpm dlx shadcn@latest add form select textarea checkbox
pnpm dlx shadcn@latest add dropdown-menu avatar sheet progress toast
```

Expected: components in `src/components/ui/`

---

### Task 6: TypeScript strict config

**Files:** `tsconfig.json`

- [ ] **Step 1: Ensure strict settings**

Open `tsconfig.json`, confirm these are present under `"compilerOptions"`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors

---

### Task 7: Environment variables

**Files:** `.env.local`, `.env.example`

- [ ] **Step 1: Create .env.local with placeholders**

Create the file `/.env.local` with this content (fill real values before running):

```
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/echobay-crm

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=REPLACE_ME
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Mailgun
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM=EchoBay <noreply@echobay.com.au>

# Bank account encryption — generate with: openssl rand -hex 32
ENCRYPTION_KEY=REPLACE_ME
```

- [ ] **Step 2: Create .env.example (safe to commit)**

Create the file `/.env.example` with the same keys but no values.

---

### Task 8: CLAUDE.md

**Files:** `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create the file `/CLAUDE.md` with this content:

```markdown
# CLAUDE.md

## Session Start Protocol

Every session, before writing any code:
1. Read `docs/INDEX.md` — understand current status and what is next.
2. Identify the active Phase and plan file.

---

## Core Mandate

**Package Manager:** Always use `pnpm`. Never npm or yarn.

**TDD is Non-Negotiable:** Write the failing test first. Make it fail. Then implement.
Golden Rule: Red → Green → Refactor. No exceptions.

**Type Safety:** No `any` or `unknown` in production code. Use Zod at all external
boundaries (form submissions, API inputs). Explicit return types on all exports.

---

## Phase Completion Gate

Before moving to the next Phase:

    pnpm lint        # 0 errors
    pnpm test        # 100% pass, no skips
    pnpm build       # 0 TypeScript errors

Then update docs/INDEX.md and commit all changes together.

---

## Commands

    pnpm dev              # Start dev server (port 3000)
    pnpm build            # Production build
    pnpm lint             # ESLint
    pnpm test             # All Jest tests
    pnpm test:unit        # Unit tests only
    pnpm test:integration # Integration tests only
    pnpm test:e2e         # Playwright E2E
    pnpm test:watch       # Watch mode

---

## Architecture

- Full-stack Next.js 15 App Router — no separate API server
- Mutations: Server Actions ('use server') in src/lib/actions/
- File uploads: Route Handler at src/app/api/upload/route.ts
- Auth: Auth.js v5, Credentials provider, JWT session with role embedded
- Database: MongoDB Atlas via Mongoose — singleton in src/lib/db/connect.ts
- Validation: Zod schemas in src/lib/validations/
- UI: ShadCN/ui + Tailwind CSS v4

## Route Groups

| Group        | URL prefix   | Role required          |
|--------------|--------------|------------------------|
| (auth)       | /login       | none                   |
| apply/[token]| /apply/*     | none (invitation token)|
| (merchant)   | /merchant/*  | merchant               |
| (admin)      | /admin/*     | admin or super_admin   |

## Server Actions Pattern

All actions return ActionResult<T>:

    type ActionResult<T = void> =
      | { success: true; data: T }
      | { success: false; error: string }

Never throw from actions into the UI. Catch internally, return { success: false, error }.

---

## Common Gotchas

- Next.js 15: cookies(), headers(), params are async — always await them.
- Server Actions: must begin with 'use server'. Cannot live inside Client Components.
- Mongoose: use the singleton in src/lib/db/connect.ts — never call mongoose.connect() directly.
- Auth.js v5: import auth from @/lib/auth/auth.config in route handlers.
- Zod + Server Actions: parse at the top of every action, return error immediately on failure.
- Mongoose read queries: chain .lean() for plain objects, then .exec() for a real Promise.
```

---

### Task 9: docs/INDEX.md

**Files:** `docs/INDEX.md`

- [ ] **Step 1: Write INDEX.md**

Create the file `/docs/INDEX.md` with this content:

```markdown
# EchoBay CRM — Project Index

## Project Status

| Phase     | Description                       | Status      |
|-----------|-----------------------------------|-------------|
| 1-00      | Project setup & configuration     | ✅ Complete |
| 1-01      | Data layer (models + encryption)  | 🔲 Next     |
| 1-02      | Auth & Zod validation             | 🔲          |
| 1-03      | Invitation flow + email           | 🔲          |
| 1-04      | Application form (6 tabs)         | 🔲          |
| 1-05      | Merchant portal                   | 🔲          |
| 1-06      | Admin invitations page + E2E      | 🔲          |
| Phase 2   | Admin CRM (review, manage)        | 🔲          |

## Active Plan
docs/superpowers/plans/2026-04-25-phase1-01-data-layer.md

## Documents

### Specs
- docs/superpowers/specs/2026-04-24-echobay-crm-merchant-portal-design.md

### Plans
- docs/superpowers/plans/2026-04-25-phase1-00-project-setup.md  ✅
- docs/superpowers/plans/2026-04-25-phase1-01-data-layer.md
- docs/superpowers/plans/2026-04-25-phase1-02-auth-validation.md
- docs/superpowers/plans/2026-04-25-phase1-03-invitation-flow.md
- docs/superpowers/plans/2026-04-25-phase1-04-application-form.md
- docs/superpowers/plans/2026-04-25-phase1-05-merchant-portal.md
- docs/superpowers/plans/2026-04-25-phase1-06-admin-and-e2e.md
```

---

### Task 10: Git initialisation

- [ ] **Step 1: Ensure .env.local is in .gitignore**

```bash
grep "env.local" .gitignore
```

If missing: `echo ".env.local" >> .gitignore`

- [ ] **Step 2: Add .superpowers to .gitignore**

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 3: Initial commit**

```bash
git init
git add -A
git commit -m "chore: project setup — Next.js 15, ShadCN, Jest, Playwright, CLAUDE.md"
```

- [ ] **Step 4: Smoke test**

```bash
pnpm build
```

Expected: build completes with 0 errors

---

**Phase 1-00 complete. Next: `docs/superpowers/plans/2026-04-25-phase1-01-data-layer.md`**

Update `docs/INDEX.md`: mark 1-00 ✅, set Active Plan to 1-01.
