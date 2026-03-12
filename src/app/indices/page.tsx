import { TrendingUp } from 'lucide-react'

export default function IndicesPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Índices Financeiros</h1>
      <p className="text-slate-600 mb-8">Indicadores de rentabilidade, liquidez e endividamento</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IndiceCard title="Margem EBITDA" value="28.5%" description="Rentabilidade operacional" />
        <IndiceCard title="Margem Líquida" value="25.3%" description="Rentabilidade final" />
        <IndiceCard title="ROE" value="12.4%" description="Retorno sobre patrimônio líquido" />
        <IndiceCard title="Liquidez Corrente" value="1.85x" description="Capacidade de pagamento" />
        <IndiceCard title="Endividamento" value="42.1%" description="Participação de dívidas" />
        <IndiceCard title="Cobertura de Juros" value="8.2x" description="Capacidade de cobrir juros" />
      </div>
    </div>
  )
}

function IndiceCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-xs text-slate-500 mt-2">{description}</p>
        </div>
        <TrendingUp className="w-8 h-8 text-green-600" />
      </div>
    </div>
  )
}
