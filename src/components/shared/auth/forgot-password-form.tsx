'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/lib/actions/auth.actions'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FormValues {
  email: string
}

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setError('')
    const result = await requestPasswordReset(values.email)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full bg-white border border-zinc-200 rounded-xl p-6 text-center">
        <p className="font-semibold text-zinc-900 mb-2">{t('emailSent')}</p>
        <p className="text-sm text-zinc-500 mb-4">{t('emailSentDesc')}</p>
        <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-800 underline">
          {t('backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-6">
      <h1 className="font-bold text-zinc-900 mb-1">{t('title')}</h1>
      <p className="text-sm text-zinc-400 mb-5">{t('description')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            {...register('email', { required: true })}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('sending') : t('sendButton')}
        </Button>

        <p className="text-center text-sm text-zinc-400">
          <Link href="/login" className="hover:text-zinc-700 underline">{t('backToLogin')}</Link>
        </p>
      </form>
    </div>
  )
}
