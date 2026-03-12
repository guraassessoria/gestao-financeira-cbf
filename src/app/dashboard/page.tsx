import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { KPICard, KPIGrid } from '@/components/dashboard/KPICard'

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-2">Painel executivo com KPIs e análises principais — Período: 2025-03 vs 2025-02</p>
      </div>

      {/* KPI Cards Grid */}
      <KPIGrid>
        <KPICard
          title="Superávit do Exercício"
          value="R$ 2.150M"
          change={12.5}
          color="green"
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <KPICard
          title="Receita Bruta"
          value="R$ 8.500M"
          change={8.2}
          color="blue"
          icon={<DollarSign className="w-8 h-8" />}
        />
        <KPICard
          title="Custos com Futebol"
          value="R$ 3.200M"
          change={-5.1}
          color="amber"
          icon={<PieChart className="w-8 h-8" />}
        />
        <KPICard
          title="Margem Líquida"
          value="25.3%"
          change={3.1}
          color="green"
          icon={<TrendingUp className="w-8 h-8" />}
        />
      </KPIGrid>

      {/* Section: Análise Rápida */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Análise Rápida</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Receitas e Custos */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Receitas vs Custos</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Receita de Transmissão</span>
                  <span className="text-sm font-bold">R$ 2.800M</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Patrocínios</span>
                  <span className="text-sm font-bold">R$ 1.900M</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Custos Seleção Principal</span>
                  <span className="text-sm font-bold text-red-600">R$ 1.200M</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores Chave */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Indicadores Chave</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">ROE</span>
                <span className="font-bold text-lg">12.4%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Liquidez Corrente</span>
                <span className="font-bold text-lg">1.85x</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Endividamento</span>
                <span className="font-bold text-lg">42.1%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">Cobertura de Juros</span>
                <span className="font-bold text-lg">8.2x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Próximos Passos */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Próximos Passos</h3>
        <p className="text-blue-800 text-sm">
          Envie um arquivo CT2 para carregar dados reais. Acesse a página de{' '}
          <a href="/upload" className="font-semibold underline hover:text-blue-900">
            Upload
          </a>
          {' '}para começar.
        </p>
      </div>
    </div>
  )
}
