'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab5Schema, type Tab5Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

const PAYMENT_OPTIONS = ['Visa', 'Mastercard', 'EFTPOS', 'Alipay', 'WeChat Pay', 'UnionPay', 'Apple Pay']
const PLATFORM_OPTIONS = ['EchoBay App', 'EchoBay Website', 'WeChat Mini Program', 'Red (小红书)']
const SERVICE_OPTIONS = ['社交媒体推广 Social Media', '内容营销 Content Marketing', '数据分析 Analytics']

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab5Input) => void
  onBack: () => void
}

function MultiCheckbox({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors ${value.includes(opt) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-700'}`}>
          <input
            type="checkbox"
            className="sr-only"
            checked={value.includes(opt)}
            onChange={() => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

export function TabPartnership({ defaultValues, onComplete, onBack }: Props) {
  const t = useTranslations('apply.form.partnership')
  const tForm = useTranslations('apply.form')
  const form = useForm<Tab5Input>({
    resolver: zodResolver(tab5Schema),
    defaultValues: {
      paymentMethods: (defaultValues.paymentMethods as string[]) ?? [],
      interestedInChinesePayments: (defaultValues.interestedInChinesePayments as boolean) ?? false,
      selectedPlatforms: (defaultValues.selectedPlatforms as string[]) ?? [],
      additionalServices: (defaultValues.additionalServices as string[]) ?? [],
      ongoingPromotion: (defaultValues.ongoingPromotion as boolean) ?? false,
      affiliateMarketing: (defaultValues.affiliateMarketing as boolean) ?? false,
      notifyForFuturePlatforms: (defaultValues.notifyForFuturePlatforms as boolean) ?? false,
      customerCashback: (defaultValues.customerCashback as number) ?? undefined,
      upfrontBenefits: (defaultValues.upfrontBenefits as string) ?? '',
      exclusions: (defaultValues.exclusions as string) ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('paymentMethods')} <span className="text-red-500">*</span></Label>
        <Controller name="paymentMethods" control={form.control} render={({ field }) => (
          <MultiCheckbox options={PAYMENT_OPTIONS} value={field.value} onChange={field.onChange} />
        )} />
        {form.formState.errors.paymentMethods && (
          <p className="text-red-500 text-xs">{form.formState.errors.paymentMethods.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('selectedPlatforms')}</Label>
        <Controller name="selectedPlatforms" control={form.control} render={({ field }) => (
          <MultiCheckbox options={PLATFORM_OPTIONS} value={field.value ?? []} onChange={field.onChange} />
        )} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t('customerCashback')}</Label>
          <Input type="number" min={0} step={0.1} {...form.register('customerCashback', { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t('upfrontBenefits')}</Label>
          <Input {...form.register('upfrontBenefits')} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('additionalServices')}</Label>
        <Controller name="additionalServices" control={form.control} render={({ field }) => (
          <MultiCheckbox options={SERVICE_OPTIONS} value={field.value ?? []} onChange={field.onChange} />
        )} />
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>{tForm('prev')}</Button>
        <Button type="submit">{tForm('next')}</Button>
      </div>
    </form>
  )
}
