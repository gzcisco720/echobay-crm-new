'use server'

import { connectDB } from '@/lib/db/connect'
import { PromotionModel } from '@/lib/db/models/promotion.model'
import type { IPromotion, PromotionLevel } from '@/lib/db/models/promotion.model'
import type { ActionResult } from '@/types/action'

interface CreatePromotionInput {
  userId: string
  brandId: string
  storeId?: string
  level: PromotionLevel
  promotionRule: string
  fromDate: Date | string
  toDate: Date | string
  exclusions?: string
}

export async function createPromotion(input: CreatePromotionInput): Promise<ActionResult<IPromotion>> {
  try {
    const { userId, brandId, storeId, level, promotionRule, fromDate, toDate, exclusions } = input
    if (!userId || !brandId || !level || !promotionRule || !fromDate || !toDate) {
      return { success: false, error: '请填写所有必填字段' }
    }
    await connectDB()
    const promotion = await PromotionModel.create({
      userId,
      brandId,
      storeId: storeId ?? undefined,
      level,
      promotionRule,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      exclusions: exclusions ?? undefined,
    })
    return { success: true, data: promotion.toObject() as IPromotion }
  } catch {
    return { success: false, error: '创建推广活动失败' }
  }
}

export async function updatePromotion(id: string, updates: Partial<IPromotion>): Promise<ActionResult> {
  try {
    await connectDB()
    const promotion = await PromotionModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after' }
    ).lean()
    if (!promotion) return { success: false, error: '推广活动不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新推广活动失败' }
  }
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  try {
    await connectDB()
    const promotion = await PromotionModel.findByIdAndDelete(id).lean()
    if (!promotion) return { success: false, error: '推广活动不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '删除推广活动失败' }
  }
}

export async function getPromotionsForBrand(brandId: string): Promise<ActionResult<IPromotion[]>> {
  try {
    await connectDB()
    const promotions = await PromotionModel.find({ brandId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: promotions as IPromotion[] }
  } catch {
    return { success: false, error: '获取推广活动失败' }
  }
}

export async function getPromotionsByUser(userId: string): Promise<ActionResult<IPromotion[]>> {
  try {
    await connectDB()
    const promotions = await PromotionModel.find({ userId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: promotions as IPromotion[] }
  } catch {
    return { success: false, error: '获取推广活动失败' }
  }
}

export async function getAllPromotionsForAdmin(): Promise<ActionResult<IPromotion[]>> {
  try {
    await connectDB()
    const promotions = await PromotionModel.find().sort({ createdAt: -1 }).lean()
    return { success: true, data: promotions as IPromotion[] }
  } catch {
    return { success: false, error: '获取推广活动列表失败' }
  }
}
