'use server'

import { connectDB } from '@/lib/db/connect'
import { HeroProductModel } from '@/lib/db/models/hero-product.model'
import type { IHeroProduct } from '@/lib/db/models/hero-product.model'
import type { ActionResult } from '@/types/action'

interface CreateHeroProductInput {
  brandId: string
  name: string
  subtitle: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
}

export async function createHeroProduct(input: CreateHeroProductInput): Promise<ActionResult<IHeroProduct>> {
  try {
    const { brandId, name, subtitle, imageUrl, imageWidth, imageHeight } = input
    if (!brandId || !name || !subtitle || !imageUrl) {
      return { success: false, error: '请填写所有必填字段' }
    }
    if (imageWidth !== imageHeight) {
      return { success: false, error: '图片宽度必须等于高度（正方形图片）' }
    }
    if (imageWidth < 343 || imageWidth > 800) {
      return { success: false, error: '图片尺寸必须在 343px 至 800px 之间' }
    }
    await connectDB()
    const product = await HeroProductModel.create({
      brandId,
      name,
      subtitle,
      imageUrl,
      imageWidth,
      imageHeight,
    })
    return { success: true, data: product.toObject() as IHeroProduct }
  } catch {
    return { success: false, error: '创建特色产品失败' }
  }
}

export async function updateHeroProduct(
  id: string,
  updates: Partial<IHeroProduct>
): Promise<ActionResult> {
  try {
    await connectDB()
    const product = await HeroProductModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after' }
    ).lean()
    if (!product) return { success: false, error: '特色产品不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '更新特色产品失败' }
  }
}

export async function deleteHeroProduct(id: string): Promise<ActionResult> {
  try {
    await connectDB()
    const product = await HeroProductModel.findByIdAndDelete(id).lean()
    if (!product) return { success: false, error: '特色产品不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '删除特色产品失败' }
  }
}

export async function getHeroProductsByBrand(brandId: string): Promise<ActionResult<IHeroProduct[]>> {
  try {
    await connectDB()
    const products = await HeroProductModel.find({ brandId }).sort({ createdAt: -1 }).lean()
    return { success: true, data: products as IHeroProduct[] }
  } catch {
    return { success: false, error: '获取特色产品失败' }
  }
}

export async function getAllHeroProductsForAdmin(): Promise<ActionResult<IHeroProduct[]>> {
  try {
    await connectDB()
    const products = await HeroProductModel.find().sort({ createdAt: -1 }).lean()
    return { success: true, data: products as IHeroProduct[] }
  } catch {
    return { success: false, error: '获取特色产品列表失败' }
  }
}
