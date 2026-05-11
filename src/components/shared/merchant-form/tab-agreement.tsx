'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { tab6Schema, type Tab6Input } from '@/lib/validations/application.schema'
import { submitApplication } from '@/lib/actions/application.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

interface Props {
  email: string
  token: string
  allFormData: Record<string, unknown>
  onBack: () => void
}

export function TabAgreement({ email, token, allFormData, onBack }: Props) {
  const router = useRouter()
  const t = useTranslations('apply.form.agreement')
  const tForm = useTranslations('apply.form')
  const tCommon = useTranslations('common')
  const tContacts = useTranslations('apply.form.contacts')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Tab6Input>({
    resolver: zodResolver(tab6Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      agreementAccepted: false as unknown as true,
      setupFeeAccepted: false as unknown as true,
      applicantSignature: '',
      applicantName: '',
      applicantPosition: '',
      applicantDate: new Date().toISOString().split('T')[0] ?? '',
      witnessSignature: '',
      witnessName: '',
      witnessDate: '',
    },
  })

  async function onSubmit(tabData: Tab6Input) {
    setSubmitting(true)
    setError(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _confirmPassword, ...signatureData } = tabData
    const payload = { ...allFormData, ...signatureData, token } as unknown as Parameters<typeof submitApplication>[0]
    const result = await submitApplication(payload)
    if (!result.success) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    await signIn('credentials', { email, password: tabData.password, redirect: false })
    router.push('/merchant/dashboard')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{t('setPassword')}</p>
        <p className="text-zinc-500 text-xs">{t('loginEmail')}{email}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t('password')} <span className="text-red-500">*</span></Label>
            <Input type="password" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('confirmPassword')} <span className="text-red-500">*</span></Label>
            <Input type="password" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword && <p className="text-red-500 text-xs">{form.formState.errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Checkbox id="agree" {...form.register('agreementAccepted')} />
          <Label htmlFor="agree" className="text-sm font-normal cursor-pointer leading-relaxed">
            {t('agreementAccepted')} <span className="text-red-500">*</span>
          </Label>
        </div>
        {form.formState.errors.agreementAccepted && <p className="text-red-500 text-xs ml-6">{form.formState.errors.agreementAccepted.message}</p>}
        <div className="flex items-start gap-2">
          <Checkbox id="setup" {...form.register('setupFeeAccepted')} />
          <Label htmlFor="setup" className="text-sm font-normal cursor-pointer">
            {t('setupFeeAccepted')} <span className="text-red-500">*</span>
          </Label>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">{t('applicantSignature')}</p>
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'applicantSignature', label: t('signatureLabel') },
            { key: 'applicantName', label: tCommon('name') },
            { key: 'applicantPosition', label: tContacts('position') },
            { key: 'applicantDate', label: t('date'), type: 'date' },
          ] as { key: keyof Tab6Input; label: string; type?: string }[]).map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key)} />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium mt-2">{t('witnessSignature')}</p>
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'witnessSignature', label: t('witnessSignature') },
            { key: 'witnessName', label: t('witnessName') },
            { key: 'witnessDate', label: t('date'), type: 'date' },
          ] as { key: keyof Tab6Input; label: string; type?: string }[]).map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>{tForm('prev')}</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
