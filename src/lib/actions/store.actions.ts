'use server'

import { connectDB } from '@/lib/db/connect'
import { StoreModel } from '@/lib/db/models/store.model'
import type { IStore } from '@/lib/db/models/store.model'
import type { ActionResult } from '@/types/action'

interface CreateStoreInput {
  brandId: string
  userId: string
  nameEnglishBranch: string
  addressEnglish: string
  introduction: string
  highlights: string[]
  businessHours: string
  storeType: string
  businessCategory: string
  phone: string
  photos?: string[]
}

type UpdateStoreInput = Partial<Omit<CreateStoreInput, 'brandId' | 'userId'>>

export async function createStore(input: CreateStoreInput): Promise<ActionResult<IStore>> {
  try {
    const { brandId, userId, nameEnglishBranch, addressEnglish, introduction, highlights, businessHours, storeType, businessCategory, phone, photos } = input
    if (!nameEnglishBranch || !addressEnglish || !introduction || !businessHours || !storeType || !businessCategory || !phone) {
      return { success: false, error: '请填写所有必填字段' }
    }
    await connectDB()
    const store = await StoreModel.create({
      brandId, userId, nameEnglishBranch, addressEnglish, introduction,
      highlights, businessHours, storeType, businessCategory, phone,
      photos: photos ?? [],
    })
    return { success: true, data: store.toObject() as IStore }
  } catch {
    return { success: false, error: '创建门店失败' }
  }
}

export async function updateStore(storeId: string, updates: UpdateStoreInput): Promise<ActionResult> {
  try {
    await connectDB()
    const store = await StoreModel.findByIdAndUpdate(storeId, { $set: updates }, { returnDocument: 'after' }).lean()
    if (!store) return { success: false, error: '门店不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新门店失败' }
  }
}

export async function deleteStore(storeId: string): Promise<ActionResult> {
  try {
    await connectDB()
    const store = await StoreModel.findByIdAndDelete(storeId).lean()
    if (!store) return { success: false, error: '门店不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '删除门店失败' }
  }
}

export async function getStoresForAdmin(): Promise<ActionResult<IStore[]>> {
  try {
    await connectDB()
    const stores = await StoreModel.find().sort({ createdAt: -1 }).lean()
    return { success: true, data: stores as IStore[] }
  } catch {
    return { success: false, error: '获取门店列表失败' }
  }
}

export async function getStoresByBrand(brandId: string): Promise<ActionResult<IStore[]>> {
  try {
    await connectDB()
    const stores = await StoreModel.find({ brandId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: stores as IStore[] }
  } catch {
    return { success: false, error: '获取门店列表失败' }
  }
}

export async function getStoreByUserId(userId: string): Promise<ActionResult<IStore>> {
  try {
    await connectDB()
    const store = await StoreModel.findOne({ userId }).lean()
    if (!store) return { success: false, error: '未找到您的门店' }
    return { success: true, data: store as IStore }
  } catch {
    return { success: false, error: '获取门店信息失败' }
  }
}
