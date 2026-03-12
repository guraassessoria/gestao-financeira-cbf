'use client'

import { useState, useEffect } from 'react'
import FiltroPainel from '@/components/dashboard/FiltroPainel'
import TabelaDemonstracao from '@/components/dashboard/TabelaDemonstracao'
import GraficoEvolucao from '@/components/charts/GraficoEvolucao'
import type { LinhaFinanceira, VisaoTemporal, Moeda } from '@/types'

export default function DrePage() {
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [anoComparativo, setAnoComparativo] = useState(anoAtual - 1)
  const [visao, setVisao] = useState<VisaoTemporal>('anual')
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [linhas, setLinhas] = useState<LinhaFinanceira[]>([])
  const [graficoDados, setGraficoDados] = useState<
    { periodo: string; atual: number; anterior: number }[]
  >([])
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
        demonstracao: 'DRE',
        ano: String(params.ano),
        anoComparativo: String(params.anoComparativo),
        visao: params.visao,
        moeda: params.moeda,
      })
      const res = await fetch(`/api/lancamentos?${qs}`)
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg)
      }
      const data = await res.json()
      setLinhas(data.linhas ?? [])
      setGraficoDados(data.grafico ?? [])
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

  function handleFiltroChange(filtro: {
    ano: number
    anoComparativo: number
    visao: VisaoTemporal
    moeda: Moeda
  }) {
    setAno(filtro.ano)
    setAnoComparativo(filtro.anoComparativo)
    setVisao(filtro.visao)
    setMoeda(filtro.moeda)
    carregarDados(filtro)
  }

  const periodoAtual =
    visao === 'anual' ? String(ano) : `${ano}`
  const periodoAnterior =
    visao === 'anual' ? String(anoComparativo) : `${anoComparativo}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          DRE — Demonstração do Resultado do Exercício
        </h1>
        <p className="text-sm text-gray-500">
          Estrutura CPC/IFRS · Mapeamento via De-Para Protheus · Visão{' '}
          {visao === 'mensal' ? 'Mensal' : visao === 'trimestral' ? 'Trimestral' : 'Anual'}
        </p>
      </div>

      <div className="mb-5">
        <FiltroPainel
          ano={ano}
          anoComparativo={anoComparativo}
          visao={visao}
          moeda={moeda}
          anosDisponiveis={anosDisponiveis}
          onChange={handleFiltroChange}
        />
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {erro}
        </div>
      )}

      {graficoDados.length > 0 && (
        <div className="mb-5">
          <GraficoEvolucao
            dados={graficoDados}
            tipo="barra"
            titulo="Receita Líquida vs Lucro Líquido"
            labelAtual={`Receita ${ano}`}
            labelAnterior={`Receita ${anoComparativo}`}
            moeda={moeda}
          />
        </div>
      )}

      <TabelaDemonstracao
        linhas={linhas}
        moeda={moeda}
        titulo="Demonstração do Resultado"
        periodoAtual={periodoAtual}
        periodoAnterior={periodoAnterior}
        carregando={carregando}
      />
    </div>
  )
}
