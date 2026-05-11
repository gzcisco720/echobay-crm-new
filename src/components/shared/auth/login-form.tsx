'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations('auth.login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError(t('invalidCredentials'))
      return
    }
    const session = await getSession()
    const params = new URLSearchParams(window.location.search)
    const callbackUrl = params.get('callbackUrl')

    const role = session?.user?.role
    const defaultDest = (role === 'admin' || role === 'super_admin')
      ? '/admin/dashboard'
      : '/merchant/dashboard'

    router.push(callbackUrl ?? defaultDest)
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('loginButton')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? t('loggingIn') : t('loginButton')}
          </Button>
          <p className="text-center text-xs text-zinc-400">
            <Link href="/login/forgot-password" className="hover:text-zinc-700 underline">
              {t('forgotPassword')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
