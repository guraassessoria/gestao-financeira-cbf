'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Scale,
  Droplets,
  LineChart,
  BarChart3,
  FileText,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dre', label: 'DRE', icon: TrendingUp },
  { href: '/bp', label: 'Balanço Patrimonial', icon: Scale },
  { href: '/dfc', label: 'Fluxo de Caixa', icon: Droplets },
  { href: '/dra', label: 'Resultado Abrangente', icon: LineChart },
  { href: '/indicadores', label: 'Indicadores', icon: BarChart3 },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-cbf-navy text-white flex flex-col z-30">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-cbf-navy-light">
        <div className="w-10 h-10 bg-cbf-green rounded-full flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Gestão Financeira</p>
          <p className="text-xs text-gray-400 leading-tight">CBF</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-cbf-green text-white font-semibold'
                      : 'text-gray-300 hover:bg-cbf-navy-light hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User area */}
      <div className="px-4 py-4 border-t border-cbf-navy-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cbf-navy-light rounded-full flex items-center justify-center text-xs font-bold">
            CF
          </div>
          <div>
            <p className="text-xs font-semibold">Controladoria</p>
            <p className="text-xs text-gray-400">CBF</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
