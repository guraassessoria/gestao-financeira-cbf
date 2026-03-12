'use client'

import { useState } from 'react'
import { Download, Info } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import DemonstracoesTable from '@/components/tables/DemonstracoesTable'
import PeriodFilter from '@/components/filters/PeriodFilter'
import { Moeda, Periodo, LinhaFinanceira } from '@/lib/types'
import { calcularVariacao, calcularVariacaoAbsoluta, getQualitativa } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

const mockDRAData: LinhaFinanceira[] = [
  {
    codigo: 'SL',
    descricao: 'SUPERÁVIT LÍQUIDO DO EXERCÍCIO',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: 80_000_000,
    valor_anterior: 71_000_000,
  },
  {
    codigo: 'OCI',
    descricao: 'OUTROS RESULTADOS ABRANGENTES',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: -2_500_000,
    valor_anterior: 1_200_000,
    filhos: [
      {
        codigo: 'OCI01',
        descricao: 'Ajuste de Avaliação Patrimonial',
        nivel: 2,
        nivel_visualizacao: 2,
        valor_atual: -1_800_000,
        valor_anterior: 800_000,
      },
      {
        codigo: 'OCI02',
        descricao: 'Ganhos/Perdas Atuariais sobre Plano de Benefícios',
        nivel: 2,
        nivel_visualizacao: 2,
        valor_atual: -700_000,
        valor_anterior: 400_000,
      },
    ],
  },
  {
    codigo: 'RA',
    descricao: 'RESULTADO ABRANGENTE TOTAL',
    nivel: 1,
    nivel_visualizacao: 1,
    valor_atual: 77_500_000,
    valor_anterior: 72_200_000,
  },
]

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

export default function DRAPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)
  const taxaCambio = 5.12

  const data = enrichLinhas(mockDRAData)
  const resultadoAbrangente = 77_500_000
  const display = moeda === 'USD' ? resultadoAbrangente / taxaCambio : resultadoAbrangente

  return (
    <PageWrapper titulo="DRA — Demonstração do Resultado Abrangente" moeda={moeda} onMoedaChange={setMoeda}>
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

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Sobre a DRA</p>
            <p>
              A Demonstração do Resultado Abrangente (DRA) apresenta o superávit/déficit do exercício
              acrescido dos Outros Resultados Abrangentes (OCI), que são variações no PL não reconhecidas
              na DRE, como ajustes de avaliação patrimonial e ganhos/perdas atuariais.
            </p>
          </div>
        </div>

        <DemonstracoesTable
          data={data}
          moeda={moeda}
          showAnterior={compararAnoAnterior}
          titulo="Demonstração do Resultado Abrangente (DRA)"
        />

        <div className="bg-cbf-navy text-white rounded-xl px-6 py-4">
          <p className="text-sm text-gray-400">Resultado Abrangente Total do Exercício</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(display, moeda)}</p>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Exercício encerrado em 31/12/{ano} — CPC 26 / NBC TG 26 — Elaborado pela Controladoria CBF
        </p>
      </div>
    </PageWrapper>
  )
}
