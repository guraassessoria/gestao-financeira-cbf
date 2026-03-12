import { cn } from '@/lib/utils'
import { LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  )
}
