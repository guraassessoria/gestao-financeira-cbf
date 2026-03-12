'use client'

import React from 'react'
import { LinhaDRECalculada } from '@/types'

type DREApiResponse = {
  periodosDisponiveis: string[]
  periodo: string | null
  periodoComparativo: string | null
  linhas: LinhaDRECalculada[]
  mensagem?: string
  error?: string
}

export default function DREPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Demonstração do Resultado (DRE)</h1>
      <p className="text-slate-600 mb-8">ITG 2002 (R1) — Entidade sem fins lucrativos</p>

      <DRETree />
    </div>
  )
}

function DRETree() {
  const [linhas, setLinhas] = React.useState<LinhaDRECalculada[]>([])
  const [periodosDisponiveis, setPeriodosDisponiveis] = React.useState<string[]>([])
  const [periodoAtual, setPeriodoAtual] = React.useState<string>('')
  const [periodoComparativo, setPeriodoComparativo] = React.useState<string | null>(null)
  const [mensagem, setMensagem] = React.useState<string>('')
  const [erro, setErro] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(true)

  const carregarDRE = React.useCallback(async (periodo?: string) => {
    setLoading(true)
    setErro('')

    try {
      const query = periodo ? `?periodo=${encodeURIComponent(periodo)}` : ''
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">Período atual: <span className="font-semibold text-slate-900">{periodoAtual || '-'}</span></p>
          <p className="text-xs text-slate-500">Comparativo: {periodoComparativo || 'Não disponível'}</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="periodo-dre" className="text-sm text-slate-700">Período:</label>
          <select
            id="periodo-dre"
            value={periodoAtual}
            onChange={(e) => void carregarDRE(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {periodosDisponiveis.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {linhas.length === 0 ? (
          <p className="text-slate-600">Nenhuma linha de DRE calculada para o período selecionado.</p>
        ) : (
          linhas.map((linha) => <DRETreeNode key={linha.codigoConta} node={linha} />)
        )}
      </div>
    </div>
  )
}

function DRETreeNode({ node }: { node: LinhaDRECalculada }) {
  const [expanded, setExpanded] = React.useState(true)

  const hasChildren = node.filhos && node.filhos.length > 0

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left ${
          node.nivel === 1 ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
      >
        {hasChildren && (
          <svg
            className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        {!hasChildren && <div className="w-4" />}

        <div className="flex-1 flex items-center justify-between">
          <div>
            <p
              className={`font-medium ${node.nivel === 1 ? 'text-lg text-blue-900' : 'text-slate-700'}`}
            >
              {node.descricao}
            </p>
            <p className="text-xs text-slate-500 mt-1">Código: {node.codigoConta}</p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-slate-900">
              {formatCurrency(node.valor)}
            </p>
            {node.variacaoPercentual !== null && (
              <p
                className={`text-xs font-medium ${
                  node.variacaoPercentual >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {node.variacaoPercentual >= 0 ? '+' : ''}{node.variacaoPercentual.toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      </button>

      {expanded && hasChildren && (
        <div className="pl-6 space-y-2 border-l border-slate-200">
          {node.filhos.map((child: LinhaDRECalculada, idx: number) => (
            <DRETreeNode key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
