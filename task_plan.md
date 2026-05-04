# Task Plan: EchoBay CRM — Feature Completion

## Goal
Complete the remaining three sub-projects (file upload, dashboard charts, infrastructure polish) to bring EchoBay CRM to production-ready state.

## Current Phase
Sub-project B — 文件上传

## Phases

### Sub-project A: CRUD 补全 (delete UI, status management, edit pages)
- [x] AlertDialog + Toaster setup
- [x] DeleteButton reusable component (TDD)
- [x] BrandStatusSelect + BankAccountStatusSelect (TDD)
- [x] Delete wrappers: store, hero product, promotion
- [x] Integrate delete + edit links into all pages
- [x] PromotionEditForm + admin/merchant edit pages
- [x] HeroProductForm edit mode + edit page
- [x] E2E tests for all new features
- **Status:** complete

### Sub-project B: 文件上传
Merchant can upload supplementary files from their portal. Admin can view uploaded files in application detail.
- [ ] Brainstorm + design spec
- [ ] Implementation plan
- [ ] Implementation (TDD)
- [ ] E2E tests
- **Status:** pending

### Sub-project C: Dashboard 数据可视化
Admin dashboard with charts (application trends, status distribution, merchant activity).
- [ ] Choose charting library (Recharts recommended for Next.js)
- [ ] Brainstorm + design spec
- [ ] Implementation plan
- [ ] Implementation
- [ ] E2E tests
- **Status:** pending

### Sub-project D: 基础设施打磨
- [ ] Loading skeletons (loading.tsx for Server Component pages)
- [ ] Email template improvement (structured template functions)
- [ ] Sentry error tracking integration
- **Status:** pending

## Key Questions
1. File upload: use existing Cloudinary setup or add S3? (Cloudinary already configured)
2. Dashboard charts: which metrics matter most to admin?
3. Sentry: self-hosted or Sentry.io?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| pnpm only | Enforced in CLAUDE.md |
| TDD non-negotiable | Every line of prod code driven by failing test |
| No `any` in src/ | strict TypeScript throughout |
| AlertDialog via @base-ui/react | Project uses base-nova ShadCN style, not Radix |
| React.JSX.Element (not JSX.Element) | Required with noUncheckedIndexedAccess + react-jsx |
| archive/ excluded from tsconfig | Pre-existing NestJS backend, not our code |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| JSX.Element namespace error in build | 1 | Switch to React.JSX.Element + import React |
| AlertDialog asChild not in Base UI props | 1 | Apply buttonVariants class directly to AlertDialogTrigger |
| split('T')[0] typed as string\|undefined | 1 | Add ?? '' fallback (noUncheckedIndexedAccess) |
| SendInvitationForm onSuccess fn prop | 1 | Remove prop — Server Component can't pass functions to Client Components |

## Notes
- Run quality gates before every commit: `pnpm lint && pnpm test:unit && pnpm build`
- E2E seed: `pnpm seed:e2e` before running `pnpm test:e2e`
- State-changing E2E tests (approve/reject application, delete) require seed reset
