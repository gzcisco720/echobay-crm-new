'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createHeroProduct, updateHeroProduct } from '@/lib/actions/hero-product.actions'
import { useTranslations } from 'next-intl'

interface BrandOption { id: string; name: string }
interface InitialData {
  name?: string
  subtitle?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  brandId?: string
}
interface Props {
  brands: BrandOption[]
  productId?: string
  initialData?: InitialData
}

export function HeroProductForm({ brands, productId, initialData }: Props): React.JSX.Element {
  const router = useRouter()
  const t = useTranslations('admin.heroProducts')
  const tCommon = useTranslations('common')
  const tBrands = useTranslations('admin.brands')
  const isEdit = Boolean(productId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandId, setBrandId] = useState(initialData?.brandId ?? brands[0]?.id ?? '')
  const [name, setName] = useState(initialData?.name ?? '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [imageWidth, setImageWidth] = useState(initialData?.imageWidth?.toString() ?? '')
  const [imageHeight, setImageHeight] = useState(initialData?.imageHeight?.toString() ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const width = parseInt(imageWidth, 10)
    const height = parseInt(imageHeight, 10)
    let result
    if (isEdit && productId) {
      result = await updateHeroProduct(productId, { name, subtitle, imageUrl, imageWidth: width, imageHeight: height })
    } else {
      result = await createHeroProduct({ brandId, name, subtitle, imageUrl, imageWidth: width, imageHeight: height })
    }
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push('/admin/hero-products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      {!isEdit && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brandId">{tBrands('brandName')}</Label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t('productName')}</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Collection" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subtitle">{t('subtitle')}</Label>
        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Fresh styles for the season" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageUrl">{t('imageUrl')}</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." required />
        <p className="text-xs text-zinc-400">{t('imageHint')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageWidth">{t('imageWidth')}</Label>
          <Input id="imageWidth" type="number" min={343} max={800} value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageHeight">{t('imageHeight')}</Label>
          <Input id="imageHeight" type="number" min={343} max={800} value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} required />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? t('saving') : t('creating')) : (isEdit ? t('saveProduct') : t('createProductAction'))}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/hero-products')}>{tCommon('cancel')}</Button>
      </div>
    </form>
  )
}
