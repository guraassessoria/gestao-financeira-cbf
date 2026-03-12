import Link from 'next/link'
import { KpiCard } from '@/components/financeiro/kpi-card'
import { BarChart3, TrendingUp, DollarSign, Banknote } from 'lucide-react'

// Mock KPI data (values in R$ thousands)
const kpis = [
  {
    titulo: 'Receita Líquida',
    valor: 48_320,
    valorAnterior: 43_100,
    icon: DollarSign,
    prefixo: 'R$ mil',
  },
  {
    titulo: 'EBITDA',
    valor: 12_480,
    valorAnterior: 10_200,
    icon: TrendingUp,
    prefixo: 'R$ mil',
  },
  {
    titulo: 'Resultado Líquido',
    valor: 7_890,
    valorAnterior: 6_540,
    icon: BarChart3,
    prefixo: 'R$ mil',
  },
  {
    titulo: 'Caixa Operacional',
    valor: 10_150,
    valorAnterior: 9_200,
    icon: Banknote,
    prefixo: 'R$ mil',
  },
]

const demonstracoes = [
  { href: '/dashboard/dre', label: 'DRE', descricao: 'Demonstrativo de Resultado do Exercício' },
  { href: '/dashboard/bp', label: 'BP', descricao: 'Balanço Patrimonial' },
  { href: '/dashboard/dfc', label: 'DFC', descricao: 'Demonstrativo de Fluxo de Caixa' },
  { href: '/dashboard/dra', label: 'DRA', descricao: 'Demonstrativo de Resultado Abrangente' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500 text-sm mt-1">
          Dados carregados dos arquivos TOTVS Protheus. Selecione o período e demonstração desejados.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.titulo} {...kpi} />
        ))}
      </div>

      {/* Demonstrations quick links */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Demonstrações Financeiras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demonstracoes.map((dem) => (
            <Link
              key={dem.href}
              href={dem.href}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-400 hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg mb-3 group-hover:bg-primary-100 transition-colors">
                <span className="text-primary-700 font-bold text-sm">{dem.label}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{dem.label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{dem.descricao}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-800">
        <strong>Protótipo V1</strong> — Os dados exibidos são ilustrativos. Carregue os arquivos CSV/XLS
        do TOTVS Protheus na seção{' '}
        <Link href="/dashboard/carga-dados" className="underline font-medium">
          Carga de Dados
        </Link>{' '}
        para visualizar os números reais da empresa.
      </div>
    </div>
  )
}
