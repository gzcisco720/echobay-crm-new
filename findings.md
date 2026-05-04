# Findings & Decisions — EchoBay CRM

## Tech Stack
- **Framework:** Next.js 16 App Router (no separate API server)
- **Mutations:** Server Actions (`'use server'`) in `src/lib/actions/`
- **Auth:** Auth.js v5 (NextAuth@beta), Credentials provider, JWT session, role in token
- **Database:** MongoDB Atlas via Mongoose — singleton in `src/lib/db/connect.ts`
- **Validation:** Zod schemas in `src/lib/validations/`
- **UI:** ShadCN/ui (base-nova style, uses @base-ui/react not Radix) + Tailwind CSS v4, Inter font
- **Email:** Mailgun via `fetch` (native HTTP, no SDK)
- **File storage:** Cloudinary
- **Testing:** Jest (unit + integration with mongodb-memory-server) + Playwright (E2E)

## Brand Colors (Echobay logo palette)
| Token | Value | Usage |
|-------|-------|-------|
| Sidebar background | `#1B3F72` (deep navy) | `bg-[#1B3F72]` on sidebar |
| Brand teal / --primary | `#0BB5C4` = oklch(0.68 0.095 204) | Buttons, active states, CTA |
| Content background | `#F1F5F9` = oklch(0.97 0.004 248) | Main content area |

## Route Groups
| Group | URL prefix | Role required |
|-------|-----------|---------------|
| `(auth)` | `/login` | none |
| `apply/[token]` | `/apply/*` | none (invitation token) |
| `(merchant)` | `/merchant/*` | `merchant` |
| `(admin)` | `/admin/*` | `admin` or `super_admin` |

## Layout Architecture (post UI redesign)
- Root: `flex h-screen overflow-hidden`
- Sidebar: `w-60 sticky bg-[#1B3F72]` — Logo + nav items + logout
- Nav active state: teal left-border + `bg-[rgba(11,181,196,0.15)]`
- AppHeader: `h-14 sticky bg-white` — title auto-derived from usePathname()
- Main: `flex-1 overflow-auto bg-[#F1F5F9] p-6` — always `w-full`, never `max-w-*`

## Key Patterns

### Server Actions return type
```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```
Never throw from actions. Always catch + return `{ success: false, error }`.

### Mongoose queries
Always chain `.lean()`. Add `.exec()` for TypeScript typing.

## Status Badge colors
- approved: `bg-emerald-100 text-emerald-700`
- submitted/under_review: `bg-blue-100 text-blue-700`
- requires_info: `bg-amber-100 text-amber-700`
- rejected: `bg-red-100 text-red-700`
- draft: `bg-slate-100 text-slate-600`

## Test Users (seeded by `pnpm seed:e2e`)
| Email | Password | Role | State |
|-------|----------|------|-------|
| admin@echobay.com | Admin@123456 | admin | — |
| merchant-approved@test.com | Merchant@123456 | merchant | approved app, brand, store, promo |
| merchant-submitted@test.com | Merchant@123456 | merchant | submitted app, no brand/store |

## Completed Work Summary
- Phase 1–13: Full merchant portal, admin CRM, invitations, password reset, brands, stores, promotions, hero products, bank accounts
- UI Redesign: Brand colors, dark sidebar, fixed header, full-width layouts across 34 pages
- Sub-project A: Delete UI (AlertDialog), brand/bank account status management, promotion + hero product edit pages
- E2E: 200+ tests across 12 spec files covering happy + unhappy paths, role-based access, empty states

## Important Gotchas
- **Next.js 16 async APIs:** `cookies()`, `headers()`, `params`, `searchParams` all async — always `await`
- **Base UI AlertDialog:** `AlertDialogAction` does NOT auto-close — need controlled `open` state; use `render` prop not `asChild`
- **JSX.Element:** Must use `React.JSX.Element` + `import React from 'react'` (not bare `JSX.Element`)
- **noUncheckedIndexedAccess:** `array[0]` returns `T | undefined` — always add `?? fallback`
- **Bank account numbers:** Always encrypt via `encrypt()` from `src/lib/crypto/encrypt.ts`
- **Mongoose singleton:** Use `connectDB()` — never call `mongoose.connect()` directly
