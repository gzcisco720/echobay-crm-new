'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab4Schema, type Tab4Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab4Input) => void
  onBack: () => void
}

export function TabBanking({ defaultValues, onComplete, onBack }: Props) {
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
        <h2 className="text-base font-semibold">银行账户 · Banking Details</h2>
      </div>
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800 text-sm">
          🔒 银行账户信息将经过加密处理后安全存储。Banking details are encrypted in transit and at rest.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'bankAccountName', label: '账户名称', placeholder: 'Account Name' },
          { key: 'bankAccountNumber', label: '账户号码', placeholder: 'Account Number' },
          { key: 'bankName', label: '银行名称', placeholder: 'Bank Name' },
          { key: 'bankBsb', label: 'BSB 码', placeholder: '000-000' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label>{label} <span className="text-red-500">*</span></Label>
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
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
