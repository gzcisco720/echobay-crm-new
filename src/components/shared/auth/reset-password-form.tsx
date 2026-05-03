'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth.actions'
import Link from 'next/link'

interface FormValues {
  password: string
  confirmPassword: string
}

interface Props {
  token: string
}

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, getValues, formState: { isSubmitting } } = useForm<FormValues>()

  if (!token) {
    return (
      <div className="w-full bg-white border border-zinc-200 rounded-xl p-6 text-center">
        <p className="font-semibold text-red-600 mb-2">链接无效</p>
        <p className="text-sm text-zinc-500 mb-4">密码重置链接无效或已过期。</p>
        <Link href="/login/forgot-password" className="text-sm underline text-zinc-500 hover:text-zinc-800">
          重新申请重置
        </Link>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
    setError('')
    if (values.password !== values.confirmPassword) {
      setError('两次密码不一致')
      return
    }
    const result = await resetPassword(token, values.password)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.push('/login?reset=1')
  }

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-6">
      <h1 className="font-bold text-zinc-900 mb-1">设置新密码</h1>
      <p className="text-sm text-zinc-400 mb-5">请输入您的新密码（至少 8 位）。</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">新密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="至少 8 位"
            autoComplete="new-password"
            {...register('password', { required: true, minLength: 8 })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="再次输入新密码"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: true,
              validate: (v) => v === getValues('password') || '两次密码不一致',
            })}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? '保存中…' : '保存新密码'}
        </Button>
      </form>
    </div>
  )
}
