'use server'

import { connectDB } from '@/lib/db/connect'
import { BrandModel } from '@/lib/db/models/brand.model'
import type { IBrand } from '@/lib/db/models/brand.model'
import type { ActionResult } from '@/types/action'

type BrandUpdateInput = Partial<Pick<IBrand,
  | 'status' | 'website' | 'socialMediaAccounts' | 'brandIntroductionEnglish'
  | 'primaryContactName' | 'primaryContactPosition' | 'primaryContactEmail' | 'primaryContactPhone'
  | 'financeContactName' | 'financeContactPosition' | 'financeContactEmail'
  | 'notifyForFuturePlatforms' | 'otherPlatforms'
>>

export async function getBrandByApplicationId(applicationId: string): Promise<ActionResult<IBrand>> {
  try {
    await connectDB()
    const brand = await BrandModel.findOne({ merchantApplicationId: applicationId }).lean()
    if (!brand) return { success: false, error: '品牌不存在' }
    return { success: true, data: brand as IBrand }
  } catch {
    return { success: false, error: '获取品牌失败' }
  }
}

export async function getBrandByUserId(userId: string): Promise<ActionResult<IBrand>> {
  try {
    await connectDB()
    const brand = await BrandModel.findOne({ userId }).lean()
    if (!brand) return { success: false, error: '品牌不存在' }
    return { success: true, data: brand as IBrand }
  } catch {
    return { success: false, error: '获取品牌失败' }
  }
}

export async function getBrandsForAdmin(): Promise<ActionResult<IBrand[]>> {
  try {
    await connectDB()
    const brands = await BrandModel.find().sort({ createdAt: -1 }).lean()
    return { success: true, data: brands as IBrand[] }
  } catch {
    return { success: false, error: '获取品牌列表失败' }
  }
}

export async function updateBrand(brandId: string, updates: BrandUpdateInput): Promise<ActionResult> {
  try {
    await connectDB()
    const brand = await BrandModel.findByIdAndUpdate(
      brandId,
      { $set: updates },
      { returnDocument: 'after' }
    ).lean()
    if (!brand) return { success: false, error: '品牌不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新品牌失败' }
  }
}
