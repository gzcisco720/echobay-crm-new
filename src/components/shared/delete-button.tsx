'use client'
import React from 'react'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteButtonProps {
  label: string
  description: string
  onConfirm: () => Promise<void>
  disabled?: boolean
}

export function DeleteButton({
  label,
  description,
  onConfirm,
  disabled,
}: DeleteButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm(): Promise<void> {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        disabled={disabled}
        className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }))}
      >
        <Trash2 size={14} className="mr-1" />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <br />
            此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            variant="destructive"
          >
            {loading ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
