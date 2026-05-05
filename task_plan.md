# Task Plan: EchoBay CRM — Feature Completion

## Goal
Complete the remaining three sub-projects (file upload, dashboard charts, infrastructure polish) to bring EchoBay CRM to production-ready state.

## Current Phase
Sub-project C — Dashboard 数据可视化

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

**Design (approved 2026-05-04):**

_Data Layer:_
- `merchant-document.model.ts`: make `cloudinaryPublicId` optional (supports pending admin requests)
- Logic: `requestedBy` present + no `cloudinaryPublicId` = pending request; `cloudinaryPublicId` present = uploaded file

_Upload API (`/api/upload/route.ts`):_
- Add: PDF, .doc, .docx, .xls, .xlsx support
- Size limit: 5MB → 20MB
- `resource_type: 'image'` for images, `'raw'` for documents
- Route stays at `/api/upload`, MIME type determines handling

_Server Actions (`document.actions.ts`):_
- `requestDocumentAction(applicationId, type)` — Admin only, creates pending record
- `uploadDocumentAction(payload)` — Merchant; creates new or fulfills existing request
- `getApplicationDocumentsAction(applicationId)` — shared
- `cancelDocumentRequestAction(requestId)` — Admin only, deletes pending request

_Merchant Documents Page (`/merchant/documents`):_
- Block 1: Pending admin requests (upload button per request)
- Block 2: Self-upload (free-text type label + file picker)
- Block 3: All uploaded files list with name/type/date/link

_Admin Application Detail (`/admin/applications/[id]`):_
- New "文件" card: shows all docs (pending + uploaded) with status badges
- Inline "请求文件" form (free text → calls `requestDocumentAction`)
- Cancel button on pending requests

_Components:_
- `DocumentUploaderClient` — file select → POST `/api/upload` → call action
- `PendingRequestCard` — merchant side per-request upload UI
- `AdminDocumentRequestForm` — admin inline request form
- `DocumentListItem` — shared row component

_Tests:_
- Unit: 4 Server Actions (success + failure paths)
- Integration: upload route MIME validation, size validation
- E2E: merchant uploads → admin sees; admin requests → merchant sees + uploads

- [x] Brainstorm + design spec
- [x] Implementation plan
- [x] Implementation (TDD)
- [x] E2E tests
- **Status:** complete

### Sub-project C: Dashboard 数据可视化
Admin dashboard with 3 charts inserted between stat cards and recent-applications table.

**Design (approved 2026-05-05):**

_Chart library:_ Recharts (React-native, ~180KB, best Next.js fit)

_Layout (top → bottom):_
1. 6 stat cards (unchanged)
2. Row: ApplicationTrendChart (2/3 width) + ApplicationStatusChart donut (1/3 width)
3. Row: InvitationFunnelChart (full width, pure CSS — no Recharts needed)
4. Recent applications table (unchanged)

_Data layer — two new functions in `dashboard.actions.ts`:_
- `getApplicationTrend(weeks)` — MongoDB $group by ISO week, returns `{week: string, count: number}[]`
- `getInvitationFunnel()` — three countDocuments calls: sent / submitted / approved

_Components (all Client Components):_
- `src/components/admin/charts/application-trend-chart.tsx` — Recharts BarChart
- `src/components/admin/charts/application-status-chart.tsx` — Recharts PieChart (donut)
- `src/components/admin/charts/invitation-funnel-chart.tsx` — Tailwind CSS progress bars

_Testing:_
- Integration: getApplicationTrend + getInvitationFunnel (MongoMemoryServer)
- E2E: chart containers visible, SVG elements present, funnel labels visible
- No jsdom UI unit tests (Recharts SVG unreliable in jsdom)

- [x] Choose charting library (Recharts)
- [x] Brainstorm + design spec
- [ ] Implementation plan
- [ ] Implementation (TDD)
- [ ] E2E tests
- **Status:** in-progress

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
