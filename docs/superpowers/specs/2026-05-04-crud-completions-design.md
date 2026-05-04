# Sub-project A: CRUD 补全设计规范

**日期:** 2026-05-04  
**范围:** 删除 UI、状态管理、编辑页面（Admin + Merchant）  
**前提:** 所有后端 action 已存在并已有单元测试覆盖

---

## 1. 新增 ShadCN 组件

通过 CLI 安装 AlertDialog：
```bash
pnpm dlx shadcn@latest add alert-dialog
```

---

## 2. 新增共享组件

### 2.1 `DeleteButton`

**文件：** `src/components/shared/delete-button.tsx`  
**类型：** `'use client'`

```
Props:
  label: string          — 触发按钮文字（如 "删除门店"）
  description: string    — 弹窗内补充说明（如 "门店名称"）
  onConfirm: () => Promise<void>
  disabled?: boolean
```

行为：
- 渲染一个 variant="destructive" 的按钮
- 点击后弹出 AlertDialog，标题固定为"确认删除"，内容显示 description + "此操作不可撤销。"
- 点击"取消"关闭弹窗，不执行任何操作
- 点击"确认删除"执行 `onConfirm()`，期间按钮显示 loading 状态
- 执行失败时弹出错误提示（通过 sonner toast）

**单元测试：** `__tests__/unit/components/delete-button.test.tsx`
- 渲染按钮
- 点击后弹出 AlertDialog（含确认/取消按钮）
- 点击取消不调用 onConfirm
- 点击确认调用 onConfirm 一次

---

### 2.2 `BrandStatusSelect`

**文件：** `src/components/shared/admin/brand-status-select.tsx`  
**类型：** `'use client'`

```
Props:
  brandId: string
  currentStatus: 'active' | 'inactive' | 'suspended'
```

行为：
- 渲染 ShadCN Select，三个选项：活跃 / 停用 / 暂停
- 选中新值后调用 `updateBrand(brandId, { status: newStatus })`
- 成功后调用 `router.refresh()`
- 失败后通过 sonner toast 报错

**单元测试：** `__tests__/unit/components/brand-status-select.test.tsx`
- 渲染时显示当前状态
- 三个选项都存在

---

### 2.3 `BankAccountStatusSelect`

**文件：** `src/components/shared/admin/bank-account-status-select.tsx`  
**类型：** `'use client'`

```
Props:
  accountId: string
  currentStatus: 'active' | 'inactive' | 'pending_verification' | 'suspended'
```

行为：
- 渲染 ShadCN Select，四个选项：已激活 / 停用 / 待核实 / 暂停
- 选中新值后调用 `updateBankAccount(accountId, { status: newStatus })`
- 成功后 `router.refresh()`
- 失败后 sonner toast 报错

**单元测试：** `__tests__/unit/components/bank-account-status-select.test.tsx`
- 渲染时显示当前状态
- 四个选项都存在

---

## 3. 删除 UI 集成

### 3.1 门店删除

**文件：** `src/app/(admin)/admin/stores/[id]/page.tsx`

顶部操作栏（含现有"编辑"链接）加入 `DeleteStoreButton`：

```tsx
// src/components/shared/admin/delete-store-button.tsx ('use client')
// Props: storeId: string, storeName: string
// onConfirm: 调用 deleteStore(storeId)，成功后 router.push('/admin/stores')
```

---

### 3.2 特色产品删除

**文件：** `src/app/(admin)/admin/hero-products/page.tsx`

每张产品卡片右上角加 `DeleteHeroProductButton`：

```tsx
// src/components/shared/admin/delete-hero-product-button.tsx ('use client')
// Props: productId: string, productName: string
// onConfirm: 调用 deleteHeroProduct(productId)，成功后 router.refresh()
```

---

### 3.3 推广活动删除（Admin）

**文件：** `src/app/(admin)/admin/promotions/page.tsx`

表格增加"操作"列，含 `DeletePromotionButton`：

```tsx
// src/components/shared/admin/delete-promotion-button.tsx ('use client')
// Props: promotionId: string, promotionRule: string
// onConfirm: 调用 deletePromotion(promotionId)，成功后 router.refresh()
```

---

### 3.4 推广活动删除（Merchant）

**文件：** `src/app/(merchant)/merchant/promotions/page.tsx`

每张推广卡片右侧加 `DeletePromotionButton`（复用同一个组件）。

---

## 4. 编辑页面

### 4.1 推广活动编辑（Admin）

**新文件：** `src/app/(admin)/admin/promotions/[id]/edit/page.tsx`

- Server Component：通过 `PromotionModel.findById(id)` 加载数据，鉴权（auth + connectDB）
- 不存在则 `notFound()`
- 渲染 `PromotionEditForm`（预填充数据）

**新文件：** `src/components/shared/admin/promotion-edit-form.tsx`（`'use client'`）

- Props：`{ promotionId, defaultValues: { promotionRule, fromDate, toDate, exclusions } }`
- 表单字段：推广规则（textarea）、开始日期、结束日期、排除说明
- 提交调用 `updatePromotion(promotionId, data)`，成功后 `router.push('/admin/promotions')`
- 失败显示错误信息

**Admin 推广列表** 增加每行"编辑"链接 → `/admin/promotions/[id]/edit`

---

### 4.2 推广活动编辑（Merchant）

**新文件：** `src/app/(merchant)/merchant/promotions/[id]/edit/page.tsx`

- 加载推广数据，鉴权：`promotion.userId.toString() === session.user.id`（不匹配则 notFound）
- 渲染 `PromotionEditForm`（复用），提交后 redirect 到 `/merchant/promotions`

**Merchant 推广列表** 每张卡片加"编辑"链接 → `/merchant/promotions/[id]/edit`

---

### 4.3 特色产品编辑（Admin）

**新文件：** `src/app/(admin)/admin/hero-products/[id]/edit/page.tsx`

- 加载 `HeroProductModel.findById(id)`，不存在则 `notFound()`
- 渲染 `HeroProductEditForm`（预填充数据）

**新文件：** `src/components/shared/admin/hero-product-edit-form.tsx`（`'use client'`）

- Props：`{ productId, defaultValues: { name, subtitle, imageUrl, imageWidth, imageHeight, brandId } }`
- 字段与新建表单相同
- 提交调用 `updateHeroProduct(productId, data)`，验证规则同创建（正方形、343-800px）
- 成功后 `router.push('/admin/hero-products')`

**特色产品列表** 每张卡片加"编辑"链接 → `/admin/hero-products/[id]/edit`

---

## 5. 状态管理 UI 集成

### 5.1 品牌状态

**文件：** `src/app/(admin)/admin/brands/[id]/page.tsx`

右侧操作 Card 内（现有"← 返回品牌列表"区域下方），加入：

```tsx
<Card>
  <CardHeader><CardTitle>状态管理</CardTitle></CardHeader>
  <CardContent>
    <BrandStatusSelect brandId={id} currentStatus={brand.status} />
  </CardContent>
</Card>
```

---

### 5.2 银行账户状态

**文件：** `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx`

每条账户记录的 Badge 替换为 `BankAccountStatusSelect`：

```tsx
// 原来: <Badge>{STATUS_LABEL[acc.status]}</Badge>
// 改为: <BankAccountStatusSelect accountId={acc._id.toString()} currentStatus={acc.status} />
```

---

## 6. 测试覆盖计划

### 单元/组件测试（新增）
- `delete-button.test.tsx` — 4 个测试
- `brand-status-select.test.tsx` — 2 个测试
- `bank-account-status-select.test.tsx` — 2 个测试

### E2E 测试（扩展现有文件）

**`admin-stores.spec.ts` 新增：**
- 删除门店 → 从列表消失

**`admin-hero-products.spec.ts` 新增：**
- 删除特色产品 → 从列表消失
- 编辑特色产品 → 保存后反映新 subtitle

**`admin-brands.spec.ts` 新增：**
- 品牌状态切换为停用 → Badge 更新
- 银行账户状态切换 → 选项更新

**`admin-hero-products.spec.ts` 新增（Admin 推广编辑）：**
- 编辑推广活动 → 保存后规则更新

**`merchant-portal.spec.ts` 新增：**
- 商户删除推广活动 → 从列表消失
- 商户编辑推广活动 → 保存后规则更新

---

## 7. 不改动的内容

- 所有 Server Action 实现（`deleteStore`, `deleteHeroProduct`, `deletePromotion`, `updateBrand`, `updateBankAccount`, `updateHeroProduct`, `updatePromotion`）
- 所有现有单元测试
- 所有现有 E2E 测试逻辑（只追加，不修改）
- 数据模型
