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

interface Props {
  email: string
  token: string
  allFormData: Record<string, unknown>
  onBack: () => void
}

export function TabAgreement({ email, token, allFormData, onBack }: Props) {
  const router = useRouter()
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
        <h2 className="text-base font-semibold">协议签名 · Agreement & Signature</h2>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">设置账号密码 Set Password</p>
        <p className="text-zinc-500 text-xs">您的登录邮箱：{email}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>密码 <span className="text-red-500">*</span></Label>
            <Input type="password" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>确认密码 <span className="text-red-500">*</span></Label>
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
            我已阅读并同意 EchoBay 商家合作协议条款 · I have read and agree to the EchoBay Merchant Agreement terms. <span className="text-red-500">*</span>
          </Label>
        </div>
        {form.formState.errors.agreementAccepted && <p className="text-red-500 text-xs ml-6">{form.formState.errors.agreementAccepted.message}</p>}
        <div className="flex items-start gap-2">
          <Checkbox id="setup" {...form.register('setupFeeAccepted')} />
          <Label htmlFor="setup" className="text-sm font-normal cursor-pointer">
            我确认已了解并同意缴纳平台设置费用 · I acknowledge the platform setup fee. <span className="text-red-500">*</span>
          </Label>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">申请人签名 Applicant Signature</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'applicantSignature', label: '签名（请输入全名）' },
            { key: 'applicantName', label: '姓名' },
            { key: 'applicantPosition', label: '职位' },
            { key: 'applicantDate', label: '日期', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key as keyof Tab6Input)} />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium mt-2">见证人签名 Witness Signature</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'witnessSignature', label: '见证人签名' },
            { key: 'witnessName', label: '见证人姓名' },
            { key: 'witnessDate', label: '日期', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label} <span className="text-red-500">*</span></Label>
              <Input type={type ?? 'text'} {...form.register(key as keyof Tab6Input)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onBack}>← 上一步</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : '提交申请 Submit →'}
        </Button>
      </div>
    </form>
  )
}
