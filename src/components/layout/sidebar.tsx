'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Waves,
  FileText,
  Activity,
  Upload,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',              label: 'Visão Geral',    icon: LayoutDashboard },
  { href: '/dashboard/dre',          label: 'DRE',            icon: TrendingUp },
  { href: '/dashboard/bp',           label: 'BP',             icon: BarChart3 },
  { href: '/dashboard/dfc',          label: 'DFC',            icon: Waves },
  { href: '/dashboard/dra',          label: 'DRA',            icon: FileText },
  { href: '/dashboard/indicadores',  label: 'Indicadores',    icon: Activity },
  { href: '/dashboard/carga-dados',  label: 'Carga de Dados', icon: Upload },
  { href: '/dashboard/configuracoes',label: 'Configurações',  icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">GF</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">Gestão Financeira</p>
            <p className="text-xs text-slate-400 truncate">CBF</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary-600 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">Protótipo V1 · TOTVS Protheus</p>
      </div>
    </aside>
  )
}
