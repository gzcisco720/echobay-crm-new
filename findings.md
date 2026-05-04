# Findings & Decisions — EchoBay CRM

## Brand Colors (Echobay logo palette)
| Token | Value | Usage |
|-------|-------|-------|
| Sidebar background | `#1B3F72` (deep navy) | `bg-[#1B3F72]` on sidebar |
| Brand teal / `--primary` | `#0BB5C4` = oklch(0.68 0.095 204) | Buttons, active states, CTA |
| Content background | `#F1F5F9` = oklch(0.97 0.004 248) | Main content area |

## Layout Architecture (post UI redesign)
- Root: `flex h-screen overflow-hidden`
- Sidebar: `w-60 sticky bg-[#1B3F72]` — Logo + nav items + logout
- Nav active state: teal left-border + `bg-[rgba(11,181,196,0.15)]`
- AppHeader: `h-14 sticky bg-white` — title auto-derived from `usePathname()`
- Main: `flex-1 overflow-auto bg-[#F1F5F9] p-6` — always `w-full`, never `max-w-*`

## Status Badge colors (use `StatusBadge` component, not raw `Badge`)
- approved → `bg-emerald-100 text-emerald-700`
- submitted / under_review → `bg-blue-100 text-blue-700`
- requires_info → `bg-amber-100 text-amber-700`
- rejected → `bg-red-100 text-red-700`
- draft → `bg-slate-100 text-slate-600`

## UI Library Gotchas (Base UI, not Radix)
ShadCN in this project uses `base-nova` style with `@base-ui/react`, not Radix UI:
- **AlertDialogAction** does NOT auto-close — must use controlled `open` state
- Use `render` prop for polymorphic elements, not `asChild`
- `React.JSX.Element` required as return type (not bare `JSX.Element`) — add `import React from 'react'`
- `array[0]` returns `T | undefined` due to `noUncheckedIndexedAccess` — always add `?? fallback`

## Test Users (seeded by `pnpm seed:e2e`)
| Email | Password | Role | State |
|-------|----------|------|-------|
| admin@echobay.com | Admin@123456 | admin | — |
| merchant-approved@test.com | Merchant@123456 | merchant | approved app, brand, store, promo |
| merchant-submitted@test.com | Merchant@123456 | merchant | submitted app, no brand/store |

## Completed Work Summary
- **Phase 1–13:** Full merchant portal, admin CRM, invitations, password reset, brands, stores, promotions, hero products, bank accounts
- **UI Redesign:** Brand colors, dark sidebar, AppHeader, full-width layouts across 34 pages
- **Sub-project A:** Delete UI (AlertDialog), brand/bank account status management, promotion + hero product edit pages
- **E2E:** 200+ tests across 12 spec files — happy + unhappy paths, role-based access, empty states
