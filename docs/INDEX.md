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

## Project Status (updated 2026-04-26)

**Platform:** EchoBay CRM — merchant onboarding portal + admin CRM (Phase 1: merchant portal only).  
**Stack:** Next.js 16 App Router, ShadCN/ui (base-nova), Auth.js v5, Mongoose 9 → MongoDB Atlas, Zod, Mailgun, Cloudinary, pnpm.  
**Phase 1 scope:** Invitation → 6-tab application wizard → merchant portal dashboard. Admin CRM is Phase 2.

### What is done

| Module | Status |
|--------|--------|
| Project scaffold (Next.js 16, ShadCN, Jest, Playwright, CLAUDE.md, git) | ✅ Complete — Phase 1-00 |

### What is NOT yet done

| Module | Phase |
|--------|-------|
| Mongoose models + AES-256-GCM encryption | Phase 1-01 |
| Auth.js v5 + Zod validation schemas + middleware | Phase 1-02 |
| Mailgun email service + invitation flow + apply route | Phase 1-03 |
| 6-tab merchant application form (draft save + submit) | Phase 1-04 |
| Merchant portal (dashboard, notifications, brand, documents) | Phase 1-05 |
| Admin invitations page + Playwright E2E tests | Phase 1-06 |

---

## Active Plans (follow these)

### Phase 1 Implementation Plans

The authoritative step-by-step TDD plans for each phase. Execute in order. The current active phase is marked **CURRENT**.

- [Phase 1-01: Data Layer](superpowers/plans/2026-04-25-phase1-01-data-layer.md) — **CURRENT** — connectDB singleton, User / MerchantInvitation / MerchantApplication / Notification / MerchantDocument models, AES-256-GCM encrypt utility
- [Phase 1-02: Auth & Validation](superpowers/plans/2026-04-25-phase1-02-auth-validation.md) — Auth.js v5 Credentials provider, Zod schemas for login + 6 form tabs, session middleware
- [Phase 1-03: Invitation Flow](superpowers/plans/2026-04-25-phase1-03-invitation-flow.md) — Mailgun via fetch, sendMerchantInvitation + validateInvitationToken actions, apply/[token] server-side route
- [Phase 1-04: Application Form](superpowers/plans/2026-04-25-phase1-04-application-form.md) — 6-tab wizard, saveDraftApplication + submitApplication actions, atomic user creation
- [Phase 1-05: Merchant Portal](superpowers/plans/2026-04-25-phase1-05-merchant-portal.md) — Dashboard, notifications, application detail, documents, brand pages
- [Phase 1-06: Admin + E2E](superpowers/plans/2026-04-25-phase1-06-admin-and-e2e.md) — Admin invitations page, E2E seed script, Playwright test suite

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

---

## Index Maintenance Rules

- When any new doc is created under `docs/`, add it to this index in the correct section immediately.
- When a phase plan is **completed**: move it from "Active Plans" to "Historical / Superseded", and move the plan file itself from `docs/superpowers/plans/` to `docs/YYYY-MM-DD/plans/`.
- When the project status changes (phase completed, new module added): update the "What is done / not done" tables.
- Hand-written docs go under `docs/YYYY-MM-DD/` with lowercase kebab-case filenames (date in directory, not filename).
- Superpowers-generated active plans live in `docs/superpowers/plans/YYYY-MM-DD-name.md` (date in filename) until completed.
- Keep each entry to one line of description. Detail lives in the linked file.
