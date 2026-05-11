'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab4Schema, type Tab4Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab4Input) => void
  onBack: () => void
}

export function TabBanking({ defaultValues, onComplete, onBack }: Props) {
  const t = useTranslations('apply.form.banking')
  const tForm = useTranslations('apply.form')
  const form = useForm<Tab4Input>({
    resolver: zodResolver(tab4Schema),
    defaultValues: {
      bankAccountName: (defaultValues.bankAccountName as string) ?? '',
      bankAccountNumber: (defaultValues.bankAccountNumber as string) ?? '',
      bankName: (defaultValues.bankName as string) ?? '',
      bankBsb: (defaultValues.bankBsb as string) ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
      </div>
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800 text-sm">
          {t('securityNote')}
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-4">
        {([
          { key: 'bankAccountName', labelKey: 'bankAccountName', placeholder: 'Account Name' },
          { key: 'bankAccountNumber', labelKey: 'bankAccountNumber', placeholder: 'Account Number' },
          { key: 'bankName', labelKey: 'bankName', placeholder: 'Bank Name' },
          { key: 'bankBsb', labelKey: 'bankBsb', placeholder: '000-000' },
        ] as const).map(({ key, labelKey, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label>{t(labelKey)} <span className="text-red-500">*</span></Label>
            <Input
              placeholder={placeholder}
              type={key === 'bankAccountNumber' ? 'password' : 'text'}
              {...form.register(key as keyof Tab4Input)}
            />
            {form.formState.errors[key as keyof Tab4Input] && (
              <p className="text-red-500 text-xs">
                {form.formState.errors[key as keyof Tab4Input]?.message}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>{tForm('prev')}</Button>
        <Button type="submit">{tForm('next')}</Button>
      </div>
    </form>
  )
}
