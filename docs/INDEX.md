# EchoBay CRM — Docs Index

> **AI assistant**: Read this file first every session to orient yourself.
> When a new plan, design doc, or API reference is created, add it here immediately.
> Format: `- [Title](path) — one-line description`

---

## How to Use This Index

1. **Starting a session** → read "Project Status" below, then open the active plan.
2. **Implementing a feature** → check "Active Plans" for the relevant phase.
3. **Looking up a data model or route** → check "Architecture & Design".
4. **Checking a past design decision** → check "Architecture & Design" or "Historical".
5. **Superseded docs** are listed at the bottom — do not follow them for implementation.

---

## Project Status (updated 2026-04-26)

**Platform:** EchoBay CRM — merchant onboarding portal + admin CRM (Phase 1: merchant portal only).  
**Stack:** Next.js 16 App Router, ShadCN/ui (base-nova), Auth.js v5, Mongoose 9 → MongoDB Atlas, Zod, Mailgun, Cloudinary, pnpm.  
**Phase 1 scope:** Invitation → 6-tab application form → merchant portal dashboard. Admin CRM is Phase 2.

### What is done

| Module | Status |
|--------|--------|
| Project scaffold (Next.js 16, ShadCN, Jest, Playwright, git) | ✅ Complete — Phase 1-00 |

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

- [Phase 1-01: Data Layer](superpowers/plans/2026-04-25-phase1-01-data-layer.md) — **CURRENT** — Mongoose singleton, 5 models, AES-256-GCM
- [Phase 1-02: Auth & Validation](superpowers/plans/2026-04-25-phase1-02-auth-validation.md) — Auth.js v5 Credentials, Zod schemas, middleware
- [Phase 1-03: Invitation Flow](superpowers/plans/2026-04-25-phase1-03-invitation-flow.md) — Mailgun, validateInvitationToken, apply/[token] route
- [Phase 1-04: Application Form](superpowers/plans/2026-04-25-phase1-04-application-form.md) — 6-tab wizard, draft auto-save, submit action
- [Phase 1-05: Merchant Portal](superpowers/plans/2026-04-25-phase1-05-merchant-portal.md) — Dashboard, notifications, brand, documents pages
- [Phase 1-06: Admin + E2E](superpowers/plans/2026-04-25-phase1-06-admin-and-e2e.md) — Admin invitations page, E2E seed + tests

---

## Architecture & Design

- [Merchant Portal Design Spec](superpowers/specs/2026-04-24-echobay-crm-merchant-portal-design.md) — Full Phase 1 design: tech stack, directory structure, data models, auth flow, 6-tab form, Server Actions, testing strategy

---

## Configuration

*(No configuration docs yet — add here when created, e.g. deployment guide, env variable reference)*

---

## Historical / Superseded (do not follow for implementation)

- [Phase 1-00: Project Setup](superpowers/plans/2026-04-25-phase1-00-project-setup.md) — ✅ Completed 2026-04-26. Next.js 16.2.4, ShadCN base-nova, Jest, Playwright, CLAUDE.md, git init.

---

## Index Maintenance Rules

- When any new doc is created under `docs/`, add it to this index in the correct section.
- When a phase plan is completed, move it from "Active Plans" to "Historical / Superseded".
- When the project status changes (phase completed, new module added), update the "Project Status" table.
- New docs created by hand go under `docs/YYYY-MM-DD/` with lowercase kebab-case filenames.
- Superpowers-generated plans and specs live in `docs/superpowers/plans/` and `docs/superpowers/specs/`.
- Keep each entry to one line of description. Detail lives in the linked file.
