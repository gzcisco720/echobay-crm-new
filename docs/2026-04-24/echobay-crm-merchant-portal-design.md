# EchoBay CRM — Merchant 入驻门户 设计规格

**日期**：2026-04-24  
**状态**：待实现  
**阶段**：Phase 1（Merchant 入驻门户）  
**负责人**：eric.it.echobay@gmail.com

---

## 1. 背景与目标

将旧版 `echobay-crm`（React + NestJS 分离架构）完全重建为全栈 Next.js 15 应用。  
Phase 1 专注于 **Merchant 入驻门户**，包含：

1. 商家邀请流程（Admin 发起 → 商家收到邮件 → 点击链接）
2. 商家申请表单（6-Tab，中英双语，ShadCN 设计风格）
3. 商家门户（申请状态追踪、文件上传、协议查看、品牌/门店信息）

Admin 内部 CRM（审核工作台、商家管理列表等）为 **Phase 2**，不在本规格范围内，但路由结构已预留。

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | Server Components + Server Actions |
| 语言 | TypeScript (strict mode) | 无 `any`，显式类型 |
| UI 库 | ShadCN/ui + Tailwind CSS v4 | Neutral 色系，Inter 字体 |
| 图标 | Lucide React | |
| 认证 | Auth.js v5 (NextAuth) | Credentials Provider，JWT session |
| 数据库 | MongoDB Atlas + Mongoose | 单例连接模式 |
| 文件存储 | Cloudinary | Logo 上传，合同文件 |
| 邮件 | Mailgun | 邀请邮件，状态通知 |
| 表单校验 | Zod | 替代 class-validator |
| 包管理 | pnpm | 与现有项目规范一致 |
| 测试 | Jest + Testing Library + Playwright | TDD 工作流 |
| 数据模型测试 | mongodb-memory-server | 内存 MongoDB，无需外部依赖 |

---

## 3. 项目目录结构

```
echobay-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/                     # 公开：登录页
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── apply/
│   │   │   └── [token]/                # 公开：商家申请表单（凭邀请 token）
│   │   │       └── page.tsx
│   │   ├── (merchant)/                 # 受保护：商家门户（role=merchant）
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── application/            # 查看/编辑已提交申请
│   │   │   ├── documents/              # 补充文件上传
│   │   │   └── brand/                  # 品牌/门店基本信息
│   │   ├── (admin)/                    # 受保护：Admin CRM（role=admin|super_admin）
│   │   │   └── layout.tsx              # Phase 2 实现
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/     # Auth.js handler
│   │   │   └── upload/                 # Cloudinary 上传 Route Handler
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                         # ShadCN 自动生成组件
│   │   └── shared/                     # 业务组件
│   │       ├── merchant-form/          # 6-Tab 申请表单
│   │       ├── merchant-portal/        # 商家门户组件
│   │       └── auth/                   # 登录相关组件
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connect.ts              # Mongoose 单例连接
│   │   │   └── models/                 # Mongoose 数据模型
│   │   ├── actions/                    # Server Actions
│   │   │   ├── application.actions.ts
│   │   │   ├── invitation.actions.ts
│   │   │   └── upload.actions.ts
│   │   ├── auth/
│   │   │   └── auth.config.ts          # Auth.js 配置
│   │   ├── validations/                # Zod schemas
│   │   │   ├── application.schema.ts
│   │   │   └── auth.schema.ts
│   │   └── mail/
│   │       └── mailgun.ts              # 邮件发送服务
│   └── types/                          # TypeScript 全局类型
│       ├── application.ts
│       ├── auth.ts
│       └── next-auth.d.ts              # 扩展 Session 类型
├── __tests__/
│   ├── unit/                           # 单元测试
│   ├── integration/                    # 集成测试（mongodb-memory-server）
│   └── e2e/                            # Playwright E2E
├── docs/
│   ├── INDEX.md                        # 项目状态索引（每 Phase 更新）
│   └── superpowers/
│       └── specs/
│           └── 2026-04-24-echobay-crm-merchant-portal-design.md
├── public/
├── CLAUDE.md
├── next.config.ts
├── tailwind.config.ts
├── components.json                     # ShadCN 配置
└── package.json
```

---

## 4. 认证与授权

### 用户角色

```typescript
type UserRole = 'merchant' | 'admin' | 'super_admin';
```

### 认证流程

- **Auth.js v5** Credentials Provider（email + password）
- Session 存储为 JWT（无数据库 session）
- `role` 字段嵌入 JWT token
- Middleware 基于路由前缀做角色拦截：
  - `/(merchant)/*` → 需要 `role === 'merchant'`
  - `/(admin)/*` → 需要 `role === 'admin' | 'super_admin'`

### 商家账号创建时机

商家在完成申请表单的**最后一步（Tab ⑥ 协议签名）提交时**同步创建账号：
1. 验证邀请 token 仍有效
2. 创建 `User` 文档（email 来自 invitation，密码由商家在 Tab ⑥ 设置）
3. 创建 `MerchantApplication` 文档，状态 `submitted`
4. 失效邀请 token
5. 自动登录 → 跳转商家门户仪表盘

---

## 5. 数据模型

### 5.1 User

```typescript
{
  email: string;           // 唯一，小写
  password: string;        // bcrypt hash
  role: UserRole;
  name: string;
  isActive: boolean;       // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 MerchantInvitation

```typescript
{
  email: string;           // 被邀请商家的邮箱
  token: string;           // UUID v4，唯一
  expiresAt: Date;         // 默认 7 天有效期
  status: 'pending' | 'used' | 'expired';
  invitedBy: ObjectId;     // 引用 User（admin）
  createdAt: Date;
}
```

### 5.3 MerchantApplication

```typescript
{
  userId: ObjectId;        // 关联 User（提交时创建）
  invitationId: ObjectId;  // 关联 MerchantInvitation
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_info';
  // draft：草稿自动保存状态（Tab 切换时写入），提交后变为 submitted

  // Tab 1: 公司信息
  registeredCompanyName: string;
  tradingName?: string;
  acn: string;
  abn: string;
  registeredAddress: string;
  postalAddress?: string;
  sameAsRegistered: boolean;
  countryOfIncorporation: string;      // default: 'Australia'

  // Tab 2: 联系人
  primaryContact: {
    name: string; position?: string; email: string; phone: string;
  };
  isAuthorizedSignatory: boolean;      // default: true
  authorizedDirector?: {               // 条件字段，isAuthorizedSignatory=false 时必填
    name: string; position?: string; email?: string; phone?: string;
  };
  financeContact: {
    name: string; position: string; email: string; phone: string;
  };

  // Tab 3: 品牌 & 门店
  brandNameEnglish: string;
  brandNameChinese?: string;           // 新增
  brandIntroductionEnglish: string;
  website?: string;
  socialMediaAccounts: string[];
  logoUploads: Record<string, string>; // Cloudinary public_ids
  mainCategories: string[];
  storesInAustralia: number;
  storesToList: number;
  otherCountries?: string;

  // Tab 4: 银行账户
  bankAccountName: string;
  bankAccountNumber: string;           // AES-256-GCM 加密存储，密钥来自 ENCRYPTION_KEY 环境变量
  bankName: string;
  bankBsb: string;                     // BSB 码

  // Tab 5: 合作方案
  paymentMethods: string[];
  interestedInChinesePayments: boolean;
  paymentPromotions?: string;
  selectedPlatforms: string[];
  otherPlatforms?: string;
  notifyForFuturePlatforms: boolean;
  upfrontBenefits?: string;
  customerCashback?: number;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  ongoingPromotion: boolean;
  affiliateMarketing: boolean;
  exclusions?: string;
  additionalServices: string[];

  // Tab 6: 协议签名
  agreementAccepted: boolean;
  setupFeeAccepted: boolean;
  applicantSignature: string;          // 打字签名（typed name）；Phase 1 不做手写画布签名
  applicantName: string;
  applicantPosition: string;
  applicantDate: string;
  witnessSignature: string;
  witnessName: string;
  witnessDate: string;

  // 管理字段
  adminNotes?: string;                 // Admin 审核备注
  requiresInfoReason?: string;        // 需补充资料时的说明
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.4 MerchantDocument（补充文件）

```typescript
{
  userId: ObjectId;
  applicationId: ObjectId;
  type: string;                        // 文件类型标签
  fileName: string;
  cloudinaryPublicId: string;
  uploadedAt: Date;
  requestedBy?: ObjectId;             // Admin 要求上传时关联
}
```

### 5.5 Notification

```typescript
{
  userId: ObjectId;
  type: 'status_change' | 'info_required' | 'approved' | 'general';
  title: string;                       // 中文标题
  message: string;
  isRead: boolean;                     // default: false
  createdAt: Date;
}
```

---

## 6. 关键用户流程

### 6.1 商家邀请流程

```
Admin 登录
  → 在 Admin 后台输入商家邮箱，点击"发送邀请"
  → Server Action: 创建 MerchantInvitation（token, 7天有效期）
  → Mailgun 发送邀请邮件（含 /apply/[token] 链接）
  → 商家收到邮件，点击链接
  → Next.js /apply/[token] 页面验证 token 有效性
    → 无效/过期 → 展示错误页
    → 有效 → 展示申请表单（email 预填，只读）
```

### 6.2 申请表单流程（6 Tab）

```
Tab ① 公司信息    → 6 个字段，全部必填（tradingName 可选）
Tab ② 联系人      → 主联系人 4 字段 + 条件展开授权董事 + 财务联系人 4 字段
Tab ③ 品牌 & 门店 → 品牌信息 + Logo 上传（Cloudinary）+ 门店信息
Tab ④ 银行账户    → 4 字段，加密传输提示
Tab ⑤ 合作方案    → 支付方式、平台、促销、附加服务
Tab ⑥ 协议签名    → 设置账号密码 + 阅读协议 + 电子签名（申请人 + 见证人）

提交：
  → Zod 全表单最终校验
  → Server Action: 创建 User + MerchantApplication（原子操作）
  → 失效 invitation token
  → 发送确认邮件给商家
  → 自动登录 → 跳转 /merchant/dashboard
```

草稿自动保存：每个 Tab 切换时调用 Server Action 保存 `draft` 状态，商家可中途关闭浏览器，重新打开邀请链接继续填写（token 未使用，草稿已存）。

### 6.3 商家门户

**仪表盘** (`/merchant/dashboard`)：
- 申请状态卡片（submitted / under_review / requires_info / approved / rejected）
- 未读通知列表
- 快速操作入口

**申请详情** (`/merchant/application`)：
- 查看已提交的完整申请信息
- 状态为 `under_review` 或 `submitted` 时：可编辑部分字段（不含协议签名）
- 状态为 `requires_info` 时：显示 Admin 要求补充的内容说明

**文件上传** (`/merchant/documents`)：
- 查看 Admin 要求上传的文件列表
- 通过 Cloudinary 上传文件

**品牌信息** (`/merchant/brand`)：
- 申请批准后展示品牌卡片（Logo、名称、简介）
- 批准前展示"申请审核中"占位状态

---

## 7. 路由与页面清单（Phase 1）

| 路由 | 访问权限 | 说明 |
|------|----------|------|
| `/login` | 公开 | 统一登录页（商家 + Admin） |
| `/apply/[token]` | 公开（凭 token） | 商家申请表单 |
| `/merchant/dashboard` | merchant | 商家仪表盘 |
| `/merchant/application` | merchant | 申请详情 & 编辑 |
| `/merchant/documents` | merchant | 文件上传 |
| `/merchant/brand` | merchant | 品牌信息 |
| `/api/upload` | merchant | Cloudinary 上传 Route Handler |
| `/api/auth/[...nextauth]` | 公开 | Auth.js 路由 |

---

## 8. Server Actions 清单

| Action | 描述 |
|--------|------|
| `validateInvitationToken(token)` | 验证 token 有效性，返回关联 email |
| `saveDraftApplication(token, data)` | 自动保存草稿 |
| `submitApplication(token, data)` | 提交申请 + 创建 User 账号 |
| `updateApplication(id, data)` | 商家修改已提交申请（审核前） |
| `uploadDocument(applicationId, file)` | 上传补充文件到 Cloudinary |
| `markNotificationRead(id)` | 标记通知已读 |

---

## 9. 测试策略（TDD）

遵循 `Red → Green → Refactor` 循环，每个 Server Action 和数据模型先写测试。

| 测试类型 | 工具 | 覆盖范围 |
|---------|------|---------|
| 单元测试 | Jest + Testing Library | Zod schemas，工具函数，React 组件 |
| 集成测试 | Jest + mongodb-memory-server | Server Actions，Mongoose 模型 |
| E2E 测试 | Playwright | 完整申请流程，商家门户关键路径 |

测试文件与源码对应关系：
- `src/lib/actions/application.actions.ts` → `__tests__/integration/application.actions.test.ts`
- `src/lib/validations/application.schema.ts` → `__tests__/unit/application.schema.test.ts`
- `src/lib/db/models/` → `__tests__/integration/models/*.test.ts`

---

## 10. CLAUDE.md 规范（新项目）

新项目的 `CLAUDE.md` 将包含以下内容（基于 `echobay-affiliate-backend` 规范适配）：

- **Session Start Protocol**：每次会话先读 `docs/INDEX.md`
- **Package Manager**：pnpm，不使用 npm/yarn
- **TDD 不可妥协**：Red → Green → Refactor，先写测试
- **Phase 完成门禁**：`pnpm lint && pnpm test && pnpm build` 全部通过后才推进
- **命令参考**：`pnpm dev` / `pnpm lint` / `pnpm test` / `pnpm build`
- **代码规范**：TypeScript strict，无 `any`，Zod 做 boundary validation
- **文档规范**：所有 docs 放 `docs/YYYY-MM-DD/` 目录，`docs/INDEX.md` 保持最新
- **Server Actions 规范**：业务逻辑在 Actions 层，组件只做展示
- **错误处理**：Actions 返回 `{ success, data?, error? }` 联合类型，不抛出到 UI 层

---

## 11. Phase 1 范围边界

### 包含

- Next.js 项目脚手架（ShadCN + Tailwind + Auth.js + Mongoose）
- CLAUDE.md + docs/INDEX.md 初始化
- 商家邀请流程（含邮件发送）
- 6-Tab 申请表单（含草稿自动保存）
- 商家账号创建（提交时同步）
- 商家门户（仪表盘、申请详情、文件上传、品牌信息）
- 站内通知（基础版）
- Admin 发送邀请（`/admin/invitations` 页面：输入商家邮箱 + 发送按钮，列出历史邀请记录，Phase 1 末尾交付）

### 不包含（Phase 2）

- Admin 申请审核工作台（列表、状态变更、批注）
- 商家完整管理（Brand/Store/Promotion CRUD）
- 数据统计仪表盘
- 邮件通知模板完整设计
- 多语言切换 UI（i18n 框架在 Phase 1 预埋，但不实现切换功能）

---

## 12. 与旧版 echobay-crm 的对比

| 维度 | 旧版 | 新版 |
|------|------|------|
| 前端框架 | React 18 + Vite + Redux | Next.js 15 App Router |
| 后端框架 | NestJS（独立服务） | Next.js Server Actions（全栈） |
| UI 库 | Bootstrap 5 + Reactstrap | ShadCN/ui + Tailwind CSS |
| 认证 | Passport JWT（双 token） | Auth.js v5 |
| 表单校验 | class-validator | Zod |
| 商家申请表单 | 单页 40+ 字段 | 6-Tab 智能分组 |
| 语言支持 | 英文为主 | 中英双语 |
| 商家门户 | 无 | 有（状态追踪 + 文件上传 + 通知） |
| 测试 | 无（旧版未实现） | TDD，Jest + Playwright |
