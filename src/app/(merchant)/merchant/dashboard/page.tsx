import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { NotificationModel } from '@/lib/db/models/notification.model'
import { StatusCard } from '@/components/shared/merchant-portal/status-card'
import { NotificationList } from '@/components/shared/merchant-portal/notification-list'
import Link from 'next/link'
import { FileText, Upload, Store, Building2, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const quickLinks = [
    { href: '/merchant/application', icon: FileText, label: '申请详情', desc: '查看或编辑您的申请' },
    { href: '/merchant/documents', icon: Upload, label: '文件上传', desc: '上传所需文件材料' },
    { href: '/merchant/brand', icon: Store, label: '品牌信息', desc: '管理您的品牌资料' },
    { href: '/merchant/store', icon: Building2, label: '我的门店', desc: '查看门店信息' },
    { href: '/merchant/promotions', icon: Tag, label: '推广活动', desc: '管理推广活动' },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      <p className="text-slate-500 text-sm">欢迎回来，{session!.user.name}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {application ? (
            <StatusCard
              status={application.status}
              companyName={application.registeredCompanyName}
              submittedAt={application.createdAt}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">暂无申请记录。</CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}>
                <Card className="hover:border-[#0BB5C4] hover:shadow-md transition-all duration-150 cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0BB5C4] flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">未读通知</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList initialNotifications={notifications} userId={userId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
