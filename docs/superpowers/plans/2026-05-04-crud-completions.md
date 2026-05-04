# Sub-project A: CRUD Completions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add delete UI (AlertDialog confirmation), status management selects, and edit pages for stores, hero products, and promotions across admin and merchant portals.

**Architecture:** Foundation-first: install AlertDialog + mount Toaster → reusable DeleteButton and status selects → integrate into pages → edit pages → E2E tests. All mutations go through existing Server Actions; no new actions needed.

**Tech Stack:** Next.js 16 App Router, ShadCN/ui (AlertDialog, Select), sonner toast, Lucide React, pnpm, Jest + @testing-library/react, Playwright

**Mongoose note:** Per CLAUDE.md, chain `.lean()` on all Mongoose queries. The security hook blocks writing `.exec()` in plan files — add it manually when implementing each page file.

---

## File Map

**New UI components:**
- `src/components/ui/alert-dialog.tsx` — ShadCN AlertDialog (installed via CLI)
- `src/components/shared/delete-button.tsx` — generic reusable delete confirm button
- `src/components/shared/admin/delete-store-button.tsx` — calls deleteStore action
- `src/components/shared/admin/delete-hero-product-button.tsx` — calls deleteHeroProduct action
- `src/components/shared/admin/delete-promotion-button.tsx` — calls deletePromotion (used by admin + merchant)
- `src/components/shared/admin/brand-status-select.tsx` — brand status dropdown
- `src/components/shared/admin/bank-account-status-select.tsx` — bank account status dropdown
- `src/components/shared/admin/promotion-edit-form.tsx` — shared edit form for promotions

**New pages:**
- `src/app/(admin)/admin/promotions/[id]/edit/page.tsx`
- `src/app/(merchant)/merchant/promotions/[id]/edit/page.tsx`
- `src/app/(admin)/admin/hero-products/[id]/edit/page.tsx`

**Modified:**
- `src/app/layout.tsx` — add `<Toaster />`
- `src/components/shared/admin/hero-product-form.tsx` — add edit mode (productId + initialData props)
- `src/app/(admin)/admin/stores/[id]/page.tsx` — add DeleteStoreButton
- `src/app/(admin)/admin/hero-products/page.tsx` — add edit link + DeleteHeroProductButton per card
- `src/app/(admin)/admin/promotions/page.tsx` — add operations column (edit + delete)
- `src/app/(merchant)/merchant/promotions/page.tsx` — add edit link + delete per card
- `src/app/(admin)/admin/brands/[id]/page.tsx` — add BrandStatusSelect
- `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx` — replace static Badge with BankAccountStatusSelect

**New tests:**
- `__tests__/unit/components/delete-button.test.tsx`
- `__tests__/unit/components/brand-status-select.test.tsx`
- `__tests__/unit/components/bank-account-status-select.test.tsx`

---

### Task 1: Install AlertDialog + mount Toaster

**Files:**
- Create: `src/components/ui/alert-dialog.tsx` (via CLI)
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install ShadCN AlertDialog**

```bash
pnpm dlx shadcn@latest add alert-dialog
```

Expected: `src/components/ui/alert-dialog.tsx` created.

- [ ] **Step 2: Add Toaster to root layout**

Read `src/app/layout.tsx`, then replace with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'EchoBay CRM',
  description: 'EchoBay 商户管理平台',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/alert-dialog.tsx src/app/layout.tsx
git commit -m "feat: install AlertDialog, mount Toaster in root layout"
```

---

### Task 2: DeleteButton component (TDD)

**Files:**
- Create: `src/components/shared/delete-button.tsx`
- Create: `__tests__/unit/components/delete-button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/components/delete-button.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteButton } from '@/components/shared/delete-button'

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }))

describe('DeleteButton', () => {
  const defaultProps = {
    label: '删除门店',
    description: 'ApprovedBrand Sydney CBD',
    onConfirm: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders trigger button with label', () => {
    render(<DeleteButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: '删除门店' })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => {
      expect(screen.getByText('确认删除')).toBeInTheDocument()
    })
    expect(screen.getByText(/ApprovedBrand Sydney CBD/)).toBeInTheDocument()
    expect(screen.getByText('此操作不可撤销。')).toBeInTheDocument()
  })

  it('does not call onConfirm when cancel is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => expect(screen.getByText('取消')).toBeInTheDocument())
    fireEvent.click(screen.getByText('取消'))
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => expect(screen.getByText('确认删除')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    await waitFor(() => expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1))
  })

  it('is disabled when disabled prop is true', () => {
    render(<DeleteButton {...defaultProps} disabled />)
    expect(screen.getByRole('button', { name: '删除门店' })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm jest --selectProjects ui --testPathPattern="delete-button"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement DeleteButton**

Create `src/components/shared/delete-button.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteButtonProps {
  label: string
  description: string
  onConfirm: () => Promise<void>
  disabled?: boolean
}

export function DeleteButton({ label, description, onConfirm, disabled }: DeleteButtonProps): JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          <Trash2 size={14} className="mr-1" />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <br />
            此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pnpm jest --selectProjects ui --testPathPattern="delete-button"
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/delete-button.tsx __tests__/unit/components/delete-button.test.tsx
git commit -m "feat: DeleteButton reusable component with AlertDialog confirmation"
```

---

### Task 3: BrandStatusSelect component (TDD)

**Files:**
- Create: `src/components/shared/admin/brand-status-select.tsx`
- Create: `__tests__/unit/components/brand-status-select.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/components/brand-status-select.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { BrandStatusSelect } from '@/components/shared/admin/brand-status-select'

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }))
jest.mock('@/lib/actions/brand.actions', () => ({
  updateBrand: jest.fn().mockResolvedValue({ success: true, data: undefined }),
}))
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))

describe('BrandStatusSelect', () => {
  it('renders a select element', () => {
    render(<BrandStatusSelect brandId="brand-1" currentStatus="active" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows 活跃 option', () => {
    render(<BrandStatusSelect brandId="brand-1" currentStatus="active" />)
    expect(screen.getByText('活跃')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm jest --selectProjects ui --testPathPattern="brand-status-select"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BrandStatusSelect**

Create `src/components/shared/admin/brand-status-select.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBrand } from '@/lib/actions/brand.actions'

type BrandStatus = 'active' | 'inactive' | 'suspended'

const STATUS_OPTIONS: { value: BrandStatus; label: string }[] = [
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '停用' },
  { value: 'suspended', label: '暂停' },
]

export function BrandStatusSelect({ brandId, currentStatus }: { brandId: string; currentStatus: BrandStatus }): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BrandStatus>(currentStatus)

  async function handleChange(newStatus: BrandStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBrand(brandId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error('状态更新失败: ' + result.error); return }
    setStatus(newStatus)
    toast.success('品牌状态已更新')
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BrandStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label="品牌状态"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pnpm jest --selectProjects ui --testPathPattern="brand-status-select"
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/admin/brand-status-select.tsx __tests__/unit/components/brand-status-select.test.tsx
git commit -m "feat: BrandStatusSelect — admin can toggle brand active/inactive/suspended"
```

---

### Task 4: BankAccountStatusSelect component (TDD)

**Files:**
- Create: `src/components/shared/admin/bank-account-status-select.tsx`
- Create: `__tests__/unit/components/bank-account-status-select.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/components/bank-account-status-select.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { BankAccountStatusSelect } from '@/components/shared/admin/bank-account-status-select'

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }))
jest.mock('@/lib/actions/bank-account.actions', () => ({
  updateBankAccount: jest.fn().mockResolvedValue({ success: true, data: undefined }),
}))
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))

describe('BankAccountStatusSelect', () => {
  it('renders a select element', () => {
    render(<BankAccountStatusSelect accountId="acc-1" currentStatus="active" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows 待核实 option', () => {
    render(<BankAccountStatusSelect accountId="acc-1" currentStatus="pending_verification" />)
    expect(screen.getByText('待核实')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
pnpm jest --selectProjects ui --testPathPattern="bank-account-status"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BankAccountStatusSelect**

Create `src/components/shared/admin/bank-account-status-select.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateBankAccount } from '@/lib/actions/bank-account.actions'

type BankAccountStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended'

const STATUS_OPTIONS: { value: BankAccountStatus; label: string }[] = [
  { value: 'active', label: '已激活' },
  { value: 'inactive', label: '停用' },
  { value: 'pending_verification', label: '待核实' },
  { value: 'suspended', label: '暂停' },
]

export function BankAccountStatusSelect({ accountId, currentStatus }: { accountId: string; currentStatus: BankAccountStatus }): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<BankAccountStatus>(currentStatus)

  async function handleChange(newStatus: BankAccountStatus) {
    if (newStatus === status) return
    setLoading(true)
    const result = await updateBankAccount(accountId, { status: newStatus })
    setLoading(false)
    if (!result.success) { toast.error('状态更新失败: ' + result.error); return }
    setStatus(newStatus)
    toast.success('账户状态已更新')
    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as BankAccountStatus)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      aria-label="账户状态"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
pnpm jest --selectProjects ui --testPathPattern="bank-account-status"
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/admin/bank-account-status-select.tsx __tests__/unit/components/bank-account-status-select.test.tsx
git commit -m "feat: BankAccountStatusSelect — admin can toggle account status"
```

---

### Task 5: Delete thin-wrapper components

**Files:**
- Create: `src/components/shared/admin/delete-store-button.tsx`
- Create: `src/components/shared/admin/delete-hero-product-button.tsx`
- Create: `src/components/shared/admin/delete-promotion-button.tsx`

These are thin wrappers around DeleteButton — tested via E2E, not unit tests.

- [ ] **Step 1: Create DeleteStoreButton**

Create `src/components/shared/admin/delete-store-button.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteStore } from '@/lib/actions/store.actions'
import { DeleteButton } from '@/components/shared/delete-button'

export function DeleteStoreButton({ storeId, storeName }: { storeId: string; storeName: string }): JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deleteStore(storeId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('门店已删除')
    router.push('/admin/stores')
    router.refresh()
  }

  return (
    <DeleteButton
      label="删除门店"
      description={`门店「${storeName}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
```

- [ ] **Step 2: Create DeleteHeroProductButton**

Create `src/components/shared/admin/delete-hero-product-button.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteHeroProduct } from '@/lib/actions/hero-product.actions'
import { DeleteButton } from '@/components/shared/delete-button'

export function DeleteHeroProductButton({ productId, productName }: { productId: string; productName: string }): JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deleteHeroProduct(productId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('特色产品已删除')
    router.refresh()
  }

  return (
    <DeleteButton
      label="删除"
      description={`特色产品「${productName}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
```

- [ ] **Step 3: Create DeletePromotionButton**

Create `src/components/shared/admin/delete-promotion-button.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePromotion } from '@/lib/actions/promotion.actions'
import { DeleteButton } from '@/components/shared/delete-button'

interface Props {
  promotionId: string
  promotionRule: string
  redirectTo?: string
}

export function DeletePromotionButton({ promotionId, promotionRule, redirectTo }: Props): JSX.Element {
  const router = useRouter()

  async function handleConfirm() {
    const result = await deletePromotion(promotionId)
    if (!result.success) { toast.error('删除失败: ' + result.error); return }
    toast.success('推广活动已删除')
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  const shortRule = promotionRule.length > 30 ? promotionRule.slice(0, 30) + '…' : promotionRule

  return (
    <DeleteButton
      label="删除"
      description={`推广活动「${shortRule}」将被永久删除。`}
      onConfirm={handleConfirm}
    />
  )
}
```

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/admin/delete-store-button.tsx src/components/shared/admin/delete-hero-product-button.tsx src/components/shared/admin/delete-promotion-button.tsx
git commit -m "feat: delete wrapper components for store, hero product, and promotion"
```

---

### Task 6: Integrate delete buttons + edit links into pages

**Files:**
- Modify: `src/app/(admin)/admin/stores/[id]/page.tsx`
- Modify: `src/app/(admin)/admin/hero-products/page.tsx`
- Modify: `src/app/(admin)/admin/promotions/page.tsx`
- Modify: `src/app/(merchant)/merchant/promotions/page.tsx`

- [ ] **Step 1: Store detail — add DeleteStoreButton**

Read `src/app/(admin)/admin/stores/[id]/page.tsx`. Add import and add the button in the top action bar alongside the existing "编辑" link:

```tsx
import { DeleteStoreButton } from '@/components/shared/admin/delete-store-button'

// Replace the top action bar div:
      <div className="flex items-center gap-3">
        <Link href="/admin/stores" className="text-zinc-400 hover:text-zinc-600 text-sm">← 返回门店列表</Link>
        <div className="flex-1" />
        <Link href={`/admin/stores/${id}/edit`} className="text-sm text-zinc-500 hover:text-zinc-800 underline">编辑</Link>
        <DeleteStoreButton storeId={id} storeName={store.nameEnglishBranch} />
      </div>
```

- [ ] **Step 2: Hero products list — add edit link + DeleteHeroProductButton**

Read `src/app/(admin)/admin/hero-products/page.tsx`. Add these imports:

```tsx
import Link from 'next/link'
import { DeleteHeroProductButton } from '@/components/shared/admin/delete-hero-product-button'
```

Inside `products.map(...)`, after the product info div, add a flex row with edit link and delete button:

```tsx
                    <div className="flex gap-2 mt-1 items-center">
                      <Link href={`/admin/hero-products/${id}/edit`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                        编辑
                      </Link>
                      <DeleteHeroProductButton productId={id} productName={product.name} />
                    </div>
```

- [ ] **Step 3: Admin promotions — add operations column**

Read `src/app/(admin)/admin/promotions/page.tsx`. Add imports:

```tsx
import Link from 'next/link'
import { DeletePromotionButton } from '@/components/shared/admin/delete-promotion-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
```

In `TableHeader`, add new column: `<TableHead className="text-right">操作</TableHead>`

In each `TableRow`, add at the end:

```tsx
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/admin/promotions/${id}/edit`} className="text-xs text-[#0BB5C4] hover:underline font-medium">
                            编辑
                          </Link>
                          <DeletePromotionButton promotionId={id} promotionRule={promo.promotionRule} />
                        </div>
                      </TableCell>
```

- [ ] **Step 4: Merchant promotions — add edit link + delete button**

Read `src/app/(merchant)/merchant/promotions/page.tsx`. Add imports:

```tsx
import Link from 'next/link'
import { DeletePromotionButton } from '@/components/shared/admin/delete-promotion-button'
```

In each promotion card, inside the right-side column div (after the badges), add:

```tsx
                      <div className="flex gap-2 mt-1 items-center">
                        <Link href={`/merchant/promotions/${promo._id.toString()}/edit`} className="text-xs text-[#0BB5C4] hover:underline">
                          编辑
                        </Link>
                        <DeletePromotionButton
                          promotionId={promo._id.toString()}
                          promotionRule={promo.promotionRule}
                        />
                      </div>
```

- [ ] **Step 5: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/(admin)/admin/stores/[id]/page.tsx src/app/(admin)/admin/hero-products/page.tsx src/app/(admin)/admin/promotions/page.tsx src/app/(merchant)/merchant/promotions/page.tsx
git commit -m "feat: delete buttons and edit links integrated into store, hero product, promotions"
```

---

### Task 7: Brand + bank account status UI integration

**Files:**
- Modify: `src/app/(admin)/admin/brands/[id]/page.tsx`
- Modify: `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx`

- [ ] **Step 1: Add BrandStatusSelect to brand detail right column**

Read `src/app/(admin)/admin/brands/[id]/page.tsx`. Add import:

```tsx
import { BrandStatusSelect } from '@/components/shared/admin/brand-status-select'
```

Find the right column div (`lg:col-span-1` or equivalent). After the existing action Card(s), add:

```tsx
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 font-medium">品牌状态</CardTitle>
            </CardHeader>
            <CardContent>
              <BrandStatusSelect
                brandId={id}
                currentStatus={brand.status as 'active' | 'inactive' | 'suspended'}
              />
            </CardContent>
          </Card>
```

- [ ] **Step 2: Replace static Badge with BankAccountStatusSelect**

Read `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx`. Add import:

```tsx
import { BankAccountStatusSelect } from '@/components/shared/admin/bank-account-status-select'
```

For each account card, replace the static Badge:

```tsx
// REMOVE:
//   <Badge variant={STATUS_VARIANT[acc.status] ?? 'outline'} className="text-xs">
//     {STATUS_LABEL[acc.status] ?? acc.status}
//   </Badge>

// REPLACE WITH:
                  <BankAccountStatusSelect
                    accountId={acc._id.toString()}
                    currentStatus={acc.status as 'active' | 'inactive' | 'pending_verification' | 'suspended'}
                  />
```

Remove unused `STATUS_VARIANT`, `STATUS_LABEL` constants and `Badge` import if no longer needed.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(admin)/admin/brands/[id]/page.tsx src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx
git commit -m "feat: brand status select and bank account status select in admin UI"
```

---

### Task 8: PromotionEditForm + edit pages

**Files:**
- Create: `src/components/shared/admin/promotion-edit-form.tsx`
- Create: `src/app/(admin)/admin/promotions/[id]/edit/page.tsx`
- Create: `src/app/(merchant)/merchant/promotions/[id]/edit/page.tsx`

- [ ] **Step 1: Create PromotionEditForm**

Create `src/components/shared/admin/promotion-edit-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updatePromotion } from '@/lib/actions/promotion.actions'

interface DefaultValues {
  promotionRule: string
  fromDate: string
  toDate: string
  exclusions: string
}

interface Props {
  promotionId: string
  defaultValues: DefaultValues
  cancelHref: string
  successRedirect: string
}

export function PromotionEditForm({ promotionId, defaultValues, cancelHref, successRedirect }: Props): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promotionRule, setPromotionRule] = useState(defaultValues.promotionRule)
  const [fromDate, setFromDate] = useState(defaultValues.fromDate)
  const [toDate, setToDate] = useState(defaultValues.toDate)
  const [exclusions, setExclusions] = useState(defaultValues.exclusions)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await updatePromotion(promotionId, {
      promotionRule,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      exclusions: exclusions || undefined,
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push(successRedirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="promotionRule">推广规则</Label>
        <Textarea id="promotionRule" value={promotionRule} onChange={(e) => setPromotionRule(e.target.value)} rows={3} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fromDate">开始日期</Label>
          <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="toDate">结束日期</Label>
          <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exclusions">排除条款（可选）</Label>
        <Textarea id="exclusions" value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={2} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存推广活动'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(cancelHref)}>取消</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create admin promotion edit page**

Create `src/app/(admin)/admin/promotions/[id]/edit/page.tsx`:

```tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotionEditForm } from '@/components/shared/admin/promotion-edit-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function AdminPromotionEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  await auth()
  await connectDB()
  const promo = await PromotionModel.findById(id).lean()
  if (!promo) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/admin/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">← 返回推广列表</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">编辑推广活动</CardTitle></CardHeader>
        <CardContent>
          <PromotionEditForm
            promotionId={id}
            defaultValues={{
              promotionRule: promo.promotionRule,
              fromDate: new Date(promo.fromDate).toISOString().split('T')[0],
              toDate: new Date(promo.toDate).toISOString().split('T')[0],
              exclusions: promo.exclusions ?? '',
            }}
            cancelHref="/admin/promotions"
            successRedirect="/admin/promotions"
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create merchant promotion edit page**

Create `src/app/(merchant)/merchant/promotions/[id]/edit/page.tsx`:

```tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotionEditForm } from '@/components/shared/admin/promotion-edit-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function MerchantPromotionEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  const session = await auth()
  await connectDB()
  const promo = await PromotionModel.findById(id).lean()
  if (!promo) notFound()
  if (promo.userId.toString() !== session!.user.id) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/merchant/promotions" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">← 返回推广列表</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">编辑推广活动</CardTitle></CardHeader>
        <CardContent>
          <PromotionEditForm
            promotionId={id}
            defaultValues={{
              promotionRule: promo.promotionRule,
              fromDate: new Date(promo.fromDate).toISOString().split('T')[0],
              toDate: new Date(promo.toDate).toISOString().split('T')[0],
              exclusions: promo.exclusions ?? '',
            }}
            cancelHref="/merchant/promotions"
            successRedirect="/merchant/promotions"
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/admin/promotion-edit-form.tsx src/app/(admin)/admin/promotions/[id]/edit/ src/app/(merchant)/merchant/promotions/[id]/edit/
git commit -m "feat: promotion edit form + admin and merchant edit pages"
```

---

### Task 9: HeroProductForm edit mode + hero product edit page

**Files:**
- Modify: `src/components/shared/admin/hero-product-form.tsx`
- Create: `src/app/(admin)/admin/hero-products/[id]/edit/page.tsx`

- [ ] **Step 1: Update HeroProductForm to support edit mode**

Read `src/components/shared/admin/hero-product-form.tsx`. Replace the full file with an extended version that accepts optional `productId` and `initialData`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createHeroProduct, updateHeroProduct } from '@/lib/actions/hero-product.actions'

interface BrandOption { id: string; name: string }
interface InitialData {
  name?: string; subtitle?: string; imageUrl?: string
  imageWidth?: number; imageHeight?: number; brandId?: string
}
interface Props {
  brands: BrandOption[]
  productId?: string
  initialData?: InitialData
}

export function HeroProductForm({ brands, productId, initialData }: Props): JSX.Element {
  const router = useRouter()
  const isEdit = Boolean(productId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandId, setBrandId] = useState(initialData?.brandId ?? brands[0]?.id ?? '')
  const [name, setName] = useState(initialData?.name ?? '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [imageWidth, setImageWidth] = useState(initialData?.imageWidth?.toString() ?? '')
  const [imageHeight, setImageHeight] = useState(initialData?.imageHeight?.toString() ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const width = parseInt(imageWidth, 10)
    const height = parseInt(imageHeight, 10)
    let result
    if (isEdit && productId) {
      result = await updateHeroProduct(productId, { name, subtitle, imageUrl, imageWidth: width, imageHeight: height })
    } else {
      result = await createHeroProduct({ brandId, name, subtitle, imageUrl, imageWidth: width, imageHeight: height })
    }
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push('/admin/hero-products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      {!isEdit && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brandId">品牌</Label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">产品名称</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Collection" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subtitle">产品副标题</Label>
        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Fresh styles for the season" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageUrl">图片 URL</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." required />
        <p className="text-xs text-zinc-400">必须是正方形图片，尺寸 343px–800px</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageWidth">图片宽度 (px)</Label>
          <Input id="imageWidth" type="number" min={343} max={800} value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageHeight">图片高度 (px)</Label>
          <Input id="imageHeight" type="number" min={343} max={800} value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} required />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? '保存中...' : '创建中...') : (isEdit ? '保存特色产品' : '创建特色产品')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/hero-products')}>取消</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create hero product edit page**

Create `src/app/(admin)/admin/hero-products/[id]/edit/page.tsx`:

```tsx
import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { HeroProductModel } from '@/lib/db/models/hero-product.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeroProductForm } from '@/components/shared/admin/hero-product-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

export default async function AdminHeroProductEditPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  await auth()
  await connectDB()
  const product = await HeroProductModel.findById(id).lean()
  if (!product) notFound()
  return (
    <div className="w-full flex flex-col gap-5">
      <Link href="/admin/hero-products" className="text-zinc-400 hover:text-zinc-600 text-sm w-fit">← 返回特色产品</Link>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">编辑特色产品</CardTitle></CardHeader>
        <CardContent>
          <HeroProductForm
            brands={[]}
            productId={id}
            initialData={{
              name: product.name,
              subtitle: product.subtitle,
              imageUrl: product.imageUrl,
              imageWidth: product.imageWidth,
              imageHeight: product.imageHeight,
              brandId: product.brandId.toString(),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Run lint + all unit tests**

```bash
pnpm lint && pnpm test:unit
```

Expected: 0 errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/admin/hero-product-form.tsx src/app/(admin)/admin/hero-products/[id]/edit/page.tsx
git commit -m "feat: hero product edit mode and edit page"
```

---

### Task 10: E2E tests

**Files:**
- Modify: `e2e/admin-stores.spec.ts`
- Modify: `e2e/admin-hero-products.spec.ts`
- Modify: `e2e/admin-brands.spec.ts`
- Modify: `e2e/merchant-portal.spec.ts`

- [ ] **Step 1: Store delete E2E — append to `e2e/admin-stores.spec.ts`**

```typescript
test.describe('Admin — Store delete', () => {
  test('delete button shows confirmation dialog', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await expect(page.getByRole('button', { name: '删除门店' })).toBeVisible()
    await page.getByRole('button', { name: '删除门店' }).click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await expect(page.getByText('此操作不可撤销')).toBeVisible()
  })

  test('cancel on delete dialog keeps store intact', async ({ page }) => {
    await page.goto('/admin/stores')
    await page.getByText('ApprovedBrand Sydney CBD').first().click()
    await page.getByRole('button', { name: '删除门店' }).click()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('ApprovedBrand Sydney CBD')).toBeVisible()
  })

  test('confirming delete removes store and redirects to list', async ({ page }) => {
    await page.goto('/admin/stores/new')
    await page.fill('#nameEnglishBranch', 'E2E Delete Me Store')
    await page.fill('#addressEnglish', '1 Delete St Melbourne VIC 3000')
    await page.fill('#phone', '0311110000')
    await page.fill('#storeType', 'Kiosk')
    await page.fill('#businessCategory', 'Food & Beverage')
    await page.fill('#businessHours', 'Mon-Fri 9am-5pm')
    await page.fill('#introduction', 'This store will be deleted by E2E test.')
    await page.getByRole('button', { name: /创建门店/ }).click()
    await expect(page).toHaveURL('/admin/stores', { timeout: 8000 })
    await page.getByText('E2E Delete Me Store').first().click()
    await page.getByRole('button', { name: '删除门店' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page).toHaveURL('/admin/stores', { timeout: 8000 })
    await expect(page.getByText('E2E Delete Me Store')).not.toBeVisible({ timeout: 5000 })
  })
})
```

- [ ] **Step 2: Hero product delete + edit E2E — append to `e2e/admin-hero-products.spec.ts`**

```typescript
test.describe('Admin — Hero Product delete', () => {
  test('each product card has a 删除 button', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('delete dialog appears and cancel keeps product', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('Summer Collection 2026')).toBeVisible()
  })

  test('confirming delete removes product (state-changing)', async ({ page }) => {
    await page.goto('/admin/hero-products/new')
    await page.fill('#name', 'E2E Delete Hero')
    await page.fill('#subtitle', 'Will be deleted')
    await page.fill('#imageUrl', 'https://via.placeholder.com/400')
    await page.fill('#imageWidth', '400')
    await page.fill('#imageHeight', '400')
    await page.getByRole('button', { name: /创建特色产品/ }).click()
    await expect(page).toHaveURL('/admin/hero-products', { timeout: 8000 })
    const heroCard = page.locator('.bg-zinc-50').filter({ hasText: 'E2E Delete Hero' })
    await heroCard.getByRole('button', { name: '删除' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page.getByText('E2E Delete Hero')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin — Hero Product edit', () => {
  test('each product card has an 编辑 link', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
  })

  test('edit page pre-fills existing product data', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/admin\/hero-products\/.+\/edit/)
    await expect(page.locator('#name')).not.toHaveValue('')
  })

  test('saving updated subtitle reflects on list', async ({ page }) => {
    await page.goto('/admin/hero-products')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newSubtitle = 'E2E Updated ' + Date.now()
    await page.fill('#subtitle', newSubtitle)
    await page.getByRole('button', { name: '保存特色产品' }).click()
    await expect(page).toHaveURL('/admin/hero-products', { timeout: 8000 })
    await expect(page.getByText(newSubtitle)).toBeVisible()
  })
})

test.describe('Admin — Promotion delete and edit', () => {
  test('promotions table has 操作 column', async ({ page }) => {
    await page.goto('/admin/promotions')
    await expect(page.getByText('操作')).toBeVisible()
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('promotion delete dialog cancel keeps row', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
  })

  test('promotion edit page loads with pre-filled data', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/admin\/promotions\/.+\/edit/)
    await expect(page.getByText('编辑推广活动')).toBeVisible()
    await expect(page.locator('#promotionRule')).not.toHaveValue('')
  })

  test('saving promotion edit updates rule in list', async ({ page }) => {
    await page.goto('/admin/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newRule = 'E2E Admin Updated Rule ' + Date.now()
    await page.fill('#promotionRule', newRule)
    await page.getByRole('button', { name: '保存推广活动' }).click()
    await expect(page).toHaveURL('/admin/promotions', { timeout: 8000 })
    await expect(page.getByText(newRule)).toBeVisible()
  })
})
```

- [ ] **Step 3: Brand + bank account status E2E — append to `e2e/admin-brands.spec.ts`**

```typescript
test.describe('Admin — Brand status management', () => {
  test('brand detail shows 品牌状态 select', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await expect(page.getByLabel('品牌状态')).toBeVisible()
  })

  test('brand status select contains valid options', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    const select = page.getByLabel('品牌状态')
    const value = await select.inputValue()
    expect(['active', 'inactive', 'suspended']).toContain(value)
  })

  test('changing brand status persists after reload', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    const select = page.getByLabel('品牌状态')
    const current = await select.inputValue()
    const next = current === 'active' ? 'inactive' : 'active'
    await select.selectOption(next)
    await page.waitForTimeout(1000)
    await page.reload()
    await expect(page.getByLabel('品牌状态')).toHaveValue(next)
    // Restore to active
    await page.getByLabel('品牌状态').selectOption('active')
    await page.waitForTimeout(500)
  })
})

test.describe('Admin — Bank account status management', () => {
  test('bank accounts page shows status selects for existing accounts', async ({ page }) => {
    await page.goto('/admin/brands')
    await page.getByText('ApprovedBrand').first().click()
    await page.getByText('银行账户管理').click()
    const selects = page.getByLabel('账户状态')
    if (await selects.count() > 0) {
      await expect(selects.first()).toBeVisible()
      const val = await selects.first().inputValue()
      expect(['active', 'inactive', 'pending_verification', 'suspended']).toContain(val)
    } else {
      await expect(page.getByText('添加新银行账户')).toBeVisible()
    }
  })
})
```

- [ ] **Step 4: Merchant promotion delete + edit E2E — append to `e2e/merchant-portal.spec.ts`**

```typescript
test.describe('Merchant — Promotion delete and edit', () => {
  test('promotions list has 编辑 and 删除 controls', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await expect(page.getByRole('link', { name: '编辑' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '删除' }).first()).toBeVisible()
  })

  test('delete dialog cancel keeps promotion', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('button', { name: '删除' }).first().click()
    await expect(page.getByText('确认删除')).toBeVisible()
    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByText('10% off all items this season')).toBeVisible()
  })

  test('edit link goes to merchant promotion edit page', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page).toHaveURL(/\/merchant\/promotions\/.+\/edit/)
    await expect(page.getByText('编辑推广活动')).toBeVisible()
  })

  test('edit page pre-fills promotion rule', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    await expect(page.locator('#promotionRule')).not.toHaveValue('')
  })

  test('saving merchant promotion edit updates rule', async ({ page }) => {
    await page.goto('/merchant/promotions')
    await page.getByRole('link', { name: '编辑' }).first().click()
    const newRule = 'E2E Merchant Updated ' + Date.now()
    await page.fill('#promotionRule', newRule)
    await page.getByRole('button', { name: '保存推广活动' }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    await expect(page.getByText(newRule)).toBeVisible()
  })

  test('merchant can delete their own promotion (state-changing)', async ({ page }) => {
    await page.goto('/merchant/promotions/new')
    await page.fill('#promotionRule', 'E2E Merchant Delete Me')
    await page.fill('#fromDate', '2027-01-01')
    await page.fill('#toDate', '2027-01-31')
    await page.getByRole('button', { name: /创建推广活动/ }).click()
    await expect(page).toHaveURL('/merchant/promotions', { timeout: 8000 })
    const card = page.locator('.bg-zinc-50').filter({ hasText: 'E2E Merchant Delete Me' })
    await card.getByRole('button', { name: '删除' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page.getByText('E2E Merchant Delete Me')).not.toBeVisible({ timeout: 5000 })
  })

  test('merchant cannot edit another user promotion (returns 404)', async ({ page }) => {
    await page.goto('/merchant/promotions/000000000000000000000001/edit')
    await expect(page.getByText('404').or(page.getByText('Not Found'))).toBeVisible({ timeout: 5000 })
  })
})
```

- [ ] **Step 5: Commit E2E tests**

```bash
git add e2e/
git commit -m "test(e2e): delete + edit coverage for stores, hero products, promotions, brands, bank accounts"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run full lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 2: Run all unit tests**

```bash
pnpm test:unit
```

Expected: all pass.

- [ ] **Step 3: Run production build**

```bash
pnpm build
```

Expected: 0 TypeScript errors in src/. Errors in archive/ are pre-existing — ignore them.

- [ ] **Step 4: Visual spot-check**

Start `pnpm dev` and verify:

| Route | Expected |
|---|---|
| `/admin/stores/[id]` | "删除门店" button → dialog → cancel/confirm |
| `/admin/hero-products` | Each card: "编辑" link + "删除" button |
| `/admin/promotions` | "编辑" column + "删除" column |
| `/admin/brands/[id]` | "品牌状态" select in right panel |
| `/admin/brands/[id]/bank-accounts` | Status select per account |
| `/admin/promotions/[id]/edit` | Pre-filled edit form |
| `/admin/hero-products/[id]/edit` | Pre-filled edit form |
| `/merchant/promotions` | "编辑" link + "删除" per card |
| `/merchant/promotions/[id]/edit` | Pre-filled form, merchant ownership enforced |

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Sub-project A complete — delete UI, status management, edit pages (TDD + E2E)"
```
