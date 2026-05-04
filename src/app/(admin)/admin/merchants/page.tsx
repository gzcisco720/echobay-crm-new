import { auth } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/connect'
import { MerchantApplicationModel } from '@/lib/db/models/merchant-application.model'
import { UserModel } from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-table'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminMerchantsPage() {
  await auth()
  await connectDB()

  const apps = await MerchantApplicationModel.find({ status: 'approved' })
    .select('userId registeredCompanyName brandNameEnglish brandNameChinese mainCategories storesInAustralia reviewedAt')
    .sort({ reviewedAt: -1 })
    .lean()
    .exec()

  const userIds = apps.map((a) => a.userId)
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('_id email name')
    .lean()
    .exec()

  const userMap = new Map(users.map((u) => [u._id.toString(), u]))

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-end">
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商户名称</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => {
                  const user = userMap.get(app.userId.toString())
                  return (
                    <TableRow key={app._id.toString()}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-zinc-900">{app.brandNameEnglish}</p>
                          {app.brandNameChinese && (
                            <p className="text-zinc-400 text-xs">{app.brandNameChinese}</p>
                          )}
                          <p className="text-zinc-500 text-xs">{app.registeredCompanyName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user?.email ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {app.mainCategories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs py-0 px-1.5">{cat}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.reviewedAt
                          ? new Date(app.reviewedAt).toLocaleDateString('zh-CN')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/merchants/${app.userId.toString()}`}
                          className="text-sm text-zinc-500 hover:text-zinc-800 underline"
                        >
                          查看
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
