'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab1Schema, type Tab1Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab1Input) => void
}

export function TabCompany({ defaultValues, onComplete }: Props) {
  const form = useForm<Tab1Input>({
    resolver: zodResolver(tab1Schema),
    defaultValues: {
      registeredCompanyName: (defaultValues.registeredCompanyName as string) ?? '',
      tradingName: (defaultValues.tradingName as string) ?? '',
      acn: (defaultValues.acn as string) ?? '',
      abn: (defaultValues.abn as string) ?? '',
      registeredAddress: (defaultValues.registeredAddress as string) ?? '',
      postalAddress: (defaultValues.postalAddress as string) ?? '',
      sameAsRegistered: (defaultValues.sameAsRegistered as boolean) ?? false,
      countryOfIncorporation: (defaultValues.countryOfIncorporation as string) ?? 'Australia',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const sameAsRegistered = form.watch('sameAsRegistered')

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">公司信息 · Company Information</h2>
        <p className="text-zinc-500 text-sm mt-0.5">请填写 ASIC 登记的注册信息</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="registeredCompanyName">
            注册公司名称 <span className="text-red-500">*</span>
          </Label>
          <Input id="registeredCompanyName" {...form.register('registeredCompanyName')} />
          {form.formState.errors.registeredCompanyName && (
            <p className="text-red-500 text-xs">{form.formState.errors.registeredCompanyName.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tradingName">交易名称 <span className="text-zinc-400 text-xs">可选</span></Label>
          <Input id="tradingName" {...form.register('tradingName')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acn">ACN <span className="text-red-500">*</span></Label>
          <Input id="acn" placeholder="000 000 000" {...form.register('acn')} />
          {form.formState.errors.acn && (
            <p className="text-red-500 text-xs">{form.formState.errors.acn.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="abn">ABN <span className="text-red-500">*</span></Label>
          <Input id="abn" placeholder="00 000 000 000" {...form.register('abn')} />
          {form.formState.errors.abn && (
            <p className="text-red-500 text-xs">{form.formState.errors.abn.message}</p>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="registeredAddress">注册地址 <span className="text-red-500">*</span></Label>
          <Input id="registeredAddress" {...form.register('registeredAddress')} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="sameAsRegistered"
            checked={sameAsRegistered}
            onCheckedChange={(v) => form.setValue('sameAsRegistered', !!v)}
          />
          <Label htmlFor="sameAsRegistered" className="cursor-pointer font-normal">
            邮寄地址与注册地址相同
          </Label>
        </div>
        {!sameAsRegistered && (
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="postalAddress">邮寄地址</Label>
            <Input id="postalAddress" {...form.register('postalAddress')} />
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2 border-t border-zinc-100">
        <Button type="submit">下一步 Next →</Button>
      </div>
    </form>
  )
}
