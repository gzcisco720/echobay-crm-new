import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvalidTokenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">链接无效</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 text-sm leading-relaxed">
            此邀请链接已过期或已被使用。
            <br />
            This invitation link is invalid or has expired.
          </p>
          <p className="text-zinc-500 text-xs mt-4">
            请联系 EchoBay 团队重新获取邀请链接。
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
