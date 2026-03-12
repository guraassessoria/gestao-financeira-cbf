import { formatPercent } from '@/lib/utils'
import type { IndicadorFinanceiro } from '@/types'

// Mock indicators based on mock DRE/BP data
const indicadores: IndicadorFinanceiro[] = [
  {
    nome: 'Margem EBITDA',
    valor: 25.8,
    valor_anterior: 23.7,
    variacao: 2.1,
    unidade: 'percentual',
    descricao: 'EBITDA / Receita Líquida',
  },
  {
    nome: 'Margem Líquida',
    valor: 16.3,
    valor_anterior: 15.2,
    variacao: 1.1,
    unidade: 'percentual',
    descricao: 'Lucro Líquido / Receita Líquida',
  },
  {
    nome: 'ROE',
    valor: 15.3,
    valor_anterior: 14.3,
    variacao: 1.0,
    unidade: 'percentual',
    descricao: 'Lucro Líquido / Patrimônio Líquido',
  },
  {
    nome: 'ROA',
    valor: 8.0,
    valor_anterior: 7.4,
    variacao: 0.6,
    unidade: 'percentual',
    descricao: 'Lucro Líquido / Ativo Total',
  },
  {
    nome: 'Liquidez Corrente',
    valor: 1.48,
    valor_anterior: 1.49,
    variacao: -0.01,
    unidade: 'indice',
    descricao: 'Ativo Circulante / Passivo Circulante',
  },
  {
    nome: 'Endividamento Geral',
    valor: 47.7,
    valor_anterior: 48.3,
    variacao: -0.6,
    unidade: 'percentual',
    descricao: '(PC + PNC) / Ativo Total',
  },
  {
    nome: 'Composição do Endividamento',
    valor: 60.8,
    valor_anterior: 59.6,
    variacao: 1.2,
    unidade: 'percentual',
    descricao: 'Passivo Circulante / (PC + PNC)',
  },
  {
    nome: 'Cobertura de Juros',
    valor: 7.47,
    valor_anterior: 7.93,
    variacao: -0.46,
    unidade: 'indice',
    descricao: 'EBIT / Despesas Financeiras',
  },
  {
    nome: 'Conversão de Caixa',
    valor: 81.3,
    valor_anterior: 90.2,
    variacao: -8.9,
    unidade: 'percentual',
    descricao: 'Caixa Operacional / EBITDA',
  },
]

function getVariacaoColor(variacao: number, nome: string): string {
  // Some indicators are better when lower (e.g., Endividamento)
  const inversedIndicators = ['Endividamento Geral']
  const isInversed = inversedIndicators.includes(nome)
  const isPositive = isInversed ? variacao < 0 : variacao > 0
  if (variacao === 0) return 'text-slate-500'
  return isPositive ? 'text-green-600' : 'text-red-500'
}

function formatValue(indicador: IndicadorFinanceiro): string {
  if (indicador.unidade === 'percentual') return `${indicador.valor.toFixed(1)}%`
  if (indicador.unidade === 'indice') return indicador.valor.toFixed(2) + ' x'
  return indicador.valor.toLocaleString('pt-BR')
}

function formatVariacao(indicador: IndicadorFinanceiro): string {
  const sign = indicador.variacao > 0 ? '+' : ''
  if (indicador.unidade === 'percentual') return `${sign}${indicador.variacao.toFixed(1)} p.p.`
  if (indicador.unidade === 'indice') return `${sign}${indicador.variacao.toFixed(2)} x`
  return `${sign}${indicador.variacao.toFixed(1)}`
}

export default function IndicadoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Indicadores Financeiros</h1>
        <p className="text-slate-500 text-sm mt-1">
          Principais métricas para empresa de serviços • Comparativo Ano Atual × Ano Anterior
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {indicadores.map((ind) => (
          <div
            key={ind.nome}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{ind.nome}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{ind.descricao}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  getVariacaoColor(ind.variacao, ind.nome) === 'text-green-600'
                    ? 'bg-green-50 text-green-700'
                    : getVariacaoColor(ind.variacao, ind.nome) === 'text-red-500'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {formatVariacao(ind)}
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-900">{formatValue(ind)}</span>
              <span className="text-sm text-slate-400 mb-0.5">
                ant: {formatValue({ ...ind, valor: ind.valor_anterior })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
