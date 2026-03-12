import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Layers,
  Activity,
  FileText,
  ArrowRight,
} from 'lucide-react'

const demonstracoes = [
  {
    href: '/dre',
    titulo: 'DRE',
    descricao: 'Demonstração do Resultado do Exercício',
    icon: TrendingUp,
    cor: 'bg-green-50 border-green-200',
    iconCor: 'text-green-600',
    status: 'aprovado',
  },
  {
    href: '/bp',
    titulo: 'Balanço Patrimonial',
    descricao: 'Ativo, Passivo e Patrimônio Líquido',
    icon: BarChart3,
    cor: 'bg-blue-50 border-blue-200',
    iconCor: 'text-blue-600',
    status: 'pendente',
  },
  {
    href: '/dfc',
    titulo: 'DFC',
    descricao: 'Fluxo de Caixa (Método Indireto)',
    icon: DollarSign,
    cor: 'bg-violet-50 border-violet-200',
    iconCor: 'text-violet-600',
    status: 'pendente',
  },
  {
    href: '/dra',
    titulo: 'DRA',
    descricao: 'Demonstração do Resultado Abrangente',
    icon: Layers,
    cor: 'bg-orange-50 border-orange-200',
    iconCor: 'text-orange-600',
    status: 'pendente',
  },
  {
    href: '/indicadores',
    titulo: 'Indicadores',
    descricao: 'EBITDA, Liquidez, ROE, ROA e mais',
    icon: Activity,
    cor: 'bg-teal-50 border-teal-200',
    iconCor: 'text-teal-600',
    status: 'disponivel',
  },
  {
    href: '/relatorio',
    titulo: 'Relatórios',
    descricao: 'Narrativa contábil e exportação executiva',
    icon: FileText,
    cor: 'bg-rose-50 border-rose-200',
    iconCor: 'text-rose-600',
    status: 'disponivel',
  },
]

const statusBadge: Record<string, { label: string; cls: string }> = {
  aprovado: { label: 'Mapeamento aprovado', cls: 'bg-green-100 text-green-700' },
  pendente: { label: 'Mapeamento pendente', cls: 'bg-yellow-100 text-yellow-700' },
  disponivel: { label: 'Disponível', cls: 'bg-gray-100 text-gray-600' },
}

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Painel de Gestão Financeira
        </h1>
        <p className="text-gray-500 text-sm">
          Base normativa CPC/IFRS · Dados TOTVS Protheus · Empresa: CBF
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex gap-3">
          <div className="text-blue-500 text-lg">ℹ️</div>
          <div>
            <div className="text-sm font-semibold text-blue-800 mb-1">
              Configuração inicial necessária
            </div>
            <div className="text-sm text-blue-700">
              Configure as variáveis de ambiente do Supabase e execute as
              migrations. Consulte{' '}
              <code className="bg-blue-100 px-1 rounded">.env.example</code> para
              orientações.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {demonstracoes.map(({ href, titulo, descricao, icon: Icon, cor, iconCor, status }) => {
          const badge = statusBadge[status]
          return (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col gap-4 p-5 rounded-xl border transition-all hover:shadow-md ${cor}`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${iconCor}`} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-0.5">{titulo}</div>
                <div className="text-sm text-gray-500">{descricao}</div>
              </div>
              <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                Visualizar <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Roadmap — Ondas de Entrega
        </h2>
        <div className="space-y-2">
          {[
            { onda: '1', titulo: 'Dicionário de dados e mapeamento BP/DFC/DRA', status: 'concluido' },
            { onda: '2', titulo: 'Ingestão de lançamentos e validações contábeis', status: 'disponivel' },
            { onda: '3', titulo: 'Modelo comparativo e painel financeiro', status: 'andamento' },
            { onda: '4', titulo: 'Indicadores e alertas de materialidade', status: 'disponivel' },
            { onda: '5', titulo: 'Narrativa IA guiada + aprovação', status: 'pendente' },
            { onda: '6', titulo: 'BRL/USD, tradução e auditoria avançada', status: 'pendente' },
          ].map(({ onda, titulo, status }) => (
            <div key={onda} className="flex items-center gap-4 py-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  status === 'concluido'
                    ? 'bg-green-100 text-green-700'
                    : status === 'andamento'
                      ? 'bg-blue-100 text-blue-700'
                      : status === 'disponivel'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                }`}
              >
                {onda}
              </div>
              <div className="text-sm text-gray-700">{titulo}</div>
              <div className="ml-auto">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    status === 'concluido'
                      ? 'bg-green-100 text-green-700'
                      : status === 'andamento'
                        ? 'bg-blue-100 text-blue-700'
                        : status === 'disponivel'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {status === 'concluido' ? 'Concluído' : status === 'andamento' ? 'Em andamento' : status === 'disponivel' ? 'Disponível' : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
