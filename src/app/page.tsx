'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Scale,
  Droplets,
  LineChart,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import BarChart from '@/components/charts/BarChart'
import PeriodFilter from '@/components/filters/PeriodFilter'
import { Moeda, Periodo } from '@/lib/types'
import { formatCurrency, formatPercent, abbreviateCurrency } from '@/lib/formatters'
import { mockDadosMensais } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface KPICardProps {
  titulo: string
  valor: number
  valorAnterior?: number
  moeda: Moeda
  icon: React.ReactNode
  positivo?: boolean
  taxaCambio: number
}

function KPICard({ titulo, valor, valorAnterior, moeda, icon, positivo = true, taxaCambio }: KPICardProps) {
  const displayValor = moeda === 'USD' ? valor / taxaCambio : valor
  const displayAnterior = valorAnterior !== undefined
    ? (moeda === 'USD' ? valorAnterior / taxaCambio : valorAnterior)
    : undefined
  const variacao = displayAnterior ? ((displayValor - displayAnterior) / Math.abs(displayAnterior)) * 100 : null
  const isFavoravel = positivo ? (variacao ?? 0) > 0 : (variacao ?? 0) < 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <div className="w-9 h-9 bg-cbf-green/10 rounded-lg flex items-center justify-center text-cbf-green">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-cbf-navy tabular-nums">{abbreviateCurrency(displayValor, moeda)}</p>
      {variacao !== null && (
        <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', isFavoravel ? 'text-green-600' : 'text-red-600')}>
          {isFavoravel ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{formatPercent(variacao)} vs ano anterior</span>
        </div>
      )}
    </div>
  )
}

const QUICK_LINKS = [
  { href: '/dre', label: 'DRE', desc: 'Demonstração do Resultado', icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
  { href: '/bp', label: 'BP', desc: 'Balanço Patrimonial', icon: Scale, color: 'bg-purple-50 text-purple-600' },
  { href: '/dfc', label: 'DFC', desc: 'Fluxo de Caixa', icon: Droplets, color: 'bg-teal-50 text-teal-600' },
  { href: '/dra', label: 'DRA', desc: 'Resultado Abrangente', icon: LineChart, color: 'bg-orange-50 text-orange-600' },
  { href: '/indicadores', label: 'Indicadores', desc: 'Indicadores Financeiros', icon: BarChart3, color: 'bg-green-50 text-green-600' },
  { href: '/relatorios', label: 'Relatórios', desc: 'Gerador de Narrativas', icon: FileText, color: 'bg-pink-50 text-pink-600' },
]

export default function DashboardPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [ano, setAno] = useState(2025)
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [compararAnoAnterior, setCompararAnoAnterior] = useState(true)
  const taxaCambio = 5.12

  const chartBars = [
    { key: 'receitas', label: 'Receitas', color: '#009c3b' },
    { key: 'despesas', label: 'Despesas', color: '#ef4444' },
    { key: 'resultado', label: 'Resultado', color: '#3b82f6' },
  ]

  return (
    <PageWrapper titulo="Dashboard" moeda={moeda} onMoedaChange={setMoeda}>
      <div className="space-y-6">
        {/* Period filter */}
        <PeriodFilter
          ano={ano}
          periodo={periodo}
          onAnoChange={setAno}
          onPeriodoChange={setPeriodo}
          compararAnoAnterior={compararAnoAnterior}
          onCompararChange={setCompararAnoAnterior}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            titulo="Receita Total"
            valor={850_000_000}
            valorAnterior={780_000_000}
            moeda={moeda}
            icon={<DollarSign className="w-5 h-5" />}
            taxaCambio={taxaCambio}
          />
          <KPICard
            titulo="Superávit"
            valor={80_000_000}
            valorAnterior={71_000_000}
            moeda={moeda}
            icon={<TrendingUp className="w-5 h-5" />}
            taxaCambio={taxaCambio}
          />
          <KPICard
            titulo="EBITDA"
            valor={125_000_000}
            valorAnterior={114_000_000}
            moeda={moeda}
            icon={<BarChart3 className="w-5 h-5" />}
            taxaCambio={taxaCambio}
          />
          <KPICard
            titulo="Liquidez Corrente"
            valor={1.82}
            valorAnterior={1.74}
            moeda={moeda}
            icon={<Droplets className="w-5 h-5" />}
            taxaCambio={1}
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Receitas vs Despesas — {ano}</h2>
            <span className="text-xs text-gray-400">Valores mensais</span>
          </div>
          <BarChart
            data={mockDadosMensais}
            bars={chartBars}
            xKey="mes"
            moeda={moeda}
            height={320}
          />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Demonstrações Financeiras</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group hover:border-cbf-green/30"
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', link.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-gray-900 group-hover:text-cbf-green transition-colors">{link.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{link.desc}</p>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-cbf-green mt-2 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Summary table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Resumo Comparativo — {ano} vs {ano - 1}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Indicador</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">{ano}</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">{ano - 1}</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-700">Variação</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Receita Total', atual: 850_000_000, anterior: 780_000_000 },
                  { label: 'Receita Líquida', atual: 805_000_000, anterior: 739_000_000 },
                  { label: 'EBITDA', atual: 125_000_000, anterior: 114_000_000 },
                  { label: 'Superávit Líquido', atual: 80_000_000, anterior: 71_000_000 },
                  { label: 'Caixa Final', atual: 185_000_000, anterior: 162_000_000 },
                ].map((row) => {
                  const atualD = moeda === 'USD' ? row.atual / taxaCambio : row.atual
                  const anteriorD = moeda === 'USD' ? row.anterior / taxaCambio : row.anterior
                  const var_pct = ((atualD - anteriorD) / anteriorD) * 100
                  return (
                    <tr key={row.label} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{row.label}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-gray-900">{abbreviateCurrency(atualD, moeda)}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-gray-500">{abbreviateCurrency(anteriorD, moeda)}</td>
                      <td className={cn('py-3 px-4 text-right font-medium tabular-nums', var_pct > 0 ? 'text-green-600' : 'text-red-600')}>
                        {formatPercent(var_pct)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
