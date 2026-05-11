'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tab2Schema, type Tab2Input } from '@/lib/validations/application.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Tab2Input) => void
  onBack: () => void
}

export function TabContacts({ defaultValues, onComplete, onBack }: Props) {
  const t = useTranslations('apply.form.contacts')
  const tForm = useTranslations('apply.form')
  const tCommon = useTranslations('common')
  const form = useForm<Tab2Input>({
    resolver: zodResolver(tab2Schema),
    defaultValues: {
      primaryContact: (defaultValues.primaryContact as Tab2Input['primaryContact']) ?? { name: '', email: '', phone: '' },
      isAuthorizedSignatory: (defaultValues.isAuthorizedSignatory as boolean) ?? true,
      financeContact: (defaultValues.financeContact as Tab2Input['financeContact']) ?? { name: '', position: '', email: '', phone: '' },
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const isAuth = form.watch('isAuthorizedSignatory')

  return (
    <form onSubmit={form.handleSubmit(onComplete)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
        <p className="text-zinc-500 text-sm mt-0.5">{t('description')}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{t('primaryContact')}</p>
        <div className="grid grid-cols-2 gap-4">
          {(['name', 'position', 'email', 'phone'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <Label htmlFor={`pc-${field}`}>
                {field === 'name' ? tCommon('name') : field === 'position' ? t('position') : field === 'email' ? tCommon('email') : tCommon('phone')}
                {field !== 'position' && <span className="text-red-500"> *</span>}
              </Label>
              <Input id={`pc-${field}`} type={field === 'email' ? 'email' : 'text'} {...form.register(`primaryContact.${field}`)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <Checkbox id="isAuth" checked={isAuth} onCheckedChange={(v) => form.setValue('isAuthorizedSignatory', !!v)} />
        <Label htmlFor="isAuth" className="cursor-pointer font-normal">{t('isAuthorizedSignatory')}</Label>
      </div>

      {!isAuth && (
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{t('authorizedDirector')}</p>
          <div className="grid grid-cols-2 gap-4">
            {(['name', 'position', 'email', 'phone'] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <Label>{field === 'name' ? tCommon('name') : field === 'position' ? t('position') : field === 'email' ? tCommon('email') : tCommon('phone')}</Label>
                <Input type={field === 'email' ? 'email' : 'text'} {...form.register(`authorizedDirector.${field}`)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">{t('financeContact')}</p>
        <div className="grid grid-cols-2 gap-4">
          {(['name', 'position', 'email', 'phone'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <Label>
                {field === 'name' ? tCommon('name') : field === 'position' ? t('position') : field === 'email' ? tCommon('email') : tCommon('phone')}
                <span className="text-red-500"> *</span>
              </Label>
              <Input type={field === 'email' ? 'email' : 'text'} {...form.register(`financeContact.${field}`)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>{tForm('prev')}</Button>
        <Button type="submit">{tForm('next')}</Button>
      </div>
    </form>
  )
}
