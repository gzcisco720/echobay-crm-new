# CLAUDE.md

Guidance for Claude Code when working in this repository.

---

## Session Start Protocol

**Every session, before writing any code:**

1. Read `docs/INDEX.md` — understand current project status, what is done, what is next.
2. Identify which Phase or task is being worked on.
3. Check the active plan linked from INDEX.md for context.

---

## Core Mandate

### Package Manager

Always use `pnpm`. Never `npm` or `yarn`.

### TDD is Non-Negotiable

Every line of production code must be driven by a failing test. No exceptions.

**Golden Rule**: Write the test first. Make it fail. Then implement.

### Type Safety

No `any` or `unknown` in production code. Use explicit interfaces, utility types (`Partial`, `Pick`, `Omit`), and type guards. Zod validates all external boundaries (form submissions, Server Action inputs). Explicit return types on all exported functions and Server Actions.

---

## TDD Workflow

### Red → Green → Refactor

Every feature follows this cycle without exception:

**RED** — Write one small failing test. Run it to confirm it fails. The test must have clear assertions, correct imports, and proper mock setup.

**GREEN** — Write only enough code to make that test pass. No extra features, no future-proofing.

**REFACTOR** — Improve code quality without changing behavior. All tests must still pass.

Repeat for the next behavior.

### TDD Rules

Never do:
- Write implementation before the test
- Write multiple tests before implementing each one
- Skip the cycle because "it's obvious"

Always do:
- Run the test runner after RED to confirm failure
- Run the test runner after GREEN to confirm passing
- Keep each RED→GREEN cycle small (one behavior at a time)

### When Stuck (3-Attempt Limit)

After 3 failed attempts on the same problem: stop, document what failed and the exact error, search online for solutions, consider a fundamentally different approach.

---

## Phase Completion Gate

**At the end of every Phase (or significant feature block), before moving on:**

```bash
pnpm lint        # Must exit with 0 errors
pnpm test        # Must pass 100% (no failures, no skips added)
pnpm build       # Must compile with 0 TypeScript errors
```

If any of the three fail, fix before continuing. Do not carry lint errors or broken tests into the next Phase.

**After all three pass, update `docs/INDEX.md`:**
- Mark the completed Phase in the "Project Status" table
- Update the "Active Plan" pointer to the next Phase
- Add any new documents created to the appropriate section

**Then commit all changes:**

```bash
git add -A
git commit -m "feat: <phase description>"
```

The commit must include all code, tests, and doc changes from the Phase together. Do not push partial work.

---

## Commands Reference

```bash
# Development
pnpm dev                  # Start dev server (port 3000)
pnpm build                # Production build
pnpm start                # Start production server

# Quality (run in this order)
pnpm lint                 # ESLint auto-fix
pnpm test                 # All Jest tests (unit + integration)
pnpm test:unit            # Unit tests only
pnpm test:integration     # Integration tests only
pnpm test:watch           # Tests in watch mode
pnpm test:cov             # Coverage report
pnpm test:e2e             # Playwright E2E tests
```

---

## Architecture

### Stack

- **Framework:** Next.js 16 App Router — no separate API server
- **Mutations:** Server Actions (`'use server'`) in `src/lib/actions/`
- **File uploads:** Route Handler at `src/app/api/upload/route.ts`
- **Auth:** Auth.js v5 (NextAuth@beta), Credentials provider, JWT session, role embedded in token
- **Database:** MongoDB Atlas via Mongoose — singleton connection in `src/lib/db/connect.ts`
- **Validation:** Zod schemas in `src/lib/validations/`
- **UI:** ShadCN/ui + Tailwind CSS v4, Neutral color system, Inter font
- **Email:** Mailgun via `fetch` (native HTTP, no SDK)
- **File storage:** Cloudinary
- **Testing:** Jest (unit + integration with mongodb-memory-server) + Playwright (E2E)

### Route Groups

| Group          | URL prefix    | Role required            |
|----------------|---------------|--------------------------|
| `(auth)`       | `/login`      | none                     |
| `apply/[token]`| `/apply/*`    | none (invitation token)  |
| `(merchant)`   | `/merchant/*` | `merchant`               |
| `(admin)`      | `/admin/*`    | `admin` or `super_admin` |

### Directory Layout

```
src/
  app/
    (auth)/login/
    apply/[token]/
    (merchant)/merchant/
    (admin)/admin/
    api/upload/
  components/
    ui/           # ShadCN auto-generated
    forms/        # Form tab components
    merchant/     # Merchant portal components
    admin/        # Admin components
  lib/
    actions/      # Server Actions
    auth/         # Auth.js config
    db/           # Mongoose connection + models
    email/        # Mailgun service
    crypto/       # AES-256-GCM encrypt/decrypt
    validations/  # Zod schemas
__tests__/
  unit/
  integration/
e2e/
```

---

## Code Standards

### TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- Explicit return types on all exported functions and Server Actions
- `import type` for type-only imports

### Server Actions Pattern

All actions return `ActionResult<T>`:

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Never throw from actions into the UI. Catch internally, return `{ success: false, error }`.

### ESLint

- All errors and warnings must be zero before committing.
- `no-explicit-any` is OFF as an escape hatch — use only in test files, never in `src/lib/` or `src/app/`.

---

## Documentation

### File Placement

- Plan files: `docs/superpowers/plans/`
- Spec files: `docs/superpowers/specs/`
- Root exceptions: `README.md`, `CLAUDE.md`
- Project index: `docs/INDEX.md`

### Keeping INDEX.md Current

Whenever a phase completes: update the Project Status table and set the Active Plan pointer to the next phase.

---

## Common Gotchas

- **Next.js 16 async APIs**: `cookies()`, `headers()`, `params`, `searchParams` are all async — always `await` them.
- **Server Actions**: Must begin with `'use server'`. Cannot be defined inside Client Components.
- **Mongoose singleton**: Use `connectDB()` from `src/lib/db/connect.ts` — never call `mongoose.connect()` directly.
- **Mongoose queries**: Chain `.lean()` for plain objects. Append `.exec()` at the end of every query to get a real Promise (required for correct TypeScript typing and linting).
- **Auth.js v5**: Import `auth` from `@/lib/auth/auth.config` in Server Components and Route Handlers.
- **Zod + Server Actions**: Parse at the top of every action, return `{ success: false, error }` immediately on failure.
- **Bank account numbers**: Always encrypt before saving with `encrypt()` from `src/lib/crypto/encryption.ts`. Never store plaintext.
- **Next.js 16 `params`**: In `page.tsx`, params is `Promise<{ token: string }>` — must `await params` before destructuring.
