# EchoBay CRM — Docs Index

> **AI assistant**: Read this file first every session to orient yourself.
> When a new plan, design doc, or API reference is created, add it here immediately.
> Format: `- [Title](path) — one-line description`

---

## How to Use This Index

1. **Starting a session** → read "Project Status" below, then open the active plan.
2. **Implementing a phase** → open the relevant plan from "Active Plans".
3. **Looking up data models, auth flow, or route design** → check "Architecture & Design".
4. **Checking a past design decision** → check "Architecture & Design" or "Historical".
5. **Superseded docs** are listed at the bottom — do not follow them for implementation.

---

## Project Status (updated 2026-05-02)

**Platform:** EchoBay CRM — merchant onboarding portal + admin CRM.  
**Stack:** Next.js 16 App Router, ShadCN/ui (base-nova), Auth.js v5, Mongoose 9 → MongoDB Atlas, Zod, Mailgun, Cloudinary, pnpm.  
**Phase 1:** ✅ **COMPLETE**. **Phase 2:** ✅ **COMPLETE**. **Phase 3 (打磨):** ✅ **COMPLETE**.

### Phase 1 — Complete

| Module | Status |
|--------|--------|
| Project scaffold (Next.js 16, ShadCN, Jest, Playwright, CLAUDE.md, git) | ✅ Phase 1-00 |
| Mongoose models + AES-256-GCM encryption | ✅ Phase 1-01 |
| Auth.js v5 + Zod validation schemas + login page + middleware | ✅ Phase 1-02 |
| Mailgun email service + invitation flow + apply route | ✅ Phase 1-03 |
| 6-tab merchant application form (draft save + submit + Cloudinary) | ✅ Phase 1-04 |
| Merchant portal (dashboard, notifications, application, documents, brand) | ✅ Phase 1-05 |
| Admin invitations page + E2E seed script + Playwright tests | ✅ Phase 1-06 |

### Phase 2 — Admin CRM (Complete)

| Module | Status |
|--------|--------|
| Admin CRM: application review workflow + detail page | ✅ Phase 2-01 |
| Admin CRM: dashboard stats + merchant management list | ✅ Phase 2-02 |

### Phase 3 — 打磨与修复 (Complete)

| 修复 | 状态 |
|------|------|
| Admin 登录后角色感知重定向（修复死循环） | ✅ |
| `/admin` 根路径重定向到 `/admin/dashboard` | ✅ |
| 审核状态变更时发送邮件给商户 | ✅ |
| `.env.example` 环境变量示例文件 | ✅ |

### Phase 4 — 功能增强 (Complete)

| 功能 | 状态 |
|------|------|
| Admin 申请列表可点击状态过滤（URL param 驱动） | ✅ |
| Admin 内部备注（addAdminNote TDD + AdminNotesForm） | ✅ |
| 已登录用户访问 `/login` 自动重定向 | ✅ |
| CLAUDE.md encrypt.ts 路径修复 | ✅ |

### Phase 5 — 商户重提与搜索 (Complete)

| 功能 | 状态 |
|------|------|
| 根路径 `/` 角色感知重定向 | ✅ |
| 商户重新提交申请（requires_info → submitted，TDD） | ✅ |
| Admin 申请列表按公司名文字搜索（?q= param） | ✅ |

### Phase 6 — UX 提升 (Complete)

| 功能 | 状态 |
|------|------|
| 登录流程保留 callbackUrl（中间件 + 登录后跳回原页） | ✅ |
| Admin 申请列表显示商户邮箱 | ✅ |
| `markAllNotificationsRead` action（TDD）+ 商户通知全部已读按钮 | ✅ |

### Phase 7 — 表单补全与管理增强 (Complete)

| 功能 | 状态 |
|------|------|
| Tab 3 `mainCategories` 多选补全（关键缺失字段） | ✅ |
| `cancelInvitation` action（TDD）+ Admin 邀请列表取消按钮 | ✅ |
| Admin 申请列表分页（PAGE_SIZE=20，?page= param，Pagination 组件） | ✅ |
| Jest UI 测试项目（jest-environment-jsdom，支持 .tsx 组件测试） | ✅ |

### Phase 8 — 密码重置 + Admin 完整详情 (Complete)

| 功能 | 状态 |
|------|------|
| User model 新增 `passwordResetToken` / `passwordResetExpiry` 字段 | ✅ |
| `requestPasswordReset` + `resetPassword` actions（TDD，8 个测试） | ✅ |
| `/login/forgot-password` + `/login/reset-password` 页面 | ✅ |
| 登录页加「忘记密码？」链接 | ✅ |
| Admin 申请详情页显示全部字段（交易名/邮寄地址/银行/平台/推广/协议等） | ✅ |
| Admin 商户详情页 `/admin/merchants/[id]`（完整商户档案） | ✅ |

---

## Active Plans

Phase 1 ~ Phase 8 均已完成。暂无活跃实现计划。

---

## Architecture & Design

- [Merchant Portal Design Spec](2026-04-24/echobay-crm-merchant-portal-design.md) — Full Phase 1 design: tech stack table, directory structure, 5 data model interfaces, auth flow, 6-tab form structure, Server Actions list, testing strategy, Phase 1 scope

---

## Configuration

*(Add here when created — e.g. environment variables reference, deployment guide, MongoDB Atlas setup)*

---

## Historical / Superseded (do not follow for implementation)

These documents were valid at their creation date but have been completed or superseded.

- [Phase 1-00: Project Setup](2026-04-25/plans/phase1-00-project-setup.md) — ✅ Completed 2026-04-26. Scaffolded Next.js 16.2.4, ShadCN base-nova, Jest, Playwright, CLAUDE.md, git init. Key deviation: `next lint` removed in Next.js 16 → replaced with `eslint` directly.
- [Phase 1-01: Data Layer](2026-04-25/plans/phase1-01-data-layer.md) — ✅ Completed 2026-05-01. connectDB singleton, 5 Mongoose models (User/MerchantInvitation/MerchantApplication/Notification/MerchantDocument), AES-256-GCM encrypt utility. 18 tests passing. tsconfig.json updated to exclude `__tests__` and `e2e` dirs.
- [Phase 1-02: Auth & Validation](2026-04-25/plans/phase1-02-auth-validation.md) — ✅ Completed 2026-05-02. Auth.js v5 Credentials provider, Zod schemas (login + 6 tabs), JWT middleware, login page. 29 tests passing. Fixed z.record/z.literal API for Zod v4.
- [Phase 1-03: Invitation Flow](2026-04-25/plans/phase1-03-invitation-flow.md) — ✅ Completed 2026-05-02. Mailgun sendEmail service, validateInvitationToken + sendMerchantInvitation actions, apply/[token] + invalid pages. 36 tests passing. uuid replaced with crypto.randomUUID() for ESM compat.
- [Phase 1-04: Application Form](2026-04-25/plans/phase1-04-application-form.md) — ✅ Completed 2026-05-02. saveDraftApplication + submitApplication + updateApplication actions, Cloudinary upload route, 6-tab ApplicationForm with auto-save. 41 tests passing. Fixed Zod v4 default() type mismatch with @hookform/resolvers v5.
- [Phase 1-05: Merchant Portal](2026-04-25/plans/phase1-05-merchant-portal.md) — ✅ Completed 2026-05-02. markNotificationRead + getUnreadNotifications actions, sidebar nav, merchant layout, dashboard/application/documents/brand pages. 43 tests passing. Moved pages to (merchant)/merchant/ for correct /merchant/* URLs.
- [Phase 1-06: Admin + E2E](2026-04-25/plans/phase1-06-admin-and-e2e.md) — ✅ Completed 2026-05-02. Admin layout + invitations page (send + history), E2E Playwright specs (application flow + portal auth), seed script. 43 tests passing. Added dotenv dev dep + excluded scripts/ from tsconfig.

---

## Index Maintenance Rules

- When any new doc is created under `docs/`, add it to this index in the correct section immediately.
- When a phase plan is **completed**: move it to "Historical / Superseded" in this index and update the Project Status table.
- All docs go in `docs/YYYY-MM-DD/subdir/filename.md` — date in directory, not in filename.
- `docs/superpowers/` is a runtime scratch directory — never place `.md` documentation there.
- Keep each entry to one line of description. Detail lives in the linked file.
