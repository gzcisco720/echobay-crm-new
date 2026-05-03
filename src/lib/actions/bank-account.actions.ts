'use server'

import { connectDB } from '@/lib/db/connect'
import { BankAccountModel } from '@/lib/db/models/bank-account.model'
import type { IBankAccount, BankAccountStatus } from '@/lib/db/models/bank-account.model'
import { encrypt } from '@/lib/crypto/encrypt'
import type { ActionResult } from '@/types/action'

interface CreateBankAccountInput {
  brandId: string
  merchantApplicationId?: string
  accountNumber: string
  accountName: string
  bankName: string
  bsb: string
  isPrimary?: boolean
}

interface UpdateBankAccountInput {
  accountName?: string
  bankName?: string
  bsb?: string
  status?: BankAccountStatus
  isPrimary?: boolean
  notes?: string
}

export async function createBankAccount(
  input: CreateBankAccountInput
): Promise<ActionResult<IBankAccount>> {
  try {
    const {
      brandId,
      merchantApplicationId,
      accountNumber,
      accountName,
      bankName,
      bsb,
      isPrimary,
    } = input

    if (!brandId || !accountNumber || !accountName || !bankName || !bsb) {
      return { success: false, error: '请填写所有必填字段' }
    }

    const encryptedAccountNumber = encrypt(accountNumber)

    await connectDB()
    const bankAccount = await BankAccountModel.create({
      brandId,
      merchantApplicationId: merchantApplicationId ?? undefined,
      accountNumber: encryptedAccountNumber,
      accountName,
      bankName,
      bsb,
      isPrimary: isPrimary ?? false,
    })
    return { success: true, data: bankAccount.toObject() as IBankAccount }
  } catch {
    return { success: false, error: '创建银行账户失败' }
  }
}

export async function updateBankAccount(
  id: string,
  updates: UpdateBankAccountInput
): Promise<ActionResult> {
  try {
    await connectDB()
    const bankAccount = await BankAccountModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after' }
    ).lean()
    if (!bankAccount) return { success: false, error: '银行账户不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新银行账户失败' }
  }
}

export async function getBankAccountsByBrand(
  brandId: string
): Promise<ActionResult<IBankAccount[]>> {
  try {
    await connectDB()
    const accounts = await BankAccountModel.find({ brandId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: accounts as IBankAccount[] }
  } catch {
    return { success: false, error: '获取银行账户失败' }
  }
}

export async function getBankAccountById(id: string): Promise<ActionResult<IBankAccount>> {
  try {
    await connectDB()
    const account = await BankAccountModel.findById(id).lean()
    if (!account) return { success: false, error: '银行账户不存在' }
    return { success: true, data: account as IBankAccount }
  } catch {
    return { success: false, error: '获取银行账户失败' }
  }
}
