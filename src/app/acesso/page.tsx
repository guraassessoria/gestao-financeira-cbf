import Link from 'next/link'
import { ShieldCheck, Calculator, SearchCheck, BarChart3 } from 'lucide-react'

const accessProfiles = [
  {
    role: 'admin',
    title: 'Administrador',
    description: 'Acesso completo, incluindo upload e administração',
    icon: ShieldCheck,
    color: 'text-blue-600',
  },
  {
    role: 'contador',
    title: 'Contador',
    description: 'Upload de dados, demonstrações e indicadores',
    icon: Calculator,
    color: 'text-emerald-600',
  },
  {
    role: 'auditor',
    title: 'Auditor',
    description: 'Visão analítica em modo leitura',
    icon: SearchCheck,
    color: 'text-amber-600',
  },
  {
    role: 'diretor',
    title: 'Diretor',
    description: 'Visão executiva de demonstrações e índices',
    icon: BarChart3,
    color: 'text-indigo-600',
  },
]

export default function AcessoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">CBF Financeiro</h1>
          <p className="text-slate-600 mt-2">Selecione seu perfil para iniciar sessão</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accessProfiles.map((profile) => {
            const Icon = profile.icon
            return (
              <Link
                key={profile.role}
                href={`/login?perfil=${profile.role}`}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <Icon className={`w-8 h-8 ${profile.color}`} />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{profile.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{profile.description}</p>
                <p className="mt-4 text-xs font-medium text-blue-700">Continuar</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
