import { cn, calcVariation } from '@/lib/utils'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface KpiCardProps {
  titulo: string
  valor: number
  valorAnterior: number
  icon: LucideIcon
  prefixo?: string
}

export function KpiCard({ titulo, valor, valorAnterior, icon: Icon, prefixo = 'R$ mil' }: KpiCardProps) {
  const { absolute, percent } = calcVariation(valor, valorAnterior)
  const isPositive = absolute >= 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-500">{titulo}</p>
        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <p className="text-2xl font-bold text-slate-900 tabular-nums">
          {new Intl.NumberFormat('pt-BR').format(valor)}
        </p>
        <p className="text-xs text-slate-400 mb-1">{prefixo}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            isPositive ? 'text-green-600' : 'text-red-500'
          )}
        >
          {isPositive ? '+' : ''}{percent.toFixed(1)}% vs. ano anterior
        </span>
      </div>
    </div>
  )
}
