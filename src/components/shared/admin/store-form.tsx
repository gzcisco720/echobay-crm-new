'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createStore } from '@/lib/actions/store.actions'
import { updateStore } from '@/lib/actions/store.actions'
import type { IStore } from '@/lib/db/models/store.model'

interface BrandOption {
  id: string
  name: string
}

interface StoreFormProps {
  brands: BrandOption[]
  storeId?: string
  initialData?: Partial<IStore>
  userId?: string
}

export function StoreForm({ brands, storeId, initialData, userId }: StoreFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brandId, setBrandId] = useState(
    initialData?.brandId?.toString() ?? (brands[0]?.id ?? '')
  )
  const [nameEnglishBranch, setNameEnglishBranch] = useState(initialData?.nameEnglishBranch ?? '')
  const [addressEnglish, setAddressEnglish] = useState(initialData?.addressEnglish ?? '')
  const [introduction, setIntroduction] = useState(initialData?.introduction ?? '')
  const [highlight0, setHighlight0] = useState(initialData?.highlights?.[0] ?? '')
  const [highlight1, setHighlight1] = useState(initialData?.highlights?.[1] ?? '')
  const [highlight2, setHighlight2] = useState(initialData?.highlights?.[2] ?? '')
  const [businessHours, setBusinessHours] = useState(initialData?.businessHours ?? '')
  const [storeType, setStoreType] = useState(initialData?.storeType ?? '')
  const [businessCategory, setBusinessCategory] = useState(initialData?.businessCategory ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const highlights = [highlight0, highlight1, highlight2].filter((h) => h.trim() !== '')

    if (storeId) {
      const result = await updateStore(storeId, {
        nameEnglishBranch,
        addressEnglish,
        introduction,
        highlights,
        businessHours,
        storeType,
        businessCategory,
        phone,
      })
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }
    } else {
      const result = await createStore({
        brandId,
        userId: userId ?? '',
        nameEnglishBranch,
        addressEnglish,
        introduction,
        highlights,
        businessHours,
        storeType,
        businessCategory,
        phone,
      })
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }
    }

    router.push('/admin/stores')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 font-medium">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brandId">品牌</Label>
            <select
              id="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              disabled={!!storeId}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nameEnglishBranch">门店英文名称</Label>
            <Input
              id="nameEnglishBranch"
              value={nameEnglishBranch}
              onChange={(e) => setNameEnglishBranch(e.target.value)}
              placeholder="e.g. Sydney CBD Branch"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressEnglish">地址（英文）</Label>
            <Input
              id="addressEnglish"
              value={addressEnglish}
              onChange={(e) => setAddressEnglish(e.target.value)}
              placeholder="e.g. 123 George St, Sydney NSW 2000"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">电话</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +61 2 9999 9999"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeType">门店类型</Label>
              <Input
                id="storeType"
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
                placeholder="e.g. Flagship, Outlet"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessCategory">业务类别</Label>
              <Input
                id="businessCategory"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="e.g. Food & Beverage"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessHours">营业时间</Label>
            <Input
              id="businessHours"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="e.g. Mon-Fri 9am-9pm, Sat-Sun 10am-8pm"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 font-medium">门店介绍</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="introduction">简介</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="描述这家门店的特色..."
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>亮点（最多3条）</Label>
            <Input
              value={highlight0}
              onChange={(e) => setHighlight0(e.target.value)}
              placeholder="亮点 1"
            />
            <Input
              value={highlight1}
              onChange={(e) => setHighlight1(e.target.value)}
              placeholder="亮点 2"
            />
            <Input
              value={highlight2}
              onChange={(e) => setHighlight2(e.target.value)}
              placeholder="亮点 3"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : storeId ? '保存更改' : '创建门店'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/stores')}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
