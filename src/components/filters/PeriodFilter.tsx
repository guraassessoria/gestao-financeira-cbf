'use client'

import { useState } from 'react'
import { Periodo, Moeda } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MESES_PT } from '@/lib/utils'

interface PeriodFilterProps {
  ano: number
  mes?: number
  trimestre?: number
  periodo: Periodo
  onAnoChange: (ano: number) => void
  onMesChange?: (mes: number) => void
  onPeriodoChange: (p: Periodo) => void
  compararAnoAnterior: boolean
  onCompararChange: (v: boolean) => void
}

const ANOS = [2025, 2024, 2023, 2022]

export default function PeriodFilter({
  ano,
  mes,
  trimestre,
  periodo,
  onAnoChange,
  onMesChange,
  onPeriodoChange,
  compararAnoAnterior,
  onCompararChange,
}: PeriodFilterProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-4">
      {/* Ano */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Ano:</span>
        <select
          value={ano}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cbf-green"
        >
          {ANOS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Período */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {(['mensal', 'trimestral', 'anual'] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodoChange(p)}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors',
              periodo === p ? 'bg-white text-cbf-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {p === 'mensal' ? 'Mensal' : p === 'trimestral' ? 'Trimestral' : 'Anual'}
          </button>
        ))}
      </div>

      {/* Comparar ano anterior */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={compararAnoAnterior}
          onChange={(e) => onCompararChange(e.target.checked)}
          className="w-4 h-4 accent-cbf-green"
        />
        <span className="text-sm text-gray-600">Comparar ano anterior</span>
      </label>
    </div>
  )
}
