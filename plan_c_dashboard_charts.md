# Sub-project C: Dashboard Charts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Add three charts to the Admin dashboard (weekly application trend, status distribution donut, invitation conversion funnel) using Recharts and TDD.

**Architecture:** Two new Server Action functions provide serialized chart data; three Client Components render the charts; the existing dashboard Server Component page orchestrates data fetching and passes plain props to each Client Component.

**Tech Stack:** Recharts 2.x, Next.js 16 Server/Client Components, MongoDB aggregation ($isoWeekYear / $isoWeek), Jest + MongoMemoryServer, Playwright E2E.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add recharts dependency |
| `src/lib/actions/dashboard.actions.ts` | Modify | Add getApplicationTrend + getInvitationFunnel |
| `src/components/admin/charts/application-trend-chart.tsx` | Create | Recharts BarChart — weekly counts |
| `src/components/admin/charts/application-status-chart.tsx` | Create | Recharts PieChart donut — status breakdown |
| `src/components/admin/charts/invitation-funnel-chart.tsx` | Create | Pure Tailwind progress-bar funnel |
| `src/app/(admin)/admin/dashboard/page.tsx` | Modify | Call new actions, render chart components |
| `__tests__/integration/actions/dashboard.actions.test.ts` | Modify | Tests for new action functions |
| `e2e/admin-dashboard.spec.ts` | Create | E2E: chart containers and content visible |

---

## Task 1: Install Recharts

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1.1: Install recharts**

```bash
pnpm add recharts
```

Expected: recharts appears in `package.json` dependencies.

- [ ] **Step 1.2: Verify TypeScript types are included**

```bash
pnpm tsc --noEmit 2>&1 | head -5
```

Expected: no errors (recharts ships its own types).

---

## Task 2: getApplicationTrend action (TDD)

**Files:**
- Modify: `src/lib/actions/dashboard.actions.ts`
- Modify: `__tests__/integration/actions/dashboard.actions.test.ts`

- [ ] **Step 2.1: Write failing test**

Append to `__tests__/integration/actions/dashboard.actions.test.ts`:

```typescript
import { getApplicationTrend, getInvitationFunnel } from '@/lib/actions/dashboard.actions'

describe('getApplicationTrend', () => {
  it('returns one entry per week for applications in range', async () => {
    // Create 2 apps in the same week, 1 in an older week
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    await createApp('submitted', 'Trend A')
    await createApp('approved', 'Trend B')
    // Manually set one to two weeks ago so it falls in a different week
    await MerchantApplicationModel.updateOne(
      { registeredCompanyName: 'Trend A' },
      { $set: { createdAt: twoWeeksAgo } }
    )

    const result = await getApplicationTrend(12)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.length).toBeGreaterThanOrEqual(1)
    // Every entry has week (string) and count (number >= 1)
    for (const entry of result.data) {
      expect(typeof entry.week).toBe('string')
      expect(entry.count).toBeGreaterThanOrEqual(1)
    }
  })

  it('returns empty array when no applications exist', async () => {
    const result = await getApplicationTrend(12)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(0)
  })
})
```

- [ ] **Step 2.2: Run to confirm RED**

```bash
npx jest --testPathPatterns="dashboard.actions" 2>&1 | tail -10
```

Expected: FAIL — getApplicationTrend not exported

- [ ] **Step 2.3: Implement getApplicationTrend**

Add to `src/lib/actions/dashboard.actions.ts`:

```typescript
interface TrendEntry {
  week: string
  count: number
}

export async function getApplicationTrend(
  weeks: number
): Promise<ActionResult<TrendEntry[]>> {
  try {
    await connectDB()
    const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)
    const raw = await MerchantApplicationModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]).exec()

    const data: TrendEntry[] = raw.map((r) => ({
      week: `W${String(r._id.week as number).padStart(2, '0')}`,
      count: r.count as number,
    }))

    return { success: true, data }
  } catch {
    return { success: false, error: '获取申请趋势失败' }
  }
}
```

- [ ] **Step 2.4: Run to confirm GREEN**

```bash
npx jest --testPathPatterns="dashboard.actions" 2>&1 | tail -10
```

Expected: getApplicationTrend tests PASS

---

## Task 3: getInvitationFunnel action (TDD)

**Files:**
- Modify: `src/lib/actions/dashboard.actions.ts`
- Modify: `__tests__/integration/actions/dashboard.actions.test.ts`

- [ ] **Step 3.1: Write failing test**

Append to `__tests__/integration/actions/dashboard.actions.test.ts`:

```typescript
describe('getInvitationFunnel', () => {
  it('returns correct funnel counts', async () => {
    // Create 3 invitations
    await MerchantInvitationModel.create([
      { email: 'a@test.com', token: 'tok1', expiresAt: new Date(Date.now() + 86400000), invitedBy: new mongoose.Types.ObjectId() },
      { email: 'b@test.com', token: 'tok2', expiresAt: new Date(Date.now() + 86400000), invitedBy: new mongoose.Types.ObjectId() },
      { email: 'c@test.com', token: 'tok3', expiresAt: new Date(Date.now() + 86400000), invitedBy: new mongoose.Types.ObjectId() },
    ])
    // 2 have submitted, 1 approved
    await createApp('submitted', 'Funnel A')
    await createApp('approved', 'Funnel B')

    const result = await getInvitationFunnel()
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.sent).toBe(3)
    expect(result.data.applied).toBe(2)
    expect(result.data.approved).toBe(1)
  })
})
```

- [ ] **Step 3.2: Run to confirm RED**

```bash
npx jest --testPathPatterns="dashboard.actions" 2>&1 | tail -10
```

Expected: FAIL — getInvitationFunnel not exported

- [ ] **Step 3.3: Implement getInvitationFunnel**

Add to `src/lib/actions/dashboard.actions.ts`:

```typescript
interface FunnelData {
  sent: number
  applied: number
  approved: number
}

export async function getInvitationFunnel(): Promise<ActionResult<FunnelData>> {
  try {
    await connectDB()
    const [sent, applied, approved] = await Promise.all([
      MerchantInvitationModel.countDocuments().exec(),
      MerchantApplicationModel.countDocuments({ status: { $ne: 'draft' } }).exec(),
      MerchantApplicationModel.countDocuments({ status: 'approved' }).exec(),
    ])
    return { success: true, data: { sent, applied, approved } }
  } catch {
    return { success: false, error: '获取转化漏斗数据失败' }
  }
}
```

Note: `MerchantInvitationModel` is already imported in the existing `dashboard.actions.ts`.

- [ ] **Step 3.4: Run all dashboard action tests**

```bash
npx jest --testPathPatterns="dashboard.actions" 2>&1 | tail -10
```

Expected: all tests PASS

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/actions/dashboard.actions.ts \
        __tests__/integration/actions/dashboard.actions.test.ts
git commit -m "feat: getApplicationTrend + getInvitationFunnel actions (TDD)"
```

---

## Task 4: ApplicationTrendChart component

**Files:**
- Create: `src/components/admin/charts/application-trend-chart.tsx`

- [ ] **Step 4.1: Create the component**

```typescript
'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface TrendEntry {
  week: string
  count: number
}

interface ApplicationTrendChartProps {
  data: TrendEntry[]
}

export function ApplicationTrendChart({ data }: ApplicationTrendChartProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-zinc-400 text-sm">
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(value: number) => [value, '申请数']}
        />
        <Bar dataKey="count" fill="#0BB5C4" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4.2: Run lint**

```bash
pnpm lint 2>&1 | tail -5
```

Expected: 0 errors

---

## Task 5: ApplicationStatusChart component

**Files:**
- Create: `src/components/admin/charts/application-status-chart.tsx`

- [ ] **Step 5.1: Create the component**

```typescript
'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface StatusCounts {
  submitted: number
  under_review: number
  approved: number
  rejected: number
  requires_info: number
}

interface ApplicationStatusChartProps {
  counts: StatusCounts
}

const STATUS_CONFIG = [
  { key: 'approved', label: '已批准', color: '#10b981' },
  { key: 'submitted', label: '已提交', color: '#0BB5C4' },
  { key: 'under_review', label: '审核中', color: '#3b82f6' },
  { key: 'requires_info', label: '待补充', color: '#f59e0b' },
  { key: 'rejected', label: '已拒绝', color: '#ef4444' },
] as const

export function ApplicationStatusChart({ counts }: ApplicationStatusChartProps): React.JSX.Element {
  const data = STATUS_CONFIG
    .map(({ key, label, color }) => ({ name: label, value: counts[key], color }))
    .filter((d) => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-zinc-400 text-sm">
        暂无数据
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={64}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-zinc-400">总计</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-zinc-500">{name}</span>
            </div>
            <span className="text-xs font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Run lint**

```bash
pnpm lint 2>&1 | tail -5
```

Expected: 0 errors

---

## Task 6: InvitationFunnelChart component

**Files:**
- Create: `src/components/admin/charts/invitation-funnel-chart.tsx`

- [ ] **Step 6.1: Create the component**

```typescript
import React from 'react'

interface FunnelData {
  sent: number
  applied: number
  approved: number
}

interface InvitationFunnelChartProps {
  data: FunnelData
}

export function InvitationFunnelChart({ data }: InvitationFunnelChartProps): React.JSX.Element {
  const { sent, applied, approved } = data
  const appliedPct = sent > 0 ? Math.round((applied / sent) * 100) : 0
  const approvedPct = sent > 0 ? Math.round((approved / sent) * 100) : 0

  const rows = [
    { label: '已发送邀请', value: sent, pct: 100, color: 'bg-[#0BB5C4]' },
    { label: '已提交申请', value: applied, pct: appliedPct, color: 'bg-[#1B3F72]' },
    { label: '已批准', value: approved, pct: approvedPct, color: 'bg-emerald-500' },
  ]

  return (
    <div className="flex flex-col gap-3 max-w-lg">
      {rows.map(({ label, value, pct, color }) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="text-xs font-semibold text-slate-800">
              {value} <span className="text-zinc-400 font-normal">({pct}%)</span>
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

Note: This component has no interactivity, so no `'use client'` needed — it's a Server Component.

- [ ] **Step 6.2: Run lint**

```bash
pnpm lint 2>&1 | tail -5
```

Expected: 0 errors

---

## Task 7: Update admin dashboard page

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 7.1: Add imports**

Add these imports at the top of the file (after existing imports):

```typescript
import { getApplicationTrend, getInvitationFunnel } from '@/lib/actions/dashboard.actions'
import { ApplicationTrendChart } from '@/components/admin/charts/application-trend-chart'
import { ApplicationStatusChart } from '@/components/admin/charts/application-status-chart'
import { InvitationFunnelChart } from '@/components/admin/charts/invitation-funnel-chart'
```

- [ ] **Step 7.2: Add data fetching**

In the page function body, after the existing `stats` array, add:

```typescript
const [trendResult, funnelResult] = await Promise.all([
  getApplicationTrend(12),
  getInvitationFunnel(),
])
const trendData = trendResult.success ? trendResult.data : []
const funnelData = funnelResult.success
  ? funnelResult.data
  : { sent: 0, applied: 0, approved: 0 }
```

- [ ] **Step 7.3: Insert chart section into JSX**

In the returned JSX, between the 6-card grid and the recent-applications Card, insert:

```tsx
{/* Charts row 1: Trend (2/3) + Donut (1/3) */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card className="lg:col-span-2">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold text-slate-800">
        每周申请量（最近 12 周）
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ApplicationTrendChart data={trendData} />
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold text-slate-800">申请状态分布</CardTitle>
    </CardHeader>
    <CardContent>
      <ApplicationStatusChart
        counts={{
          submitted,
          under_review,
          approved,
          rejected,
          requires_info,
        }}
      />
    </CardContent>
  </Card>
</div>

{/* Charts row 2: Funnel full width */}
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-semibold text-slate-800">邀请转化漏斗</CardTitle>
  </CardHeader>
  <CardContent>
    <InvitationFunnelChart data={funnelData} />
  </CardContent>
</Card>
```

Note: `submitted`, `under_review`, `approved`, `rejected`, `requires_info` are already computed from the existing `apps.filter(...)` calls.

- [ ] **Step 7.4: Run build to verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "Error|error TS" | head -10
```

Expected: 0 errors

- [ ] **Step 7.5: Commit**

```bash
git add src/components/admin/charts/ \
        "src/app/(admin)/admin/dashboard/page.tsx"
git commit -m "feat: dashboard chart components + page integration"
```

---

## Task 8: E2E tests

**Files:**
- Create: `e2e/admin-dashboard.spec.ts`

- [ ] **Step 8.1: Create E2E test file**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin — Dashboard charts', () => {
  test('dashboard page loads with all chart sections', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('每周申请量（最近 12 周）')).toBeVisible()
    await expect(page.getByText('申请状态分布')).toBeVisible()
    await expect(page.getByText('邀请转化漏斗')).toBeVisible()
  })

  test('trend chart renders a bar chart', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // Recharts renders SVG — verify at least one rect (bar) or empty state exists
    const hasBars = await page.locator('.recharts-bar-rectangle').count()
    const hasEmptyState = await page.getByText('暂无数据').count()
    expect(hasBars + hasEmptyState).toBeGreaterThan(0)
  })

  test('status chart renders a donut chart', async ({ page }) => {
    await page.goto('/admin/dashboard')
    // Recharts renders SVG paths for pie segments or empty state
    const hasPaths = await page.locator('.recharts-pie-sector').count()
    const hasEmptyState = await page.getByText('暂无数据').count()
    expect(hasPaths + hasEmptyState).toBeGreaterThan(0)
  })

  test('funnel shows three progress bar labels', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('已发送邀请')).toBeVisible()
    await expect(page.getByText('已提交申请')).toBeVisible()
    await expect(page.getByText('已批准').first()).toBeVisible()
  })
})
```

- [ ] **Step 8.2: Run E2E tests**

```bash
pnpm seed:e2e && pnpm test:e2e --project=admin --grep "Dashboard charts" 2>&1 | tail -10
```

Expected: all tests PASS

---

## Task 9: Final quality gates + commit

- [ ] **Step 9.1: Full quality gate**

```bash
pnpm lint && pnpm test && pnpm build 2>&1 | tail -6
```

Expected: lint 0 errors, all tests pass, build succeeds

- [ ] **Step 9.2: Update task_plan.md and progress.md**

Mark Sub-project C complete in `task_plan.md`.
Set Current Phase to Sub-project D.
Log session summary in `progress.md`.

- [ ] **Step 9.3: Final commit**

```bash
git add -A
git commit -m "feat: Sub-project C complete — admin dashboard charts"
```
