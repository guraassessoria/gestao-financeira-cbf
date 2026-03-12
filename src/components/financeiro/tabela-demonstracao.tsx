import { cn, formatCurrency, calcVariation } from '@/lib/utils'

export interface LinhaTabela {
  id: string
  descricao: string
  valor: number
  valorAnterior: number
  nivel: number
  isSubtotal: boolean
  isTotal: boolean
}

interface TabelaDemonstracaoProps {
  linhas: LinhaTabela[]
  titulo: string
  currency?: 'BRL' | 'USD'
}

function formatValue(value: number): string {
  if (value === 0) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function TabelaDemonstracao({ linhas, titulo, currency = 'BRL' }: TabelaDemonstracaoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-700 text-sm">{titulo}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Valores em R$ mil</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide w-1/2">
                Descrição
              </th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                Ano Atual
              </th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                Ano Anterior
              </th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                Var. R$
              </th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                Var. %
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => {
              const { absolute, percent } = calcVariation(linha.valor, linha.valorAnterior)
              const isPositive = absolute > 0
              const isNegative = absolute < 0
              const varColor = isPositive
                ? 'text-green-600'
                : isNegative
                ? 'text-red-500'
                : 'text-slate-400'

              return (
                <tr
                  key={linha.id}
                  className={cn(
                    'border-b border-slate-50 transition-colors',
                    linha.isTotal && 'bg-primary-50 border-t-2 border-t-primary-200',
                    linha.isSubtotal && 'bg-slate-50',
                    !linha.isTotal && !linha.isSubtotal && 'hover:bg-slate-50'
                  )}
                >
                  <td
                    className={cn(
                      'px-6 py-2.5',
                      linha.isTotal && 'font-bold text-slate-900',
                      linha.isSubtotal && 'font-semibold text-slate-800',
                      !linha.isTotal && !linha.isSubtotal && 'text-slate-700',
                      linha.nivel === 2 && 'pl-10',
                      linha.nivel === 3 && 'pl-14'
                    )}
                  >
                    {linha.descricao}
                  </td>
                  <td
                    className={cn(
                      'text-right px-4 py-2.5 tabular-nums',
                      linha.isTotal ? 'font-bold text-slate-900' : linha.isSubtotal ? 'font-semibold text-slate-800' : 'text-slate-700'
                    )}
                  >
                    {formatValue(linha.valor)}
                  </td>
                  <td className="text-right px-4 py-2.5 text-slate-500 tabular-nums">
                    {formatValue(linha.valorAnterior)}
                  </td>
                  <td className={cn('text-right px-4 py-2.5 tabular-nums font-medium', varColor)}>
                    {absolute === 0 ? '—' : `${absolute > 0 ? '+' : ''}${formatValue(absolute)}`}
                  </td>
                  <td className={cn('text-right px-4 py-2.5 tabular-nums font-medium', varColor)}>
                    {absolute === 0
                      ? '—'
                      : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
