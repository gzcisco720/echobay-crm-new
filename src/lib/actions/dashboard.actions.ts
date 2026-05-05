'use server'

import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { MerchantInvitationModel } from '@/lib/db/models/merchant-invitation.model'
import type { ActionResult } from '@/types/action'
import type { ApplicationStatus } from '@/lib/db/models/merchant-application.model'

interface DashboardStats {
  total: number
  submitted: number
  under_review: number
  approved: number
  rejected: number
  requires_info: number
  recent: Array<{
    id: string
    registeredCompanyName: string
    status: ApplicationStatus
    createdAt: Date
  }>
}

export async function getAdminDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    await connectDB()
    const apps = await MerchantApplicationModel.find()
      .select('status registeredCompanyName createdAt')
      .sort({ createdAt: -1 })
      .lean()

    const counts = {
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      requires_info: 0,
    }

    for (const app of apps) {
      const s = app.status as ApplicationStatus
      if (s in counts) counts[s as keyof typeof counts]++
    }

    return {
      success: true,
      data: {
        total: apps.length,
        ...counts,
        recent: apps.slice(0, 5).map((a) => ({
          id: a._id.toString(),
          registeredCompanyName: a.registeredCompanyName,
          status: a.status,
          createdAt: a.createdAt,
        })),
      },
    }
  } catch {
    return { success: false, error: '获取统计数据失败' }
  }
}

interface MerchantSummary {
  id: string
  registeredCompanyName: string
  brandNameEnglish: string
  status: ApplicationStatus
  createdAt: Date
  reviewedAt?: Date
}

export async function getMerchantsForAdmin(): Promise<ActionResult<MerchantSummary[]>> {
  try {
    await connectDB()
    const apps = await MerchantApplicationModel.find({ status: 'approved' })
      .select('registeredCompanyName brandNameEnglish status createdAt reviewedAt')
      .sort({ reviewedAt: -1 })
      .lean()

    return {
      success: true,
      data: apps.map((a) => ({
        id: a._id.toString(),
        registeredCompanyName: a.registeredCompanyName,
        brandNameEnglish: a.brandNameEnglish,
        status: a.status,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
      })),
    }
  } catch {
    return { success: false, error: '获取商户列表失败' }
  }
}

interface TrendEntry {
  week: string
  count: number
}

export async function getApplicationTrend(
  weeks: number
): Promise<ActionResult<TrendEntry[]>> {
  try {
    await connectDB()
    const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)
    const raw = await MerchantApplicationModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]).exec()

    const data: TrendEntry[] = raw.map((r) => ({
      week: `W${String(r._id.week as number).padStart(2, '0')}`,
      count: r.count as number,
    }))

    return { success: true, data }
  } catch {
    return { success: false, error: '获取申请趋势失败' }
  }
}

interface FunnelData {
  sent: number
  applied: number
  approved: number
}

export async function getInvitationFunnel(): Promise<ActionResult<FunnelData>> {
  try {
    await connectDB()
    const [sent, applied, approved] = await Promise.all([
      MerchantInvitationModel.countDocuments().exec(),
      MerchantApplicationModel.countDocuments({ status: { $ne: 'draft' } }).exec(),
      MerchantApplicationModel.countDocuments({ status: 'approved' }).exec(),
    ])
    return { success: true, data: { sent, applied, approved } }
  } catch {
    return { success: false, error: '获取转化漏斗数据失败' }
  }
}
