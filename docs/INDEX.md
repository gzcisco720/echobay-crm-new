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

**Platform:** EchoBay CRM — merchant onboarding portal + admin CRM (Phase 1: merchant portal only).  
**Stack:** Next.js 16 App Router, ShadCN/ui (base-nova), Auth.js v5, Mongoose 9 → MongoDB Atlas, Zod, Mailgun, Cloudinary, pnpm.  
**Phase 1 scope:** Invitation → 6-tab application wizard → merchant portal dashboard. Admin CRM is Phase 2.

### What is done

| Module | Status |
|--------|--------|
| Project scaffold (Next.js 16, ShadCN, Jest, Playwright, CLAUDE.md, git) | ✅ Complete — Phase 1-00 |
| Mongoose models + AES-256-GCM encryption | ✅ Complete — Phase 1-01 |
| Auth.js v5 + Zod validation schemas + login page + middleware | ✅ Complete — Phase 1-02 |
| Mailgun email service + invitation flow + apply route | ✅ Complete — Phase 1-03 |
| 6-tab merchant application form (draft save + submit + Cloudinary) | ✅ Complete — Phase 1-04 |
| Merchant portal (dashboard, notifications, application, documents, brand) | ✅ Complete — Phase 1-05 |

### What is NOT yet done

| Module | Phase |
|--------|-------|
| Admin invitations page + Playwright E2E tests | Phase 1-06 |

---

## Active Plans (follow these)

### Phase 1 Implementation Plans

The authoritative step-by-step TDD plans for each phase. Execute in order. The current active phase is marked **CURRENT**.

- [Phase 1-06: Admin + E2E](2026-04-25/plans/phase1-06-admin-and-e2e.md) — **CURRENT** — Admin invitations page, E2E seed script, Playwright test suite

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

---

## Index Maintenance Rules

- When any new doc is created under `docs/`, add it to this index in the correct section immediately.
- When a phase plan is **completed**: move it to "Historical / Superseded" in this index and update the Project Status table.
- All docs go in `docs/YYYY-MM-DD/subdir/filename.md` — date in directory, not in filename.
- `docs/superpowers/` is a runtime scratch directory — never place `.md` documentation there.
- Keep each entry to one line of description. Detail lives in the linked file.
