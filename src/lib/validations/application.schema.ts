import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  position: z.string().optional(),
  email: z.string().email('请输入有效邮箱').optional().or(z.literal('')),
  phone: z.string().min(1, '电话不能为空'),
})

const financeContactSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  position: z.string().min(1, '职位不能为空'),
  email: z.string().email('请输入有效邮箱'),
  phone: z.string().min(1, '电话不能为空'),
})

export const tab1Schema = z.object({
  registeredCompanyName: z.string().min(1, '公司名称不能为空'),
  tradingName: z.string().optional(),
  acn: z.string().min(1, 'ACN 不能为空'),
  abn: z.string().min(1, 'ABN 不能为空'),
  registeredAddress: z.string().min(1, '注册地址不能为空'),
  postalAddress: z.string().optional(),
  sameAsRegistered: z.boolean().optional(),
  countryOfIncorporation: z.string().default('Australia'),
})

export const tab2Schema = z.object({
  primaryContact: contactSchema.extend({ phone: z.string().min(1) }),
  isAuthorizedSignatory: z.boolean().default(true),
  authorizedDirector: contactSchema.optional(),
  financeContact: financeContactSchema,
})

export const tab3Schema = z.object({
  brandNameEnglish: z.string().min(1, '品牌英文名不能为空'),
  brandNameChinese: z.string().optional(),
  brandIntroductionEnglish: z.string().min(10, '品牌介绍至少 10 个字符'),
  website: z.string().url().optional().or(z.literal('')),
  socialMediaAccounts: z.array(z.string()).default([]),
  logoUploads: z.record(z.string(), z.string()).default({}),
  mainCategories: z.array(z.string()).min(1, '请至少选择一个类目'),
  storesInAustralia: z.coerce.number().int().min(1),
  storesToList: z.coerce.number().int().min(1),
  otherCountries: z.string().optional(),
})

export const tab4Schema = z.object({
  bankAccountName: z.string().min(1, '账户名称不能为空'),
  bankAccountNumber: z.string().min(1, '账户号码不能为空'),
  bankName: z.string().min(1, '银行名称不能为空'),
  bankBsb: z.string().min(1, 'BSB 码不能为空'),
})

export const tab5Schema = z.object({
  paymentMethods: z.array(z.string()).min(1, '请至少选择一种支付方式'),
  interestedInChinesePayments: z.boolean().default(false),
  paymentPromotions: z.string().optional(),
  selectedPlatforms: z.array(z.string()).default([]),
  otherPlatforms: z.string().optional(),
  notifyForFuturePlatforms: z.boolean().default(false),
  upfrontBenefits: z.string().optional(),
  customerCashback: z.coerce.number().min(0).optional(),
  promotionStartDate: z.string().optional(),
  promotionEndDate: z.string().optional(),
  ongoingPromotion: z.boolean().default(false),
  affiliateMarketing: z.boolean().default(false),
  exclusions: z.string().optional(),
  additionalServices: z.array(z.string()).default([]),
})

const tab6BaseSchema = z.object({
  password: z.string().min(8, '密码至少 8 位'),
  confirmPassword: z.string().min(1, '请确认密码'),
  agreementAccepted: z.literal(true, { message: '请阅读并同意协议' }),
  setupFeeAccepted: z.literal(true, { message: '请确认设置费用' }),
  applicantSignature: z.string().min(1, '请输入签名'),
  applicantName: z.string().min(1, '请输入姓名'),
  applicantPosition: z.string().min(1, '请输入职位'),
  applicantDate: z.string().min(1, '请选择日期'),
  witnessSignature: z.string().min(1, '请输入见证人签名'),
  witnessName: z.string().min(1, '请输入见证人姓名'),
  witnessDate: z.string().min(1, '请选择见证日期'),
})

export const tab6Schema = tab6BaseSchema.refine(
  (d) => d.password === d.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  },
)

export const fullApplicationSchema = tab1Schema
  .merge(tab2Schema)
  .merge(tab3Schema)
  .merge(tab4Schema)
  .merge(tab5Schema)
  .merge(tab6BaseSchema.omit({ confirmPassword: true }))

export type Tab1Input = z.infer<typeof tab1Schema>
export type Tab2Input = z.infer<typeof tab2Schema>
export type Tab3Input = z.infer<typeof tab3Schema>
export type Tab4Input = z.infer<typeof tab4Schema>
export type Tab5Input = z.infer<typeof tab5Schema>
export type Tab6Input = z.infer<typeof tab6Schema>
export type FullApplicationInput = z.infer<typeof fullApplicationSchema>
