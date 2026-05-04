# EchoBay CRM — UI 全面重构设计规范

**日期:** 2026-05-03  
**范围:** Admin Portal + Merchant Portal + Auth Pages（全部页面）  
**方案:** 全面重构 — Layouts、所有页面、所有组件

---

## 1. 色彩系统

在 `src/app/globals.css` 的 `:root` 中替换所有 token：

| CSS Variable | Hex | 用途 |
|---|---|---|
| `--primary` | `#1B3F72` | Sidebar 背景、主品牌色 |
| `--primary-dark` | `#152F56` | Sidebar hover/active 背景 |
| `--accent` | `#0BB5C4` | 激活状态、CTA 按钮、图标 |
| `--accent-hover` | `#099EAB` | accent hover |
| `--background` | `#F1F5F9` | 内容区背景 |
| `--card` | `#FFFFFF` | 卡片背景 |
| `--border` | `#E2E8F0` | 分割线、边框 |
| `--foreground` | `#0F172A` | 主文字 |
| `--muted-foreground` | `#64748B` | 次要文字 |
| `--destructive` | `#EF4444` | 错误/拒绝 |
| `--success` | `#10B981` | 通过/批准 |
| `--warning` | `#F59E0B` | 待审核/警告 |

在 `@theme inline` 中补充映射 `--color-success`、`--color-warning`、`--color-accent`。

---

## 2. 字体

将 `src/app/layout.tsx` 中的 `Geist` / `Geist_Mono` 替换为 `Inter`（通过 `next/font/google`）。

```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
```

---

## 3. 全局骨架布局

### 3.1 共用结构（Admin & Merchant 通用）

```
<div class="flex h-screen overflow-hidden">
  <Sidebar />                          // w-60, fixed, bg-primary
  <div class="flex flex-col flex-1 overflow-hidden">
    <Header />                         // h-14, bg-white, border-b, sticky top-0
    <main class="flex-1 overflow-auto bg-[#F1F5F9] p-6">
      {children}
    </main>
  </div>
</div>
```

关键改变：
- `min-h-screen` → `h-screen overflow-hidden`（防止双滚动条）
- `main` 用 `overflow-auto` 独立滚动
- 移除所有 `max-w-*` 限制，内容区 `w-full`

### 3.2 Sidebar 组件（新建 `src/components/shared/layout/sidebar.tsx`）

**结构：**
- **Logo 区** (h-16)：`/logo.png` 图片（32px 高）+ "EchoBay" 文字，深蓝背景
- **Nav 区**（`flex-1 py-4 px-3`）：nav items 列表
- **底部区**：用户邮箱（截断）+ 退出按钮

**Nav Item 三态：**
- 默认：文字/图标 `text-slate-400`，hover `bg-[#152F56] text-white`
- 激活：`bg-[rgba(11,181,196,0.15)] text-white` + 左侧 `border-l-[3px] border-[#0BB5C4]`
- 所有 transition：`transition-colors duration-150`

**Admin Nav Items（含 Lucide 图标）：**

| 图标 | 标签 | 路由 |
|---|---|---|
| `LayoutDashboard` | 数据概览 | `/admin/dashboard` |
| `Mail` | 邀请管理 | `/admin/invitations` |
| `ClipboardList` | 申请审核 | `/admin/applications` |
| `Users` | 商户管理 | `/admin/merchants` |
| `Building2` | 品牌管理 | `/admin/brands` |
| `Store` | 门店管理 | `/admin/stores` |
| `Tag` | 推广活动 | `/admin/promotions` |
| `Star` | 特色产品 | `/admin/hero-products` |

Admin Sidebar 新建 `src/components/shared/layout/admin-sidebar.tsx`（`'use client'`），使用 `usePathname` 判断激活状态，结构同 merchant SidebarNav。

### 3.3 Header 组件（新建 `src/components/shared/layout/app-header.tsx`）

Props：`{ title: string; breadcrumb?: { label: string; href: string }[] }`

**结构（左→右）：**
- 左侧：面包屑链接（若有） `/ 当前页标题`，标题 `font-semibold text-slate-800 text-sm`
- 右侧：
  - `Bell` 图标按钮（未来扩展通知）
  - 分割线
  - 用户头像（首字母，`bg-[#0BB5C4] text-white rounded-full w-8 h-8`）
  - 用户名 + 角色 badge（`admin` → 深蓝，`merchant` → 青色）

Header 是 `'use client'`（需要 `useSession` 获取用户信息）或从 layout 的 server session 以 prop 传入（推荐 Server Component + prop 传入）。

**推荐做法：** Layout（Server）读取 session，将 `user: { name, email, role }` 以 prop 传给 `<AppHeader user={user} title="..." />`。AppHeader 本身无需 session，可以是 Server Component——但面包屑需要当前路由，改为 Client Component 读 `usePathname` 动态生成面包屑。

最终：`AppHeader` 是 `'use client'`，layout 将 `user` 序列化为 prop 传入。

---

## 4. 各页面改动清单

### 4.1 Auth Pages

**Login / ForgotPassword / ResetPassword：**
- 背景：左侧 40% 深海蓝品牌色渐变区域（含 Logo 大图 + Slogan），右侧 60% 白色表单区
- 移除 `bg-zinc-50` 全屏灰色背景
- Logo：使用 `<Image>` 显示 `/logo.png` 而非 "EB" 文字方块
- 按钮：品牌青色 `bg-[#0BB5C4] hover:bg-[#099EAB] text-white`

### 4.2 Admin Pages

所有 Admin 页面：
- 移除 `max-w-4xl`，改为 `w-full`
- 页面顶部不再有 `<h1>` 标题（标题移到 Header Bar 的 `title` prop）

**Admin Dashboard (`/admin/dashboard`)：**
- 统计卡片：`grid grid-cols-2 lg:grid-cols-4 gap-4`（从 3 列扩展到 4 列）
- 每张卡片左上角有 Lucide 图标（带品牌色圆形背景），数字大字 `text-3xl font-bold tabular-nums`
- 最近申请表格：改为全宽表格 `<table>` 样式，有列头（公司名 / 邮箱 / 提交日期 / 状态），比当前 list 更专业
- 右侧新增一个"邀请概览"卡片（利用宽屏）

**Admin Applications (`/admin/applications`)：**
- 状态过滤 tab：改为横向 tab bar（下划线激活样式），不再是卡片式按钮
- 搜索栏：全宽，带 `Search` 图标
- 列表：改为正式 `<table>`（公司名 / 联系人邮箱 / 提交时间 / 审核时间 / 状态 / 操作）
- 操作列：直接有"查看"按钮，不用整行点击

**Admin Application Detail (`/admin/applications/[id]`)：**
- 左右两栏布局（`grid grid-cols-3 gap-6`）：左侧 2/3 是申请详情，右侧 1/3 是操作面板（状态更改 + 备注）
- 不再是单列堆叠

**Admin Merchants (`/admin/merchants`)：**
- 全宽表格（商户名 / 品牌 / 邮箱 / 门店数 / 状态 / 操作）

**Admin Merchant Detail (`/admin/merchants/[id]`)：**
- 同 Application Detail，左右两栏

**Admin Brands (`/admin/brands`)：**
- 全宽表格（品牌名 / Logo / 关联商户 / 门店数 / 状态 / 操作）

**Admin Brand Detail (`/admin/brands/[id]`)：**
- 品牌信息 + 关联门店 + 银行账户，Tab 切换

**Admin Stores (`/admin/stores`)：**
- 全宽表格

**Admin Hero Products (`/admin/hero-products`)：**
- 卡片 grid（`grid-cols-2 lg:grid-cols-4`，展示图片）

**Admin Promotions (`/admin/promotions`)：**
- 全宽表格

**Admin Invitations (`/admin/invitations`)：**
- 顶部：发送邀请表单（收起/展开式 panel）
- 下方：邀请列表表格（邮箱 / 状态 / 有效期 / 操作）

### 4.3 Merchant Pages

所有 Merchant 页面：
- 移除 `max-w-2xl`，改为 `w-full`
- 标题移到 Header Bar

**Merchant Dashboard：**
- 顶部：状态卡片全宽（醒目的状态色带）
- 中部：`grid grid-cols-2 gap-4`（快捷入口卡片）
- 通知列表：右侧浮出式或内嵌列表

**Merchant Application：**
- Tab 切换各表单分页（现有逻辑保留）
- 表单区 `max-w-3xl`（表单可读性限制，但整体布局全宽）

**Merchant Documents：**
- 上传区 + 已上传文件列表，两栏布局

**Merchant Brand：**
- 品牌信息展示卡片，全宽

**Merchant Store：**
- 门店信息，全宽

**Merchant Promotions：**
- 活动列表 + 新建按钮，全宽

---

## 5. 通用组件规范

### Badge（状态标签）

替换默认 ShadCN badge 的颜色变量为语义色：

| 状态 | 颜色方案 |
|---|---|
| 已批准 / approved | `bg-emerald-100 text-emerald-700` |
| 已提交 / submitted | `bg-blue-100 text-blue-700` |
| 审核中 / under_review | `bg-blue-100 text-blue-700` |
| 需补充 / requires_info | `bg-amber-100 text-amber-700` |
| 已拒绝 / rejected | `bg-red-100 text-red-700` |
| 草稿 / draft | `bg-slate-100 text-slate-600` |

### Button

- Primary：`bg-[#0BB5C4] hover:bg-[#099EAB] text-white` + `shadow-sm`
- Destructive：保持红色
- Outline：`border-slate-200 text-slate-700 hover:bg-slate-50`

### Card

- `bg-white rounded-xl border border-slate-200 shadow-sm`
- 内边距统一 `p-5` 或 `p-6`

### Table

新建 `src/components/ui/data-table.tsx` 通用表格样式：
- `<thead>` 背景 `bg-slate-50`，文字 `text-slate-500 text-xs uppercase tracking-wide`
- 行 hover `hover:bg-slate-50`
- 行间分割线 `divide-y divide-slate-100`

---

## 6. Apply 页面（公开申请）

`/apply/[token]` 和 `/apply/[token]/invalid` 保留当前逻辑，但：
- 背景改为品牌渐变（与 Login 左侧一致）
- 表单卡片白色居中，`max-w-2xl`
- Logo 使用图片

---

## 7. 文件改动范围总览

| 文件 | 操作 |
|---|---|
| `src/app/globals.css` | 替换所有 CSS token |
| `src/app/layout.tsx` | Inter 字体、metadata 更新 |
| `src/app/(admin)/layout.tsx` | 新骨架结构 + AdminSidebar + AppHeader |
| `src/app/(merchant)/layout.tsx` | 新骨架结构 + AppHeader |
| `src/components/shared/layout/admin-sidebar.tsx` | 新建 |
| `src/components/shared/layout/app-header.tsx` | 新建 |
| `src/components/shared/merchant-portal/sidebar-nav.tsx` | 重构样式 |
| `src/components/ui/data-table.tsx` | 新建通用表格 |
| `src/app/(auth)/login/page.tsx` | 两栏布局 |
| `src/app/(auth)/login/forgot-password/page.tsx` | 两栏布局 |
| `src/app/(auth)/login/reset-password/page.tsx` | 两栏布局 |
| `src/app/(admin)/admin/dashboard/page.tsx` | 4 列 grid、table |
| `src/app/(admin)/admin/applications/page.tsx` | table 布局 |
| `src/app/(admin)/admin/applications/[id]/page.tsx` | 两栏布局 |
| `src/app/(admin)/admin/merchants/page.tsx` | table 布局 |
| `src/app/(admin)/admin/merchants/[id]/page.tsx` | 两栏布局 |
| `src/app/(admin)/admin/brands/page.tsx` | grid/table |
| `src/app/(admin)/admin/brands/[id]/page.tsx` | tab 布局 |
| `src/app/(admin)/admin/brands/[id]/bank-accounts/page.tsx` | 全宽 |
| `src/app/(admin)/admin/stores/page.tsx` | table 布局 |
| `src/app/(admin)/admin/stores/[id]/page.tsx` | 全宽 |
| `src/app/(admin)/admin/stores/new/page.tsx` | 全宽 |
| `src/app/(admin)/admin/stores/[id]/edit/page.tsx` | 全宽 |
| `src/app/(admin)/admin/promotions/page.tsx` | table 布局 |
| `src/app/(admin)/admin/hero-products/page.tsx` | grid 布局 |
| `src/app/(admin)/admin/hero-products/new/page.tsx` | 全宽 |
| `src/app/(admin)/admin/invitations/page.tsx` | 全宽 |
| `src/app/(merchant)/merchant/dashboard/page.tsx` | grid 布局 |
| `src/app/(merchant)/merchant/application/page.tsx` | 全宽 |
| `src/app/(merchant)/merchant/documents/page.tsx` | 两栏 |
| `src/app/(merchant)/merchant/brand/page.tsx` | 全宽 |
| `src/app/(merchant)/merchant/store/page.tsx` | 全宽 |
| `src/app/(merchant)/merchant/promotions/page.tsx` | 全宽 |
| `src/app/(merchant)/merchant/promotions/new/page.tsx` | 全宽 |
| `src/app/apply/[token]/page.tsx` | 品牌样式 |
| `src/app/apply/[token]/invalid/page.tsx` | 品牌样式 |

---

## 8. 不改动的内容

- 所有 Server Action 逻辑（`src/lib/actions/`）
- 所有数据库模型（`src/lib/db/`）
- 所有 Zod 验证（`src/lib/validations/`）
- 所有测试文件（`__tests__/`、`e2e/`）
- 表单逻辑和字段（只改样式，不改功能）
- Auth.js 配置

---

## 9. Logo 图片

Logo 原始文件位于：  
`archive/echobay-crm/frontend/app/src/assets/images/logo-light.png`

实施时需先将其复制到 `public/logo.png`：
```bash
cp archive/echobay-crm/frontend/app/src/assets/images/logo-light.png public/logo.png
```

Sidebar 中使用：
```tsx
<Image src="/logo.png" alt="EchoBay" height={32} width={32} className="object-contain" />
```
