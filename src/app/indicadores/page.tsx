'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import IndicadoresTable from '@/components/tables/IndicadoresTable'
import PeriodFilter from '@/components/filters/PeriodFilter'
import { Moeda, Periodo, IndicadorFinanceiro } from '@/lib/types'
import { mockIndicadores } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function formatValorCard(ind: IndicadorFinanceiro): string {
  const sigla = ind.sigla.toLowerCase()
  if (sigla.includes('%')) return `${ind.valor.toFixed(1)}%`
  return ind.valor.toFixed(2)
}

interface IndicadorCardProps {
  ind: IndicadorFinanceiro
}

function IndicadorCard({ ind }: IndicadorCardProps) {
  const variacao = ind.variacao ?? 0
  const isFavoravel = ind.positivo_quando_sobe ? variacao > 0 : variacao < 0
  const isDesfavoravel = ind.positivo_quando_sobe ? variacao < 0 : variacao > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{ind.categoria}</span>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          isFavoravel ? 'text-green-600' : isDesfavoravel ? 'text-red-600' : 'text-gray-400'
        )}>
          {isFavoravel ? <TrendingUp className="w-3.5 h-3.5" /> : isDesfavoravel ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {variacao !== 0 && <span>{variacao > 0 ? '+' : ''}{variacao.toFixed(2)}</span>}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-1">{ind.nome}</h3>
      <p className="text-3xl font-bold text-cbf-navy tabular-nums">{formatValorCard(ind)}</p>

      {ind.valor_anterior !== undefined && (
        <p className="text-xs text-gray-400 mt-1">
          Anterior: {formatValorCard({ ...ind, valor: ind.valor_anterior })}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-3 leading-relaxed border-t border-gray-100 pt-3">
        {ind.interpretacao}
      </p>
    </div>
  )
}

const CATEGORIAS = ['Todos', 'Rentabilidade', 'Liquidez', 'Endividamento', 'Caixa']

export default function IndicadoresPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [view, setView] = useState<'cards' | 'tabela'>('cards')

  const filtered = categoriaFiltro === 'Todos'
    ? mockIndicadores
    : mockIndicadores.filter(i => i.categoria === categoriaFiltro)

  return (
    <PageWrapper titulo="Indicadores Financeiros" moeda={moeda} onMoedaChange={setMoeda}>
      <div className="space-y-6">
        <PeriodFilter
          ano={ano}
          periodo={periodo}
          onAnoChange={setAno}
          onPeriodoChange={setPeriodo}
          compararAnoAnterior={compararAnoAnterior}
          onCompararChange={setCompararAnoAnterior}
        />

        {/* Category filter + view toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  categoriaFiltro === cat
                    ? 'bg-cbf-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('cards')}
              className={cn('px-3 py-1 rounded-md text-sm font-medium transition-colors', view === 'cards' ? 'bg-white shadow-sm text-cbf-navy' : 'text-gray-500')}
            >
              Cards
            </button>
            <button
              onClick={() => setView('tabela')}
              className={cn('px-3 py-1 rounded-md text-sm font-medium transition-colors', view === 'tabela' ? 'bg-white shadow-sm text-cbf-navy' : 'text-gray-500')}
            >
              Tabela
            </button>
          </div>
        </div>

        {view === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ind) => (
              <IndicadorCard key={ind.sigla} ind={ind} />
            ))}
          </div>
        ) : (
          <IndicadoresTable data={filtered} />
        )}

        <p className="text-xs text-gray-400 text-center">
          Indicadores calculados com base nos dados do exercício {ano} — Elaborado pela Controladoria CBF
        </p>
      </div>
    </PageWrapper>
  )
}
