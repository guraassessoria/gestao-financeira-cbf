import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface VariacaoBadgeProps {
  valor: number
  suffix?: string
  className?: string
}

export function VariacaoBadge({ valor, suffix = '%', className }: VariacaoBadgeProps) {
  const isPositive = valor > 0
  const isNegative = valor < 0
  const isNeutral = valor === 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
        isPositive && 'bg-green-50 text-green-700',
        isNegative && 'bg-red-50 text-red-600',
        isNeutral && 'bg-slate-100 text-slate-500',
        className
      )}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {isNeutral && <Minus className="w-3 h-3" />}
      {isPositive ? '+' : ''}{valor.toFixed(1)}{suffix}
    </span>
  )
}
