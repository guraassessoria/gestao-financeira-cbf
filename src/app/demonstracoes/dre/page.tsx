'use client'

import React from 'react'
import { LinhaDRECalculada } from '@/types'

type VisaoPeriodo = 'anual' | 'mensal'

type DREApiResponse = {
  periodosDisponiveis: string[]
  periodo: string | null
  periodoComparativo: string | null
  visao: VisaoPeriodo
  linhas: LinhaDRECalculada[]
  mensagem?: string
  error?: string
}

const EPSILON = 0.005

function hasDisplayValue(node: LinhaDRECalculada): boolean {
  return Math.abs(node.valor) > EPSILON || Math.abs(node.valorAnterior || 0) > EPSILON
}

export default function DREPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Demonstração do Resultado (DRE)</h1>

      <DREList />
    </div>
  )
}

function DREList() {
  const [linhas, setLinhas] = React.useState<LinhaDRECalculada[]>([])
  const [periodosDisponiveis, setPeriodosDisponiveis] = React.useState<string[]>([])
  const [periodoAtual, setPeriodoAtual] = React.useState<string>('')
  const [periodoComparativo, setPeriodoComparativo] = React.useState<string | null>(null)
  const [visao, setVisao] = React.useState<VisaoPeriodo>('anual')
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({})
  const [mensagem, setMensagem] = React.useState<string>('')
  const [erro, setErro] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(true)

  const carregarDRE = React.useCallback(async (params?: { periodo?: string; visao?: VisaoPeriodo }) => {
    setLoading(true)
    setErro('')

    try {
      const searchParams = new URLSearchParams()
      if (params?.periodo) searchParams.set('periodo', params.periodo)
      if (params?.visao) searchParams.set('visao', params.visao)

      const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
      const res = await fetch(`/api/dre${query}`, { cache: 'no-store' })
      const data = (await res.json()) as DREApiResponse

      if (!res.ok) {
        setErro(data.error || 'Erro ao carregar DRE')
        setLinhas([])
        return
      }

      setLinhas(data.linhas || [])
      setPeriodosDisponiveis(data.periodosDisponiveis || [])
      setPeriodoAtual(data.periodo || '')
      setPeriodoComparativo(data.periodoComparativo || null)
      setVisao(data.visao || 'anual')
      setExpandedRows(
        Object.fromEntries((data.linhas || []).filter((linha) => linha.temFilhos).map((linha) => [linha.codigoConta, true]))
      )
      setMensagem(data.mensagem || '')
    } catch {
      setErro('Falha de comunicação ao carregar a DRE')
      setLinhas([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void carregarDRE()
  }, [carregarDRE])

  const linhasComValor = React.useMemo(() => {
    return linhas.filter(hasDisplayValue)
  }, [linhas])

  const linhasByCodigo = React.useMemo(() => {
    return new Map(linhasComValor.map((linha) => [linha.codigoConta, linha]))
  }, [linhasComValor])

  const linhasVisiveis = React.useMemo(() => {
    const isVisible = (linha: LinhaDRECalculada) => {
      let codigoSuperior = linha.codigoSuperior

      while (codigoSuperior) {
        const superior = linhasByCodigo.get(codigoSuperior)
        if (!superior) {
          break
        }
        if (superior.temFilhos && expandedRows[superior.codigoConta] === false) {
          return false
        }
        codigoSuperior = superior.codigoSuperior
      }

      return true
    }

    return linhasComValor.filter(isVisible)
  }, [expandedRows, linhasByCodigo, linhasComValor])

  const toggleRow = React.useCallback((codigoConta: string) => {
    setExpandedRows((current) => ({
      ...current,
      [codigoConta]: current[codigoConta] === false,
    }))
  }, [])

  if (loading) {
    return <div className="bg-white rounded-lg border border-slate-200 p-6 text-slate-600">Carregando DRE...</div>
  }

  if (erro) {
    return <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-red-700">{erro}</div>
  }

  if (mensagem) {
    return <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 text-amber-800">{mensagem}</div>
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">Visão: <span className="font-semibold text-slate-900 capitalize">{visao}</span></p>
          <p className="text-sm text-slate-600">Período atual: <span className="font-semibold text-slate-900">{periodoAtual || '-'}</span></p>
          <p className="text-xs text-slate-500">Comparativo: {periodoComparativo || 'Não disponível'}</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-50">
            {(['anual', 'mensal'] as VisaoPeriodo[]).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => void carregarDRE({ visao: opcao })}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  visao === opcao ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                {opcao === 'anual' ? 'Anual' : 'Mensal'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="periodo-dre" className="text-sm text-slate-700">Período:</label>
            <select
              id="periodo-dre"
              value={periodoAtual}
              onChange={(e) => void carregarDRE({ periodo: e.target.value, visao })}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              {periodosDisponiveis.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {linhasVisiveis.length === 0 ? (
          <p className="text-slate-600 p-6">Nenhuma linha de DRE calculada para o período selecionado.</p>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_180px_180px_120px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50">
              <div>Conta</div>
              <div className="text-right">Atual</div>
              <div className="text-right">Comparativo</div>
              <div className="text-right">Variação</div>
            </div>

            <div className="divide-y divide-slate-100">
              {linhasVisiveis.map((linha) => (
                <DREOrderedRow
                  key={linha.codigoConta}
                  node={linha}
                  expanded={expandedRows[linha.codigoConta] !== false}
                  onToggle={toggleRow}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DREOrderedRow({
  node,
  expanded,
  onToggle,
}: {
  node: LinhaDRECalculada
  expanded: boolean
  onToggle: (codigoConta: string) => void
}) {
  const isResultadoFinal = node.codigoConta === '1854'
  const isGrupo = Boolean(node.temFilhos)
  const paddingLeft = Math.max(0, (node.nivel - 1) * 14)
  const variacaoTexto =
    node.variacaoPercentual === null
      ? '—'
      : `${node.variacaoPercentual >= 0 ? '+' : ''}${node.variacaoPercentual.toFixed(2)}%`

  return (
    <div
      className={[
        'grid grid-cols-[1fr_180px_180px_120px] gap-3 px-5 py-2 items-center',
        isResultadoFinal ? 'bg-blue-900 text-white' : '',
        !isResultadoFinal && isGrupo ? 'bg-blue-50/70' : '',
        !isResultadoFinal && !isGrupo ? 'bg-white' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex items-start gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
        {isGrupo ? (
          <button
            type="button"
            onClick={() => onToggle(node.codigoConta)}
            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
              isResultadoFinal ? 'hover:bg-blue-800 text-white' : 'hover:bg-blue-100 text-slate-600'
            }`}
            aria-label={expanded ? 'Recolher linha' : 'Expandir linha'}
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="h-5 w-5 flex-shrink-0" />
        )}

        <div className="min-w-0">
          <p className={`truncate text-sm ${isResultadoFinal || isGrupo ? 'font-semibold' : 'font-medium'} ${isResultadoFinal ? 'text-white' : 'text-slate-800'}`}>
            {node.descricao}
          </p>
        </div>
      </div>

      <div className={`text-right text-sm font-semibold tabular-nums ${isResultadoFinal ? 'text-white' : 'text-slate-900'}`}>
        {formatCurrency(node.valor)}
      </div>
      <div className={`text-right tabular-nums ${isResultadoFinal ? 'text-blue-100' : 'text-slate-600'}`}>
        {node.valorAnterior === null ? '—' : formatCurrency(node.valorAnterior)}
      </div>
      <div className={`text-right text-sm font-medium ${
        isResultadoFinal
          ? 'text-blue-100'
          : node.variacaoPercentual === null
            ? 'text-slate-400'
            : node.variacaoPercentual >= 0
              ? 'text-green-600'
              : 'text-red-600'
      }`}>
        {variacaoTexto}
      </div>
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
