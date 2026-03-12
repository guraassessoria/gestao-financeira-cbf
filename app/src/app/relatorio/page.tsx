'use client'

import { useState } from 'react'
import type { Demonstracao, VisaoTemporal, Moeda } from '@/types'
import { FileText, Download, CheckCircle } from 'lucide-react'

interface PerguntaNarrativa {
  id: string
  pergunta: string
  resposta: string
  placeholder: string
}

const perguntasBase: PerguntaNarrativa[] = [
  {
    id: 'resultado_geral',
    pergunta: 'Como foi o desempenho financeiro geral do período?',
    resposta: '',
    placeholder:
      'Ex: O exercício apresentou crescimento de receita impulsionado por...',
  },
  {
    id: 'receita',
    pergunta: 'Quais foram os principais fatores que impactaram a receita?',
    resposta: '',
    placeholder: 'Ex: O aumento na arrecadação de direitos de transmissão...',
  },
  {
    id: 'custos_despesas',
    pergunta: 'Como evoluíram os custos e despesas operacionais?',
    resposta: '',
    placeholder: 'Ex: As despesas com competições aumentaram devido a...',
  },
  {
    id: 'ebitda',
    pergunta: 'O que explica a variação do EBITDA e margem EBITDA?',
    resposta: '',
    placeholder: 'Ex: A margem EBITDA refletiu o aumento de investimentos em...',
  },
  {
    id: 'caixa',
    pergunta: 'Qual é a situação do fluxo de caixa e liquidez da entidade?',
    resposta: '',
    placeholder:
      'Ex: O caixa operacional manteve-se positivo, sustentado por...',
  },
  {
    id: 'endividamento',
    pergunta: 'Como está o perfil de endividamento e composição das dívidas?',
    resposta: '',
    placeholder: 'Ex: O endividamento manteve-se controlado com...',
  },
  {
    id: 'perspectivas',
    pergunta: 'Quais são as perspectivas e principais riscos para o próximo período?',
    resposta: '',
    placeholder: 'Ex: Para o próximo exercício, espera-se crescimento em...',
  },
]

export default function RelatorioPage() {
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [anoComparativo, setAnoComparativo] = useState(anoAtual - 1)
  const [visao, setVisao] = useState<VisaoTemporal>('anual')
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [tipoRelatorio, setTipoRelatorio] = useState<Demonstracao | 'EXECUTIVO'>('EXECUTIVO')
  const [perguntas, setPerguntas] = useState<PerguntaNarrativa[]>(perguntasBase)
  const [gerando, setGerando] = useState(false)
  const [relatorioGerado, setRelatorioGerado] = useState(false)
  const [narrativaFinal, setNarrativaFinal] = useState<string>('')

  function atualizarResposta(id: string, resposta: string) {
    setPerguntas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, resposta } : p))
    )
  }

  async function gerarRelatorio() {
    setGerando(true)
    try {
      const res = await fetch('/api/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoRelatorio,
          ano,
          anoComparativo,
          visao,
          moeda,
          perguntas: perguntas.reduce(
            (acc, p) => ({ ...acc, [p.id]: p.resposta }),
            {} as Record<string, string>
          ),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setNarrativaFinal(data.narrativa ?? '')
      setRelatorioGerado(true)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao gerar relatório')
    } finally {
      setGerando(false)
    }
  }

  const tiposRelatorio: { value: Demonstracao | 'EXECUTIVO'; label: string }[] = [
    { value: 'EXECUTIVO', label: 'Relatório Executivo Completo' },
    { value: 'DRE', label: 'DRE — Análise de Resultado' },
    { value: 'BP', label: 'BP — Análise Patrimonial' },
    { value: 'DFC', label: 'DFC — Análise de Caixa' },
    { value: 'DRA', label: 'DRA — Resultado Abrangente' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Gerador de Relatórios
        </h1>
        <p className="text-sm text-gray-500">
          Narrativa contábil semi-automática · Workflow de aprovação obrigatório
        </p>
      </div>

      {!relatorioGerado ? (
        <div className="space-y-6">
          {/* Configuração */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              1. Configuração do Relatório
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tipo
                </label>
                <select
                  value={tipoRelatorio}
                  onChange={(e) =>
                    setTipoRelatorio(e.target.value as Demonstracao | 'EXECUTIVO')
                  }
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {tiposRelatorio.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Ano Base
                </label>
                <select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[anoAtual, anoAtual - 1, anoAtual - 2].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Comparativo
                </label>
                <select
                  value={anoComparativo}
                  onChange={(e) => setAnoComparativo(Number(e.target.value))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[anoAtual, anoAtual - 1, anoAtual - 2].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Visão
                </label>
                <select
                  value={visao}
                  onChange={(e) => setVisao(e.target.value as VisaoTemporal)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="anual">Anual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Moeda
                </label>
                <select
                  value={moeda}
                  onChange={(e) => setMoeda(e.target.value as Moeda)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Perguntas guiadas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              2. Narrativa Contábil Guiada
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Responda as perguntas abaixo para compor a narrativa do relatório.
              Os campos em branco serão preenchidos com análise quantitativa automática.
            </p>
            <div className="space-y-4">
              {perguntas.map((p) => (
                <div key={p.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {p.pergunta}
                  </label>
                  <textarea
                    value={p.resposta}
                    onChange={(e) => atualizarResposta(p.id, e.target.value)}
                    placeholder={p.placeholder}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aviso de workflow */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <strong>Workflow de aprovação:</strong> O relatório gerado entrará em status
            &quot;Revisão&quot; e precisará ser aprovado por um usuário autorizado antes da emissão.
          </div>

          {/* Botão gerar */}
          <div className="flex justify-end">
            <button
              onClick={gerarRelatorio}
              disabled={gerando}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {gerando ? 'Gerando relatório...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      ) : (
        /* Relatório gerado */
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-700 font-medium">
              Relatório gerado com sucesso — Status: Revisão (aguardando aprovação)
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Relatório: {tiposRelatorio.find((t) => t.value === tipoRelatorio)?.label}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRelatorioGerado(false)
                    setNarrativaFinal('')
                  }}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar PDF
                </button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {narrativaFinal || 'Narrativa vazia. Preencha as perguntas e gere novamente.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
