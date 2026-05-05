'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { setLocale } from '@/lib/actions/locale.actions'

export function LocaleSwitcher(): React.JSX.Element {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = locale === 'zh' ? 'en' : 'zh'
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-400 disabled:opacity-50"
      aria-label="Switch language"
    >
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  )
}
