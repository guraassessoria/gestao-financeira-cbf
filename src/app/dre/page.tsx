'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import DemonstracoesTable from '@/components/tables/DemonstracoesTable'
import PeriodFilter from '@/components/filters/PeriodFilter'
import { Moeda, Periodo, LinhaFinanceira } from '@/lib/types'
import { calcularVariacao, calcularVariacaoAbsoluta, getQualitativa } from '@/lib/utils'
import { mockDREData } from '@/lib/mock-data'

function enrichLinhas(linhas: LinhaFinanceira[]): LinhaFinanceira[] {
  return linhas.map((l) => {
    const var_abs = l.valor_anterior !== undefined
      ? calcularVariacaoAbsoluta(l.valor_atual, l.valor_anterior)
      : undefined
    const var_pct = l.valor_anterior !== undefined
      ? calcularVariacao(l.valor_atual, l.valor_anterior)
      : undefined
    return {
      ...l,
      variacao_absoluta: var_abs,
      variacao_percentual: var_pct ?? undefined,
      qualitativa: var_pct !== null && var_pct !== undefined ? getQualitativa(var_pct) : '—',
      filhos: l.filhos ? enrichLinhas(l.filhos) : undefined,
    }
  })
}

export default function DREPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)
  const data = enrichLinhas(mockDREData)

  return (
    <PageWrapper titulo="DRE — Demonstração do Resultado" moeda={moeda} onMoedaChange={setMoeda}>
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

        <div className="bg-cbf-navy text-white rounded-xl px-6 py-4 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-400">Demonstração</p>
            <p className="font-semibold">Resultado do Exercício</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Período</p>
            <p className="font-semibold">01/01/{ano} a 31/12/{ano}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Moeda</p>
            <p className="font-semibold">{moeda === 'BRL' ? 'Real Brasileiro (R$)' : 'Dólar Americano (US$)'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fonte</p>
            <p className="font-semibold text-amber-300">Dados Demonstrativos</p>
          </div>
        </div>

        <DemonstracoesTable
          data={data}
          moeda={moeda}
          showAnterior={compararAnoAnterior}
          titulo="Demonstração do Resultado do Exercício (DRE)"
        />

        <p className="text-xs text-gray-400 text-center">
          Valores em {moeda === 'BRL' ? 'Reais (R$)' : 'Dólares (US$)'} — Exercício encerrado em 31/12/{ano} — Elaborado pela Controladoria CBF
        </p>
      </div>
    </PageWrapper>
  )
}
