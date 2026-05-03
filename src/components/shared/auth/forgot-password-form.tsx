'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/lib/actions/auth.actions'
import Link from 'next/link'

interface FormValues {
  email: string
}

export function ForgotPasswordForm() {
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
        <p className="font-semibold text-zinc-900 mb-2">邮件已发送</p>
        <p className="text-sm text-zinc-500 mb-4">
          如果该邮箱存在账户，您将收到密码重置邮件。请检查收件箱（包括垃圾邮件文件夹）。
        </p>
        <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-800 underline">
          返回登录
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-6">
      <h1 className="font-bold text-zinc-900 mb-1">忘记密码</h1>
      <p className="text-sm text-zinc-400 mb-5">输入您的邮箱，我们将发送重置链接。</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', { required: true })}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? '发送中…' : '发送重置链接'}
        </Button>

        <p className="text-center text-sm text-zinc-400">
          <Link href="/login" className="hover:text-zinc-700 underline">返回登录</Link>
        </p>
      </form>
    </div>
  )
}
