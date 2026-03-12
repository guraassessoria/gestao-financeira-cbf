'use client'

import { useState, useEffect } from 'react'
import CardIndicador from '@/components/dashboard/CardIndicador'
import FiltroPainel from '@/components/dashboard/FiltroPainel'
import type { IndicadorFinanceiro, VisaoTemporal, Moeda } from '@/types'

export default function IndicadoresPage() {
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [anoComparativo, setAnoComparativo] = useState(anoAtual - 1)
  const [visao, setVisao] = useState<VisaoTemporal>('anual')
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [indicadores, setIndicadores] = useState<IndicadorFinanceiro[]>([])
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
        ano: String(params.ano),
        anoComparativo: String(params.anoComparativo),
        visao: params.visao,
        moeda: params.moeda,
      })
      const res = await fetch(`/api/indicadores?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setIndicadores(data.indicadores ?? [])
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
          Indicadores Financeiros
        </h1>
        <p className="text-sm text-gray-500">
          Margem EBITDA, Liquidez, Endividamento, ROE, ROA e Cobertura de Juros
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

      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : indicadores.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Nenhum dado disponível para o período selecionado.
          <br />
          Carregue os lançamentos contábeis para calcular os indicadores.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicadores.map((ind) => (
            <CardIndicador key={ind.codigo} indicador={ind} />
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
        <strong>Metodologia:</strong> Indicadores calculados com base em CPC/IFRS para empresa de serviços.
        Materialidade: variações acima de 5% são destacadas com análise qualitativa.
        Os valores dependem do mapeamento completo de BP e DRE.
      </div>
    </div>
  )
}
