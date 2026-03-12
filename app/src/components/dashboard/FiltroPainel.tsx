'use client'

import { useState } from 'react'
import type { VisaoTemporal, Moeda } from '@/types'

interface FiltroPainelProps {
  ano: number
  anoComparativo: number
  visao: VisaoTemporal
  moeda: Moeda
  anosDisponiveis: number[]
  onChange: (filtro: {
    ano: number
    anoComparativo: number
    visao: VisaoTemporal
    moeda: Moeda
  }) => void
}

export default function FiltroPainel({
  ano,
  anoComparativo,
  visao,
  moeda,
  anosDisponiveis,
  onChange,
}: FiltroPainelProps) {
  const [localAno, setLocalAno] = useState(ano)
  const [localAnoComp, setLocalAnoComp] = useState(anoComparativo)
  const [localVisao, setLocalVisao] = useState(visao)
  const [localMoeda, setLocalMoeda] = useState(moeda)

  function aplicar() {
    onChange({
      ano: localAno,
      anoComparativo: localAnoComp,
      visao: localVisao,
      moeda: localMoeda,
    })
  }

  const visoes: { value: VisaoTemporal; label: string }[] = [
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'anual', label: 'Anual' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
      {/* Ano atual */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Ano base</label>
        <select
          value={localAno}
          onChange={(e) => setLocalAno(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {anosDisponiveis.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Ano comparativo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Comparativo</label>
        <select
          value={localAnoComp}
          onChange={(e) => setLocalAnoComp(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {anosDisponiveis.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Visao temporal */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Visão</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {visoes.map((v) => (
            <button
              key={v.value}
              onClick={() => setLocalVisao(v.value)}
              className={`text-sm px-3 py-1.5 transition-colors ${
                localVisao === v.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Moeda */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Moeda</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['BRL', 'USD'] as Moeda[]).map((m) => (
            <button
              key={m}
              onClick={() => setLocalMoeda(m)}
              className={`text-sm px-3 py-1.5 transition-colors ${
                localMoeda === m
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Botao aplicar */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium opacity-0">-</label>
        <button
          onClick={aplicar}
          className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
