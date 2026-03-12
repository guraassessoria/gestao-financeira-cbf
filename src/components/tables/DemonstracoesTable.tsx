'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { LinhaFinanceira, Moeda } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface DemonstracoesTableProps {
  data: LinhaFinanceira[]
  moeda?: Moeda
  taxaCambio?: number
  showAnterior?: boolean
  titulo?: string
}

function converterValor(valor: number, moeda: Moeda, taxa: number): number {
  if (moeda === 'USD') return valor / taxa
  return valor
}

function LinhaRow({
  linha,
  moeda,
  taxaCambio,
  showAnterior,
  depth = 0,
}: {
  linha: LinhaFinanceira
  moeda: Moeda
  taxaCambio: number
  showAnterior: boolean
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = linha.filhos && linha.filhos.length > 0
  const isTotal = depth === 0

  const valorAtual = converterValor(linha.valor_atual, moeda, taxaCambio)
  const valorAnterior = linha.valor_anterior !== undefined
    ? converterValor(linha.valor_anterior, moeda, taxaCambio)
    : undefined
  const varAbs = linha.variacao_absoluta !== undefined
    ? converterValor(linha.variacao_absoluta, moeda, taxaCambio)
    : undefined

  const isPositive = (linha.variacao_percentual ?? 0) > 0
  const isNegativeVariation = (linha.variacao_percentual ?? 0) < 0

  return (
    <>
      <tr
        className={cn(
          'border-b border-gray-100 hover:bg-gray-50 transition-colors',
          isTotal && 'bg-gray-50 font-semibold',
          depth > 0 && 'text-sm'
        )}
      >
        <td className="py-2.5 px-4" style={{ paddingLeft: `${16 + depth * 24}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <span className="w-4 flex-shrink-0" />}
            <span className={cn(isTotal ? 'text-cbf-navy' : 'text-gray-700')}>
              {linha.codigo && <span className="text-gray-400 mr-2">{linha.codigo}</span>}
              {linha.descricao}
            </span>
          </div>
        </td>
        <td className={cn('py-2.5 px-4 text-right tabular-nums', valorAtual < 0 ? 'text-red-600' : 'text-gray-900')}>
          {formatCurrency(valorAtual, moeda)}
        </td>
        {showAnterior && (
          <>
            <td className={cn('py-2.5 px-4 text-right tabular-nums text-gray-500', valorAnterior !== undefined && valorAnterior < 0 ? 'text-red-400' : '')}>
              {valorAnterior !== undefined ? formatCurrency(valorAnterior, moeda) : '—'}
            </td>
            <td className={cn('py-2.5 px-4 text-right tabular-nums', varAbs !== undefined && varAbs > 0 ? 'text-green-600' : varAbs !== undefined && varAbs < 0 ? 'text-red-600' : 'text-gray-500')}>
              {varAbs !== undefined ? formatCurrency(varAbs, moeda) : '—'}
            </td>
            <td className={cn('py-2.5 px-4 text-right tabular-nums font-medium', isPositive ? 'text-green-600' : isNegativeVariation ? 'text-red-600' : 'text-gray-500')}>
              {formatPercent(linha.variacao_percentual)}
            </td>
            <td className={cn('py-2.5 px-4 text-center text-xs', isPositive ? 'text-green-600' : isNegativeVariation ? 'text-red-600' : 'text-gray-500')}>
              {linha.qualitativa ?? '—'}
            </td>
          </>
        )}
      </tr>
      {hasChildren && expanded && linha.filhos!.map((filho) => (
        <LinhaRow
          key={filho.codigo}
          linha={filho}
          moeda={moeda}
          taxaCambio={taxaCambio}
          showAnterior={showAnterior}
          depth={depth + 1}
        />
      ))}
    </>
  )
}

export default function DemonstracoesTable({
  data,
  moeda = 'BRL',
  taxaCambio = 5.12,
  showAnterior = true,
  titulo,
}: DemonstracoesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {titulo && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{titulo}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cbf-navy text-white text-sm">
              <th className="py-3 px-4 text-left font-semibold">Conta / Descrição</th>
              <th className="py-3 px-4 text-right font-semibold">Período Atual</th>
              {showAnterior && (
                <>
                  <th className="py-3 px-4 text-right font-semibold">Período Anterior</th>
                <th className="py-3 px-4 text-right font-semibold">Variação ({moeda === 'USD' ? 'US$' : 'R$'})</th>
                  <th className="py-3 px-4 text-right font-semibold">Variação (%)</th>
                  <th className="py-3 px-4 text-center font-semibold">Análise</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((linha) => (
              <LinhaRow
                key={linha.codigo}
                linha={linha}
                moeda={moeda}
                taxaCambio={taxaCambio}
                showAnterior={showAnterior}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
