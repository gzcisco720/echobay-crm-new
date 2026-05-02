'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab3Schema, type Tab3Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab3Input) => void
  onBack: () => void
}

export function TabBrandStore({ defaultValues, onComplete, onBack }: Props) {
  const form = useForm<Tab3Input>({
    resolver: zodResolver(tab3Schema),
    defaultValues: {
      brandNameEnglish: (defaultValues.brandNameEnglish as string) ?? '',
      brandNameChinese: (defaultValues.brandNameChinese as string) ?? '',
      brandIntroductionEnglish: (defaultValues.brandIntroductionEnglish as string) ?? '',
      website: (defaultValues.website as string) ?? '',
      mainCategories: (defaultValues.mainCategories as string[]) ?? [],
      storesInAustralia: (defaultValues.storesInAustralia as number) ?? 1,
      storesToList: (defaultValues.storesToList as number) ?? 1,
      otherCountries: (defaultValues.otherCountries as string) ?? '',
      socialMediaAccounts: (defaultValues.socialMediaAccounts as string[]) ?? [],
      logoUploads: (defaultValues.logoUploads as Record<string, string>) ?? {},
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">品牌 & 门店信息 · Brand & Store</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>品牌英文名 <span className="text-red-500">*</span></Label>
          <Input {...form.register('brandNameEnglish')} />
          {form.formState.errors.brandNameEnglish && (
            <p className="text-red-500 text-xs">{form.formState.errors.brandNameEnglish.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>品牌中文名 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input {...form.register('brandNameChinese')} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label>品牌介绍（英文）<span className="text-red-500">*</span></Label>
          <Textarea rows={3} {...form.register('brandIntroductionEnglish')} />
          {form.formState.errors.brandIntroductionEnglish && (
            <p className="text-red-500 text-xs">{form.formState.errors.brandIntroductionEnglish.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>官网 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input type="url" placeholder="https://" {...form.register('website')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>其他国家/地区门店 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input placeholder="如：中国、新加坡" {...form.register('otherCountries')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>澳洲总门店数 <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} {...form.register('storesInAustralia', { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>计划参与门店数 <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} {...form.register('storesToList', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
