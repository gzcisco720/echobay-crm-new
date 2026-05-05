import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function InvalidTokenPage() {
  const t = await getTranslations('apply')

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B3F72] to-[#0BB5C4] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <Image src="/logo.png" alt="EchoBay" width={48} height={48} className="object-contain mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-3">{t('invalidToken')}</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          {t('invalidTokenDesc')}
        </p>
        <p className="text-zinc-500 text-xs mt-4">
          {t('contactUs')}
        </p>
      </div>
    </main>
  )
}
