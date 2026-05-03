'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createHeroProduct } from '@/lib/actions/hero-product.actions'

interface BrandOption { id: string; name: string }

interface Props { brands: BrandOption[] }

export function HeroProductForm({ brands }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandId, setBrandId] = useState(brands[0]?.id ?? '')
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageWidth, setImageWidth] = useState('')
  const [imageHeight, setImageHeight] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createHeroProduct({
      brandId, name, subtitle, imageUrl,
      imageWidth: parseInt(imageWidth, 10),
      imageHeight: parseInt(imageHeight, 10),
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    router.push('/admin/hero-products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brandId">品牌</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">产品名称</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Collection" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subtitle">产品副标题</Label>
        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Fresh styles for the season" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageUrl">图片 URL</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." required />
        <p className="text-xs text-zinc-400">必须是正方形图片，尺寸 343px–800px</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageWidth">图片宽度 (px)</Label>
          <Input id="imageWidth" type="number" min={343} max={800} value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageHeight">图片高度 (px)</Label>
          <Input id="imageHeight" type="number" min={343} max={800} value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} required />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? '创建中...' : '创建特色产品'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/hero-products')}>取消</Button>
      </div>
    </form>
  )
}
