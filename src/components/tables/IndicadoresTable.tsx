'use client'

import { IndicadorFinanceiro } from '@/lib/types'
import { formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface IndicadoresTableProps {
  data: IndicadorFinanceiro[]
}

function formatValor(ind: IndicadorFinanceiro): string {
  const sigla = ind.sigla.toLowerCase()
  if (sigla.includes('%')) {
    return `${ind.valor.toFixed(1)}%`
  }
  if (sigla === 'lc' || sigla.includes('cfo') || sigla.includes('/')) {
    return ind.valor.toFixed(2)
  }
  return ind.valor.toFixed(2)
}

export default function IndicadoresTable({ data }: IndicadoresTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-cbf-navy text-white text-sm">
            <th className="py-3 px-4 text-left font-semibold">Indicador</th>
            <th className="py-3 px-4 text-left font-semibold">Fórmula</th>
            <th className="py-3 px-4 text-right font-semibold">Atual</th>
            <th className="py-3 px-4 text-right font-semibold">Anterior</th>
            <th className="py-3 px-4 text-right font-semibold">Var.</th>
            <th className="py-3 px-4 text-left font-semibold">Interpretação</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ind) => {
            const variacao = ind.variacao ?? 0
            const isFavoravel = ind.positivo_quando_sobe ? variacao > 0 : variacao < 0
            const isDesfavoravel = ind.positivo_quando_sobe ? variacao < 0 : variacao > 0

            return (
              <tr key={ind.sigla} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-900">{ind.nome}</p>
                  <p className="text-xs text-gray-500">{ind.sigla} · {ind.categoria}</p>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500 max-w-xs">{ind.formula}</td>
                <td className="py-3 px-4 text-right font-bold text-cbf-navy tabular-nums">
                  {formatValor(ind)}
                </td>
                <td className="py-3 px-4 text-right text-gray-500 tabular-nums">
                  {ind.valor_anterior !== undefined ? formatValor({ ...ind, valor: ind.valor_anterior }) : '—'}
                </td>
                <td className={cn(
                  'py-3 px-4 text-right font-medium tabular-nums',
                  isFavoravel ? 'text-green-600' : isDesfavoravel ? 'text-red-600' : 'text-gray-500'
                )}>
                  {ind.variacao !== undefined ? (
                    <span>{ind.variacao > 0 ? '+' : ''}{ind.variacao.toFixed(2)}</span>
                  ) : '—'}
                </td>
                <td className="py-3 px-4 text-xs text-gray-600 max-w-xs">{ind.interpretacao}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
