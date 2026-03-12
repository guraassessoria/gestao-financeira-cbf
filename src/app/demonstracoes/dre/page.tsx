'use client'

import React from 'react'
import { LinhaDRECalculada } from '@/types'

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
  // Mock DRE structure
  const mockDRE: LinhaDRECalculada = {
    codigoConta: '1854',
    descricao: 'Superávit do Exercício',
    nivel: 1,
    nivelVisualizacao: 1,
    codigoSuperior: null,
    valor: 2150000,
    valorAnterior: 1950000,
    variacaoAbsoluta: 200000,
    variacaoPercentual: 10.26,
    filhos: [
      {
        codigoConta: '1852',
        descricao: 'Resultado Antes dos Impostos',
        nivel: 2,
        nivelVisualizacao: 1,
        codigoSuperior: '1854',
        valor: 2350000,
        valorAnterior: 2100000,
        variacaoAbsoluta: 250000,
        variacaoPercentual: 11.9,
        filhos: [
          {
            codigoConta: '1703',
            descricao: 'Total da Receita Líquida',
            nivel: 3,
            nivelVisualizacao: 2,
            codigoSuperior: '1852',
            valor: 8500000,
            valorAnterior: 7850000,
            variacaoAbsoluta: 650000,
            variacaoPercentual: 8.28,
            filhos: [],
          },
          {
            codigoConta: '1819',
            descricao: 'Total dos Custos e Despesas',
            nivel: 3,
            nivelVisualizacao: 2,
            codigoSuperior: '1852',
            valor: -6150000,
            valorAnterior: -5750000,
            variacaoAbsoluta: -400000,
            variacaoPercentual: -6.96,
            filhos: [],
          },
        ],
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <DRETreeNode node={mockDRE} />
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
  }).format(value / 100)
}
