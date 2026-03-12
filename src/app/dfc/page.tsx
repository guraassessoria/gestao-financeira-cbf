'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import DemonstracoesTable from '@/components/tables/DemonstracoesTable'
import PeriodFilter from '@/components/filters/PeriodFilter'
import BarChart from '@/components/charts/BarChart'
import { Moeda, Periodo, LinhaFinanceira } from '@/lib/types'
import { mockDFCData } from '@/lib/mock-data'
import { calcularVariacao, calcularVariacaoAbsoluta, getQualitativa } from '@/lib/utils'

function enrichLinhas(linhas: LinhaFinanceira[]): LinhaFinanceira[] {
  return linhas.map((l) => {
    const var_abs = l.valor_anterior !== undefined ? calcularVariacaoAbsoluta(l.valor_atual, l.valor_anterior) : undefined
    const var_pct = l.valor_anterior !== undefined ? calcularVariacao(l.valor_atual, l.valor_anterior) : undefined
    return {
      ...l,
      variacao_absoluta: var_abs,
      variacao_percentual: var_pct ?? undefined,
      qualitativa: var_pct != null ? getQualitativa(var_pct) : '—',
      filhos: l.filhos ? enrichLinhas(l.filhos) : undefined,
    }
  })
}

const waterfallData = [
  { label: 'Caixa Inicial', valor: 144_500_000 },
  { label: 'FCO', valor: 97_500_000 },
  { label: 'FCI', valor: -45_000_000 },
  { label: 'FCF', valor: -12_000_000 },
  { label: 'Caixa Final', valor: 185_000_000 },
]

export default function DFCPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)

  const data = enrichLinhas(mockDFCData)

  const chartData = waterfallData.map(d => ({
    label: d.label,
    positivo: Math.max(d.valor, 0),
    negativo: Math.min(d.valor, 0),
  }))

  return (
    <PageWrapper titulo="DFC — Demonstração do Fluxo de Caixa" moeda={moeda} onMoedaChange={setMoeda}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PeriodFilter
            ano={ano}
            periodo={periodo}
            onAnoChange={setAno}
            onPeriodoChange={setPeriodo}
            compararAnoAnterior={compararAnoAnterior}
            onCompararChange={setCompararAnoAnterior}
          />
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Waterfall chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Movimento de Caixa — {ano}</h2>
          <BarChart
            data={chartData}
            bars={[
              { key: 'positivo', label: 'Entradas', color: '#009c3b' },
              { key: 'negativo', label: 'Saídas', color: '#ef4444' },
            ]}
            xKey="label"
            moeda={moeda}
            height={280}
          />
        </div>

        <DemonstracoesTable
          data={data}
          moeda={moeda}
          showAnterior={compararAnoAnterior}
          titulo="Demonstração do Fluxo de Caixa — Método Indireto"
        />

        <p className="text-xs text-gray-400 text-center">
          Exercício encerrado em 31/12/{ano} — Método Indireto — Elaborado pela Controladoria CBF
        </p>
      </div>
    </PageWrapper>
  )
}
