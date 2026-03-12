'use client'

import { useState, useEffect } from 'react'
import FiltroPainel from '@/components/dashboard/FiltroPainel'
import TabelaDemonstracao from '@/components/dashboard/TabelaDemonstracao'
import type { LinhaFinanceira, VisaoTemporal, Moeda } from '@/types'

export default function DfcPage() {
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [anoComparativo, setAnoComparativo] = useState(anoAtual - 1)
  const [visao, setVisao] = useState<VisaoTemporal>('anual')
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [linhas, setLinhas] = useState<LinhaFinanceira[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const anosDisponiveis = [anoAtual, anoAtual - 1, anoAtual - 2]

  async function carregarDados(params: {
    ano: number
    anoComparativo: number
    visao: VisaoTemporal
    moeda: Moeda
  }) {
    setCarregando(true)
    setErro(null)
    try {
      const qs = new URLSearchParams({
        demonstracao: 'DFC',
        ano: String(params.ano),
        anoComparativo: String(params.anoComparativo),
        visao: params.visao,
        moeda: params.moeda,
      })
      const res = await fetch(`/api/lancamentos?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setLinhas(data.linhas ?? [])
      if (data.aviso) {
        setErro(data.aviso)
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Erro desconhecido'
      // Try to extract a human-readable message from JSON error responses
      try {
        const parsed = JSON.parse(errMsg)
        setErro(parsed.erro ?? parsed.aviso ?? errMsg)
      } catch {
        setErro(errMsg)
      }
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados({ ano, anoComparativo, visao, moeda })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          DFC — Demonstração do Fluxo de Caixa
        </h1>
        <p className="text-sm text-gray-500">
          Método Indireto · CPC 03 / IAS 7 · Mapeamento pendente
        </p>
      </div>

      <div className="mb-5">
        <FiltroPainel
          ano={ano}
          anoComparativo={anoComparativo}
          visao={visao}
          moeda={moeda}
          anosDisponiveis={anosDisponiveis}
          onChange={(f) => {
            setAno(f.ano)
            setAnoComparativo(f.anoComparativo)
            setVisao(f.visao)
            setMoeda(f.moeda)
            carregarDados(f)
          }}
        />
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
        ⚠️ Mapeamento de contas DFC pendente de aprovação. Os valores serão zerados até conclusão do De-Para.
      </div>

      <TabelaDemonstracao
        linhas={linhas}
        moeda={moeda}
        titulo="Demonstração do Fluxo de Caixa — Método Indireto"
        periodoAtual={String(ano)}
        periodoAnterior={String(anoComparativo)}
        carregando={carregando}
      />
    </div>
  )
}
