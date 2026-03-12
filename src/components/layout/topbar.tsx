'use client'

import { logout } from '@/app/login/actions'
import { LogOut, User } from 'lucide-react'

interface TopbarProps {
  userEmail: string
}

export function Topbar({ userEmail }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          defaultValue="2024"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>

        <select
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          defaultValue="anual"
        >
          <option value="mensal">Mensal</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>

        <select
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          defaultValue="BRL"
        >
          <option value="BRL">R$ BRL</option>
          <option value="USD">$ USD</option>
        </select>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <span className="hidden sm:block truncate max-w-[180px]">{userEmail}</span>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sair</span>
          </button>
        </form>
      </div>
    </header>
  )
}
