import { Trophy } from 'lucide-react'

export default function CompeticoesPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Análise por Competição</h1>
      <p className="text-slate-600 mb-8">Receitas, custos e resultado por competição</p>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Competição</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Receitas</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Custos</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Resultado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Margem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {mockCompetitions.map((comp) => (
              <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-slate-900">{comp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(comp.receitas)}</td>
                <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(comp.custos)}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                  {formatCurrency(comp.resultado)}
                </td>
                <td className="px-6 py-4 text-right text-green-600 font-medium">{(comp.margem * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const mockCompetitions = [
  { id: 1, name: 'Copa do Brasil', receitas: 2500000, custos: 1200000, resultado: 1300000, margem: 0.52 },
  { id: 2, name: 'Campeonato Brasileiro', receitas: 3200000, custos: 1800000, resultado: 1400000, margem: 0.4375 },
  { id: 3, name: 'Libertadores', receitas: 2100000, custos: 950000, resultado: 1150000, margem: 0.547 },
  { id: 4, name: 'Seleção Principal', receitas: 700000, custos: 600000, resultado: 100000, margem: 0.143 },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
}
