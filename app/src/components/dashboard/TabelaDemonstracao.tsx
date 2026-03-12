'use client'

import type { LinhaFinanceira } from '@/types'
import { formatarMoeda, formatarPercentual } from '@/utils/financeiro'

interface TabelaDemonstracaoProps {
  linhas: LinhaFinanceira[]
  moeda?: 'BRL' | 'USD'
  titulo?: string
  periodoAtual: string
  periodoAnterior: string
  carregando?: boolean
}

export default function TabelaDemonstracao({
  linhas,
  moeda = 'BRL',
  titulo,
  periodoAtual,
  periodoAnterior,
  carregando = false,
}: TabelaDemonstracaoProps) {
  if (carregando) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {titulo && <h2 className="text-lg font-semibold mb-4 text-gray-800">{titulo}</h2>}
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {titulo && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left w-[40%]">Linha</th>
              <th className="px-4 py-3 text-right">{periodoAtual}</th>
              <th className="px-4 py-3 text-right">{periodoAnterior}</th>
              <th className="px-4 py-3 text-right">Var. Abs.</th>
              <th className="px-4 py-3 text-right">Var. %</th>
              <th className="px-6 py-3 text-left">Qualitativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {linhas.map((linha, idx) => {
              if (linha.ehSeparador) {
                return (
                  <tr key={idx}>
                    <td colSpan={6} className="px-6 py-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {linha.secao}
                      </div>
                    </td>
                  </tr>
                )
              }

              const isTotal = linha.ehTotal
              const isSubtotal = linha.ehSubtotal
              const varPositiva =
                linha.variacaoPercentual !== null && linha.variacaoPercentual > 0
              const varNegativa =
                linha.variacaoPercentual !== null && linha.variacaoPercentual < 0
              const materialidade =
                linha.variacaoPercentual !== null &&
                Math.abs(linha.variacaoPercentual) >= 5

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isTotal
                      ? 'bg-slate-50 font-bold'
                      : isSubtotal
                        ? 'bg-gray-50 font-semibold'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <td
                    className={`px-6 py-3 text-gray-800 ${
                      isTotal ? 'text-sm' : 'text-xs'
                    } ${!isTotal && !isSubtotal ? 'pl-10' : ''}`}
                  >
                    {linha.linha}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800 tabular-nums">
                    {formatarMoeda(linha.valorAtual, moeda)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                    {formatarMoeda(linha.valorAnterior, moeda)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span
                      className={
                        linha.variacao > 0
                          ? 'text-green-600'
                          : linha.variacao < 0
                            ? 'text-red-600'
                            : 'text-gray-400'
                      }
                    >
                      {formatarMoeda(linha.variacao, moeda)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                        !materialidade
                          ? 'text-gray-400'
                          : varPositiva
                            ? 'bg-green-50 text-green-700'
                            : varNegativa
                              ? 'bg-red-50 text-red-700'
                              : 'text-gray-400'
                      }`}
                    >
                      {formatarPercentual(linha.variacaoPercentual)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {materialidade && linha.qualitativo ? (
                      <span className="italic">{linha.qualitativo}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
