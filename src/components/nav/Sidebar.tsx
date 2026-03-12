'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Upload,
  Settings,
  Activity,
  BookOpen,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dre', label: 'DRE', icon: TrendingUp },
  { href: '/bp', label: 'Balanço Patrimonial', icon: BarChart3 },
  { href: '/dfc', label: 'Fluxo de Caixa', icon: Activity },
  { href: '/dra', label: 'DRA', icon: BookOpen },
  { href: '/indicadores', label: 'Indicadores', icon: DollarSign },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/importacao', label: 'Importação', icon: Upload },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">CBF</h1>
        <p className="text-xs text-slate-400 mt-1">Gestão Financeira</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">Protótipo V1</p>
      </div>
    </aside>
  )
}
