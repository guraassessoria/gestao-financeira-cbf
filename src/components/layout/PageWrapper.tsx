'use client'

import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Moeda } from '@/lib/types'

interface PageWrapperProps {
  children: ReactNode
  titulo: string
  moeda?: Moeda
  onMoedaChange?: (moeda: Moeda) => void
}

export default function PageWrapper({ children, titulo, moeda: externalMoeda, onMoedaChange: externalOnMoedaChange }: PageWrapperProps) {
  const [internalMoeda, setInternalMoeda] = useState<Moeda>('BRL')
  const moeda = externalMoeda ?? internalMoeda
  const handleMoedaChange = externalOnMoedaChange ?? setInternalMoeda

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header titulo={titulo} moeda={moeda} onMoedaChange={handleMoedaChange} />
        <main className="flex-1 p-6">
          {children}
        </main>
        <footer className="px-6 py-3 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Confederação Brasileira de Futebol — Gestão Financeira
          </p>
        </footer>
      </div>
    </div>
  )
}
