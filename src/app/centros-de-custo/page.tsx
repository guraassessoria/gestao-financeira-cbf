import { Briefcase } from 'lucide-react'

export default function CentrosCustoPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Análise por Centro de Custo</h1>
      <p className="text-slate-600 mb-8">Distribuição de receitas e despesas por centro de custo</p>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Centro de Custo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Receitas</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Despesas</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {mockCC.map((cc) => (
              <tr key={cc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">{cc.name}</p>
                      <p className="text-xs text-slate-500">Código: {cc.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(cc.receitas)}</td>
                <td className="px-6 py-4 text-right text-slate-900">{formatCurrency(cc.despesas)}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                  {formatCurrency(cc.resultado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const mockCC = [
  { id: 1, code: '10001', name: 'Seleção Principal', receitas: 1200000, despesas: 800000, resultado: 400000 },
  { id: 2, code: '10002', name: 'Seleções de Base', receitas: 450000, despesas: 350000, resultado: 100000 },
  { id: 3, code: '10003', name: 'Administração', receitas: 0, despesas: 600000, resultado: -600000 },
  { id: 4, code: '10004', name: 'Financeiro', receitas: 300000, despesas: 150000, resultado: 150000 },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
}
