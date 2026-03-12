'use client'

import { useState } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import NarrativaForm from '@/components/relatorios/NarrativaForm'
import { Demonstracao, Moeda } from '@/lib/types'
import { cn } from '@/lib/utils'

const DEMONSTRACOES: { id: Demonstracao; label: string; desc: string }[] = [
  { id: 'DRE', label: 'DRE', desc: 'Demonstração do Resultado' },
  { id: 'BP', label: 'BP', desc: 'Balanço Patrimonial' },
  { id: 'DFC', label: 'DFC', desc: 'Fluxo de Caixa' },
  { id: 'DRA', label: 'DRA', desc: 'Resultado Abrangente' },
]

const ANOS = [2025, 2024, 2023]

export default function RelatoriosPage() {
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [demonstracao, setDemonstracao] = useState<Demonstracao>('DRE')
  const [ano, setAno] = useState(2025)

  const periodo = `Exercício ${ano}`

  return (
    <PageWrapper titulo="Relatórios — Gerador de Narrativa" moeda={moeda} onMoedaChange={setMoeda}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Configurações do Relatório</h2>
          <div className="flex flex-wrap gap-4">
            {/* Demonstracao selector */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Demonstração</label>
              <div className="flex gap-2">
                {DEMONSTRACOES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDemonstracao(d.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                      demonstracao === d.id
                        ? 'bg-cbf-navy text-white border-cbf-navy'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-cbf-navy hover:text-cbf-navy'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Exercício</label>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cbf-green"
              >
                {ANOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <NarrativaForm demonstracao={demonstracao} periodo={periodo} />
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Instruções de Uso</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
            <li>Selecione a demonstração financeira e o exercício desejado</li>
            <li>Preencha os campos com as análises qualitativas de cada seção</li>
            <li>Clique em &quot;Gerar Narrativa&quot; para visualizar o texto consolidado</li>
            <li>Use &quot;Salvar Rascunho&quot; para preservar sem finalizar</li>
            <li>Envie para revisão do gestor antes de aprovar</li>
            <li>Após aprovação, o relatório fica disponível para exportação</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  )
}
