import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react'

const kpis = [
  {
    title: 'Receita Bruta',
    value: 'R$ 0',
    change: '+0%',
    trend: 'up',
    description: 'vs. ano anterior',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Margem EBITDA',
    value: '0%',
    change: '0 p.p.',
    trend: 'neutral',
    description: 'vs. ano anterior',
    icon: TrendingUp,
    color: 'text-blue-600',
  },
  {
    title: 'Resultado Líquido',
    value: 'R$ 0',
    change: '+0%',
    trend: 'up',
    description: 'vs. ano anterior',
    icon: Activity,
    color: 'text-purple-600',
  },
  {
    title: 'Liquidez Corrente',
    value: '0x',
    change: '0',
    trend: 'neutral',
    description: 'vs. ano anterior',
    icon: BarChart3,
    color: 'text-orange-600',
  },
]

const statusDemos = [
  { demo: 'DRE', status: 'aprovado', cor: 'default' },
  { demo: 'BP', status: 'pendente mapeamento', cor: 'secondary' },
  { demo: 'DFC', status: 'pendente mapeamento', cor: 'secondary' },
  { demo: 'DRA', status: 'aguardando OCI', cor: 'outline' },
] as const

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Painel Financeiro</h2>
        <p className="text-muted-foreground">
          Visão executiva — exercício 2025 vs 2024
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                    {kpi.change}
                  </span>{' '}
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status das Demonstrações</CardTitle>
          <CardDescription>Progresso do mapeamento contábil — Protótipo V1</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {statusDemos.map((item) => (
              <div key={item.demo} className="flex items-center gap-2">
                <span className="font-semibold text-sm">{item.demo}</span>
                <Badge variant={item.cor as 'default' | 'secondary' | 'outline'}>{item.status}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Ação necessária:</strong> Complete o mapeamento contábil para BP, DFC e DRA nas configurações para ativar as demonstrações completas.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Carregados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'CT1 — Plano de Contas', ok: false },
              { label: 'CT2 — Lançamentos 2024–2025', ok: false },
              { label: 'CTT — Centros de Custo', ok: false },
              { label: 'CV0 — Entidade 05', ok: false },
              { label: 'DRE De_Para', ok: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className={item.ok ? 'text-green-500' : 'text-slate-300'}>
                  {item.ok ? '✓' : '○'}
                </span>
                <span className={item.ok ? '' : 'text-muted-foreground'}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Mapeamento BP (faixas de conta)', ok: false },
              { label: 'Mapeamento DFC indireto', ok: false },
              { label: 'Componentes OCI — DRA', ok: false },
              { label: 'Política de câmbio BRL/USD', ok: false },
              { label: 'Regra de materialidade', ok: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className={item.ok ? 'text-green-500' : 'text-amber-400'}>
                  {item.ok ? '✓' : '!'}
                </span>
                <span className={item.ok ? '' : 'text-muted-foreground'}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
