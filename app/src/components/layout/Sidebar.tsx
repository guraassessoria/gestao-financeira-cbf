'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  DollarSign,
  Layers,
  Activity,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Painel Geral', icon: LayoutDashboard },
  { href: '/dre', label: 'DRE', icon: TrendingUp },
  { href: '/bp', label: 'Balanço Patrimonial', icon: BarChart3 },
  { href: '/dfc', label: 'Fluxo de Caixa', icon: DollarSign },
  { href: '/dra', label: 'Resultado Abrangente', icon: Layers },
  { href: '/indicadores', label: 'Indicadores', icon: Activity },
  { href: '/relatorio', label: 'Relatórios', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-sm">
            CBF
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Gestão Financeira</div>
            <div className="text-xs text-slate-400">Painel Executivo</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
        <div className="px-3 pt-3 text-xs text-slate-500">
          v1.0 · Base CPC/IFRS
        </div>
      </div>
    </aside>
  )
}
