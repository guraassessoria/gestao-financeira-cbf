'use client'

import { useState } from 'react'
import { Bell, DollarSign } from 'lucide-react'
import { Moeda } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HeaderProps {
  titulo: string
  moeda: Moeda
  onMoedaChange: (moeda: Moeda) => void
}

export default function Header({ titulo, moeda, onMoedaChange }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{titulo}</h1>
        <p className="text-xs text-gray-500">Dados de demonstrações financeiras</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onMoedaChange('BRL')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              moeda === 'BRL' ? 'bg-white text-cbf-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            R$
          </button>
          <button
            onClick={() => onMoedaChange('USD')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              moeda === 'USD' ? 'bg-white text-cbf-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            US$
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cbf-green rounded-full" />
        </button>

        {/* Demo badge */}
        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
          Dados Demo
        </span>
      </div>
    </header>
  )
}
