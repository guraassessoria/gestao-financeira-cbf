import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  className?: string
  children: React.ReactNode
}

const variants = {
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

export function Alert({ variant = 'info', title, className, children }: AlertProps) {
  return (
    <div className={cn('border rounded-xl p-4 text-sm', variants[variant], className)}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  )
}
