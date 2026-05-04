'use server'

import { connectDB } from '@/lib/db/connect'
import { MerchantDocumentModel } from '@/lib/db/models/merchant-document.model'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import type { IMerchantDocument } from '@/lib/db/models/merchant-document.model'
import type { ActionResult } from '@/types/action'

export async function requestDocumentAction(
  applicationId: string,
  type: string,
  adminUserId: string
): Promise<ActionResult<IMerchantDocument>> {
  try {
    await connectDB()
    const app = await MerchantApplicationModel.findById(applicationId).lean().exec()
    if (!app) return { success: false, error: '申请不存在' }
    const doc = await MerchantDocumentModel.create({
      userId: app.userId,
      applicationId,
      type,
      requestedBy: adminUserId,
    })
    return { success: true, data: doc.toObject() as IMerchantDocument }
  } catch {
    return { success: false, error: '请求文件失败' }
  }
}

interface UploadDocumentPayload {
  applicationId: string
  userId: string
  type: string
  fileName: string
  cloudinaryPublicId: string
  url: string
  requestId?: string
}

export async function uploadDocumentAction(
  payload: UploadDocumentPayload
): Promise<ActionResult<IMerchantDocument>> {
  try {
    await connectDB()
    const { applicationId, userId, type, fileName, cloudinaryPublicId, url, requestId } = payload

    if (requestId) {
      const doc = await MerchantDocumentModel.findByIdAndUpdate(
        requestId,
        { $set: { fileName, cloudinaryPublicId, url, uploadedAt: new Date() } },
        { returnDocument: 'after' }
      ).lean().exec()
      if (!doc) return { success: false, error: '请求记录不存在' }
      return { success: true, data: doc as IMerchantDocument }
    }

    const app = await MerchantApplicationModel.findById(applicationId).lean().exec()
    if (!app) return { success: false, error: '申请不存在' }
    const doc = await MerchantDocumentModel.create({
      userId, applicationId, type, fileName, cloudinaryPublicId, url,
    })
    return { success: true, data: doc.toObject() as IMerchantDocument }
  } catch {
    return { success: false, error: '上传文件失败' }
  }
}

export async function getApplicationDocumentsAction(
  applicationId: string
): Promise<ActionResult<IMerchantDocument[]>> {
  try {
    await connectDB()
    const docs = await MerchantDocumentModel.find({ applicationId })
      .sort({ uploadedAt: -1 })
      .lean()
      .exec()
    return { success: true, data: docs as IMerchantDocument[] }
  } catch {
    return { success: false, error: '获取文件列表失败' }
  }
}

export async function cancelDocumentRequestAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await connectDB()
    const doc = await MerchantDocumentModel.findByIdAndDelete(requestId).lean().exec()
    if (!doc) return { success: false, error: '记录不存在' }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: '取消请求失败' }
  }
}
