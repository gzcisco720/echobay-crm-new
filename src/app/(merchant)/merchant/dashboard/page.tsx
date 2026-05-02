import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { StatusCard } from '@/components/shared/merchant-portal/status-card'
import { NotificationList } from '@/components/shared/merchant-portal/notification-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  await connectDB()

  const application = await MerchantApplicationModel.findOne({ userId })
    .select('status registeredCompanyName createdAt')
    .lean()
    .exec()

  const rawNotifications = await NotificationModel.find({ userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .exec()

  const notifications = rawNotifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
  }))

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">仪表盘 Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">欢迎回来，{session!.user.name}</p>
      </div>

      {application ? (
        <StatusCard
          status={application.status}
          companyName={application.registeredCompanyName}
          submittedAt={application.createdAt}
        />
      ) : (
        <div className="p-4 bg-zinc-100 rounded-lg text-sm text-zinc-600">
          暂无申请记录。
        </div>
      )}

      <NotificationList initialNotifications={notifications} userId={userId} />

      <div className="flex gap-3">
        <Link href="/merchant/application">
          <Button variant="outline" size="sm">查看申请详情</Button>
        </Link>
        <Link href="/merchant/documents">
          <Button variant="outline" size="sm">文件上传</Button>
        </Link>
      </div>
    </div>
  )
}
