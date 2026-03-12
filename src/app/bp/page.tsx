'use client'

import { useState } from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import DemonstracoesTable from '@/components/tables/DemonstracoesTable'
import PeriodFilter from '@/components/filters/PeriodFilter'
import { Moeda, Periodo, LinhaFinanceira } from '@/lib/types'
import { formatCurrency } from '@/lib/formatters'
import { mockBPAtivo, mockBPPassivo } from '@/lib/mock-data'
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

export default function BPPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)
  const taxaCambio = 5.12

  const ativo = enrichLinhas(mockBPAtivo)
  const passivo = enrichLinhas(mockBPPassivo)

  const totalAtivo = mockBPAtivo.find(l => l.codigo === 'AT')?.valor_atual ?? 0
  const totalPassivo = mockBPPassivo.find(l => l.codigo === 'PT')?.valor_atual ?? 0
  const balanced = Math.abs(totalAtivo - totalPassivo) < 1

  const displayTotal = (v: number) => moeda === 'USD' ? v / taxaCambio : v

  return (
    <PageWrapper titulo="BP — Balanço Patrimonial" moeda={moeda} onMoedaChange={setMoeda}>
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

        {/* Balance check */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${balanced ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {balanced
            ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          }
          <span className="text-sm font-medium">
            {balanced
              ? `Balanço conferido: Ativo = Passivo + PL (${formatCurrency(displayTotal(totalAtivo), moeda)})`
              : `Atenção: Balanço desbalanceado. Ativo: ${formatCurrency(displayTotal(totalAtivo), moeda)} ≠ Passivo+PL: ${formatCurrency(displayTotal(totalPassivo), moeda)}`
            }
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DemonstracoesTable
            data={ativo}
            moeda={moeda}
            showAnterior={compararAnoAnterior}
            titulo="ATIVO"
          />
          <DemonstracoesTable
            data={passivo}
            moeda={moeda}
            showAnterior={compararAnoAnterior}
            titulo="PASSIVO + PATRIMÔNIO LÍQUIDO"
          />
        </div>

        <p className="text-xs text-gray-400 text-center">
          Posição em 31/12/{ano} — Valores em {moeda === 'BRL' ? 'Reais (R$)' : 'Dólares (US$)'} — Elaborado pela Controladoria CBF
        </p>
      </div>
    </PageWrapper>
  )
}
