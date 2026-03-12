import { BarChart3 } from 'lucide-react'

export default function DemonstracoesDemoPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Demonstrações Financeiras</h1>
      <p className="text-slate-600 mb-8">Acesso a DRE, BP, DFC e DRA</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DemoCard
          title="DRE — Demonstração do Resultado"
          description="Receitas, custos e resultado líquido do período"
          href="/demonstracoes/dre"
        />
        <DemoCard
          title="BP — Balanço Patrimonial"
          description="Ativos, passivos e patrimônio líquido"
          href="/demonstracoes/bp"
        />
        <DemoCard
          title="DFC — Fluxo de Caixa"
          description="Entradas e saídas de caixa por atividade"
          href="/demonstracoes/dfc"
        />
        <DemoCard
          title="DRA — Mutação do Patrimônio"
          description="Variações no patrimônio líquido do período"
          href="/demonstracoes/dra"
        />
      </div>
    </div>
  )
}

function DemoCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a href={href} className="block p-6 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </a>
  )
}
