'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'

export function ApplicationsSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const t = useTranslations('admin.applications')
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set('q', e.target.value)
      } else {
        params.delete('q')
      }
      params.delete('status') // reset status filter on new search
      router.push(`/admin/applications?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <Input
      type="search"
      placeholder={t('searchPlaceholder')}
      defaultValue={initialQuery}
      onChange={handleChange}
      className="max-w-sm"
    />
  )
}
