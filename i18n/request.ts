import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value ?? 'zh'
  const locale = (['zh', 'en'] as const).includes(raw as 'zh' | 'en') ? (raw as 'zh' | 'en') : 'zh'
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
