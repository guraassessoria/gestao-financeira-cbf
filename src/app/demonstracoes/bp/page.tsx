import { AlertCircle } from 'lucide-react'

export default function BPPage() {
  return (
    <PagePlaceholder title="Balanço Patrimonial" description="Demonstração de Ativos, Passivos e Patrimônio Líquido" />
  )
}

function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 mb-8">{description}</p>

      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-blue-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Em Desenvolvimento</h3>
        <p className="text-slate-600">Este módulo será implementado na próxima iteração</p>
      </div>
    </div>
  )
}
