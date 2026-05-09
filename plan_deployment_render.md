# Render Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy EchoBay CRM to Render as a production Next.js 16 web service with all external integrations (MongoDB Atlas, Cloudinary, Mailgun) fully connected.

**Architecture:** Next.js 16 App Router deployed as a Node.js web service on Render. The app is stateless (sessions via JWT in cookies); all persistence lives in MongoDB Atlas (external) and Cloudinary (external). Render only runs the Node process — no database is provisioned on Render itself.

**Tech Stack:** Next.js 16, Node 22, pnpm, Auth.js v5, MongoDB Atlas, Cloudinary, Mailgun, render.yaml (IaC)

---

## Prerequisites (must be done before this plan)

Sub-project E (i18n 中英双语) is still **pending**. Complete it first using `plan_e_i18n.md`, then run quality gates:

```bash
pnpm lint && pnpm test && pnpm build
```

All three must exit cleanly before proceeding to Phase 1.

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `engines` field for Node 22 |
| `.node-version` | Create | Pin Node 22 for Render runtime detection |
| `src/app/api/health/route.ts` | Create | Health check endpoint Render pings after deploy |
| `__tests__/unit/api/health.test.ts` | Create | TDD test for health route |
| `render.yaml` | Create | Infrastructure-as-code: service definition + env var keys |

---

## Phase 1 — Code Changes for Deployment Readiness

### Task 1: Pin Node.js version

**Files:**
- Modify: `package.json` (add `engines` field)
- Create: `.node-version`

- [ ] **Step 1.1: Add `engines` to package.json**

Open `package.json` and add after `"private": true`:

```json
"engines": {
  "node": ">=22.0.0"
},
```

- [ ] **Step 1.2: Create `.node-version`**

Create file `.node-version` at project root with content:

```
22
```

- [ ] **Step 1.3: Verify build still works locally**

```bash
pnpm build
```

Expected: build completes with 0 TypeScript errors, no warnings.

- [ ] **Step 1.4: Commit**

```bash
git add package.json .node-version
git commit -m "chore: pin Node.js version to 22 for Render deployment"
```

---

### Task 2: Create health check API route (TDD)

**Files:**
- Create: `__tests__/unit/api/health.test.ts`
- Create: `src/app/api/health/route.ts`

- [ ] **Step 2.1: Write the failing test**

Create `__tests__/unit/api/health.test.ts`:

```typescript
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const response = GET()
    const body = await response.json() as unknown
    expect(response.status).toBe(200)
    expect(body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
pnpm test:unit --testPathPattern="health"
```

Expected: FAIL — `Cannot find module '@/app/api/health/route'`

- [ ] **Step 2.3: Write minimal implementation**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' })
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
pnpm test:unit --testPathPattern="health"
```

Expected: PASS

- [ ] **Step 2.5: Commit**

```bash
git add __tests__/unit/api/health.test.ts src/app/api/health/route.ts
git commit -m "feat: add /api/health check endpoint for Render"
```

---

### Task 3: Create `render.yaml`

**Files:**
- Create: `render.yaml` at project root

No TDD — this is a YAML configuration file. Render reads it to know what to build and run.

- [ ] **Step 3.1: Create `render.yaml`**

```yaml
services:
  - type: web
    name: echobay-crm
    runtime: node
    region: oregon
    plan: starter
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: AUTH_TRUST_HOST
        value: "true"
      - key: MONGODB_URI
        sync: false
      - key: NEXTAUTH_URL
        sync: false
      - key: AUTH_SECRET
        sync: false
      - key: ENCRYPTION_KEY
        sync: false
      - key: MAILGUN_API_KEY
        sync: false
      - key: MAILGUN_DOMAIN
        sync: false
      - key: MAILGUN_FROM
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
```

Notes on fields:
- `plan: starter` = $7/month. Use `free` for testing (service sleeps after inactivity).
- `sync: false` = key is declared but value is NOT in the YAML file (you fill it in the Render dashboard). Never commit secret values.
- `AUTH_TRUST_HOST: "true"` = required for Auth.js v5 on non-Vercel platforms; without it, CSRF validation fails.
- `region: oregon` = closest to most MongoDB Atlas free-tier clusters. Change to `frankfurt` if Atlas cluster is EU.

- [ ] **Step 3.2: Commit**

```bash
git add render.yaml
git commit -m "chore: add render.yaml for Render deployment IaC"
```

---

### Task 4: Quality gate before pushing

- [ ] **Step 4.1: Run full quality gate**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: all three exit 0 with no errors.

- [ ] **Step 4.2: Push to main**

```bash
git push origin main
```

---

## Phase 2 — External Services Configuration

These steps happen in external dashboards, not in code.

### Task 5: MongoDB Atlas — allow connections from Render

Render's IP addresses rotate. The simplest approach for a starter project is to allow all IPs.

- [ ] **Step 5.1: Open MongoDB Atlas → Network Access**
  1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
  2. Your project → **Network Access** → **+ Add IP Address**
  3. Choose **Allow Access from Anywhere** (sets `0.0.0.0/0`)
  4. Click **Confirm**

> If you're on Atlas M10+ and want stricter security, use Render's [static outbound IPs](https://render.com/docs/static-outbound-ip-addresses) instead. For a starter plan, Render does **not** offer static IPs — use `0.0.0.0/0`.

- [ ] **Step 5.2: Test the connection string locally**

```bash
MONGODB_URI="<your-atlas-uri>" node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
"
```

Expected: prints `Connected`.

---

### Task 6: Collect all environment variable values

Before touching the Render dashboard, gather every value in one place (locally in `.env.local` — never commit).

| Variable | Where to find | Example format |
|----------|---------------|----------------|
| `MONGODB_URI` | Atlas → Database → Connect → Drivers | `mongodb+srv://user:pass@cluster.mongodb.net/echobay-crm` |
| `NEXTAUTH_URL` | Will be `https://<service-name>.onrender.com` — set AFTER service is created | `https://echobay-crm.onrender.com` |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` | 44-char base64 string |
| `ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` | 64-char hex string |
| `MAILGUN_API_KEY` | Mailgun → Account → API Keys | `key-xxxxxxxx` |
| `MAILGUN_DOMAIN` | Mailgun → Sending → Domains | `mg.yourdomain.com` |
| `MAILGUN_FROM` | Match your Mailgun sender | `EchoBay <noreply@mg.yourdomain.com>` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary → Dashboard | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary → Dashboard | numeric string |
| `CLOUDINARY_API_SECRET` | Cloudinary → Dashboard | alphanumeric string |

Generate secrets:

```bash
# AUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -hex 32
```

---

## Phase 3 — Render Platform Setup

### Task 7: Create the Web Service on Render

- [ ] **Step 7.1: Create account and link GitHub**
  1. Go to [render.com](https://render.com) → **Sign up** (or log in)
  2. **New +** → **Blueprint** (uses `render.yaml` from your repo)
  3. Connect your GitHub account if not already connected
  4. Select the `echobay-crm-new` repository
  5. Render reads `render.yaml` and shows a preview of the service
  6. Click **Apply**

  Alternatively if Blueprint fails to detect: **New +** → **Web Service** → select repo → fill in manually (see Step 7.2).

- [ ] **Step 7.2: Verify service settings (manual fallback)**

If not using Blueprint, verify these fields in the Render dashboard:

| Field | Value |
|-------|-------|
| Language | Node |
| Build Command | `pnpm install --frozen-lockfile && pnpm build` |
| Start Command | `pnpm start` |
| Health Check Path | `/api/health` |
| Node Version | `22` (or from `.node-version` auto-detected) |

---

### Task 8: Set environment variables in Render dashboard

- [ ] **Step 8.1: Add variables**
  1. Open your service → **Environment** tab
  2. Click **Add from .env** and paste all variables at once, or add one by one
  3. Set `NEXTAUTH_URL` = `https://<your-service-name>.onrender.com` (copy the URL from the top of the service page)
  4. Click **Save Changes** (do NOT trigger deploy yet)

- [ ] **Step 8.2: Double-check all 11 variables are present**

```
NODE_ENV=production
AUTH_TRUST_HOST=true
MONGODB_URI=...
NEXTAUTH_URL=...
AUTH_SECRET=...
ENCRYPTION_KEY=...
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
MAILGUN_FROM=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

### Task 9: Trigger first deploy

- [ ] **Step 9.1: Deploy**

In the Render dashboard → **Manual Deploy** → **Deploy latest commit**.

Watch the build log. Expected sequence:
```
==> Running build command: pnpm install --frozen-lockfile && pnpm build
...
==> Build successful
==> Starting service with: pnpm start
==> Your service is live
```

- [ ] **Step 9.2: Confirm health check passes**

Render polls `/api/health` after start. In the Events log you should see:

```
Health check passed
```

If the health check fails, check:
1. `pnpm start` runs `next start` (defaults to port 3000)
2. Render expects the app to listen on `process.env.PORT` — but Next.js handles this automatically.

---

## Phase 4 — Smoke Testing

All tests run against the live production URL: `https://<service-name>.onrender.com`

### Task 10: Verify authentication

- [ ] **Step 10.1: Admin login**
  1. Navigate to `https://<service-name>.onrender.com/login`
  2. Login with admin credentials
  3. Should redirect to `/admin/dashboard`
  4. Verify stat cards load (confirms MongoDB connection)

- [ ] **Step 10.2: Merchant login**
  1. Logout (if your staging DB has a merchant user) or invite one via admin
  2. Login as merchant → should reach `/merchant/dashboard`

- [ ] **Step 10.3: Role guard test**
  1. While logged in as merchant, visit `/admin/dashboard` directly
  2. Should redirect to `/login` (confirms middleware + Auth.js)

---

### Task 11: Verify core flows

- [ ] **Step 11.1: Invitation email**
  1. Admin → Invite → send invitation to a real email address you control
  2. Confirm email arrives from Mailgun with correct link

- [ ] **Step 11.2: File upload**
  1. Login as a merchant with an approved application
  2. Upload a test PDF in `/merchant/documents`
  3. Confirm upload succeeds and file appears (confirms Cloudinary integration)

- [ ] **Step 11.3: i18n switcher**
  1. Click 中/EN toggle in the header
  2. Confirm UI language switches correctly on all pages

---

## Phase 5 — Post-Deploy Hardening (Optional)

These are improvements for after the initial deploy is confirmed working.

### Task 12: Upgrade plan from Starter to paid (if needed)

Free/Starter services on Render sleep after 15 minutes of inactivity. For a production CRM:
- **Starter ($7/month):** No sleep, 512MB RAM, 0.1 CPU — sufficient for a small CRM
- **Standard ($25/month):** 2GB RAM, 1 CPU — if you see memory pressure

Change plan: Render Dashboard → your service → **Settings** → **Instance Type**.

### Task 13: Custom domain (optional)

- [ ] **Step 13.1: Add domain in Render**
  1. Service → **Settings** → **Custom Domains** → **+ Add Custom Domain**
  2. Enter your domain (e.g., `crm.echobay.com`)
  3. Add the CNAME record shown in your DNS provider

- [ ] **Step 13.2: Update NEXTAUTH_URL**
  1. Once DNS propagates and TLS certificate is issued by Render
  2. Update `NEXTAUTH_URL` in Render environment to `https://crm.echobay.com`
  3. Render will auto-redeploy

### Task 14: Enable auto-deploy from main

Auto-deploy is on by default when you connect a repo. Verify in:
Service → **Settings** → **Build & Deploy** → **Auto-Deploy** → should be **Yes**.

Every push to `main` will trigger a new deploy. The old instance stays live until the new build passes health checks.

---

## Rollback Procedure

If a deploy breaks production:
1. Render Dashboard → your service → **Events** tab
2. Find the last good deploy → click **Rollback to this deploy**
3. Render instantly reverts to the previous build (no rebuild needed)

---

## Environment Variable Cheatsheet

```bash
# Generate AUTH_SECRET (run locally, copy output to Render)
openssl rand -base64 32

# Generate ENCRYPTION_KEY (run locally, copy output to Render)
openssl rand -hex 32

# Test MongoDB connection locally
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(()=>console.log('OK')).catch(console.error)"
```
