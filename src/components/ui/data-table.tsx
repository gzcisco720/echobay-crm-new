import React from 'react'
import { cn } from '@/lib/utils'

export function Table({ className, children }: { className?: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return <tr className={cn('hover:bg-slate-50 transition-colors', className)}>{children}</tr>
}

export function TableHead({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}): React.JSX.Element {
  return (
    <td className={cn('px-4 py-3 text-slate-700', className)} colSpan={colSpan}>
      {children}
    </td>
  )
}
