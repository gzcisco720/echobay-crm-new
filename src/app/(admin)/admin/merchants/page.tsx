import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminMerchantsPage() {
  await auth()
  await connectDB()

  const apps = await MerchantApplicationModel.find({ status: 'approved' })
    .select('userId registeredCompanyName brandNameEnglish brandNameChinese mainCategories storesInAustralia reviewedAt')
    .sort({ reviewedAt: -1 })
    .lean()

  const userIds = apps.map((a) => a.userId)
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('_id email name')
    .lean()

  const userMap = new Map(users.map((u) => [u._id.toString(), u]))

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">商户管理 · Merchants</h1>
        <Badge variant="secondary">{apps.length} 家已批准</Badge>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-zinc-400 text-sm py-12">
            暂无已批准的商户。
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">已批准商户列表</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {apps.map((app) => {
              const user = userMap.get(app.userId.toString())
              return (
                <Link
                  key={app._id.toString()}
                  href={`/admin/merchants/${app.userId.toString()}`}
                  className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-900 text-sm">{app.brandNameEnglish}</p>
                      {app.brandNameChinese && (
                        <p className="text-zinc-400 text-xs">{app.brandNameChinese}</p>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5">{app.registeredCompanyName}</p>
                    {user && (
                      <p className="text-zinc-400 text-xs mt-0.5">{user.email}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {app.mainCategories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs py-0 px-1.5">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-400">{app.storesInAustralia} 家门店</p>
                    {app.reviewedAt && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        批准于 {new Date(app.reviewedAt).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
