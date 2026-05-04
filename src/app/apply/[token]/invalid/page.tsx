import Image from 'next/image'

export default function InvalidTokenPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B3F72] to-[#0BB5C4] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <Image src="/logo.png" alt="EchoBay" width={48} height={48} className="object-contain mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-3">链接无效</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          此邀请链接已过期或已被使用。
          <br />
          This invitation link is invalid or has expired.
        </p>
        <p className="text-zinc-500 text-xs mt-4">
          请联系 EchoBay 团队重新获取邀请链接。
        </p>
      </div>
    </main>
  )
}
