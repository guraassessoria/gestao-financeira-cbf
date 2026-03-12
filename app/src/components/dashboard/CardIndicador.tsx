'use client'

import type { IndicadorFinanceiro } from '@/types'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface CardIndicadorProps {
  indicador: IndicadorFinanceiro
}

const statusConfig = {
  bom: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  atencao: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  critico: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  neutro: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    icon: Minus,
    iconColor: 'text-gray-400',
  },
}

export default function CardIndicador({ indicador }: CardIndicadorProps) {
  const config = statusConfig[indicador.status]
  const StatusIcon = config.icon

  const formatarValor = (v: number | null): string => {
    if (v === null) return '-'
    if (indicador.unidade === 'x') return `${v.toFixed(2)}x`
    if (indicador.unidade === '%') return `${v.toFixed(1)}%`
    return String(v)
  }

  const variacaoPositiva = indicador.variacao !== null && indicador.variacao > 0
  const variacaoNegativa = indicador.variacao !== null && indicador.variacao < 0

  return (
    <div
      className={`rounded-xl border p-5 ${config.bg} ${config.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            {indicador.nome}
          </div>
          <div className={`text-2xl font-bold ${config.text}`}>
            {formatarValor(indicador.valor)}
          </div>
        </div>
        <StatusIcon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-1`} />
      </div>

      {indicador.valorAnterior !== null && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span>Anterior: {formatarValor(indicador.valorAnterior)}</span>
          {variacaoPositiva && <TrendingUp className="w-3 h-3 text-green-500" />}
          {variacaoNegativa && <TrendingDown className="w-3 h-3 text-red-500" />}
          {indicador.variacao !== null && (
            <span
              className={
                variacaoPositiva
                  ? 'text-green-600'
                  : variacaoNegativa
                    ? 'text-red-600'
                    : 'text-gray-400'
              }
            >
              ({variacaoPositiva ? '+' : ''}{indicador.variacao?.toFixed(1)}{indicador.unidade})
            </span>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mb-1">{indicador.descricao}</div>

      {indicador.qualitativo && (
        <div className={`text-xs italic mt-2 ${config.text}`}>
          {indicador.qualitativo}
        </div>
      )}
    </div>
  )
}
