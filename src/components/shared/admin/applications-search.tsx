'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'

export function ApplicationsSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
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
      placeholder="搜索公司名 Search company name..."
      defaultValue={initialQuery}
      onChange={handleChange}
      className="max-w-sm"
    />
  )
}
