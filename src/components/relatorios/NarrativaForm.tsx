'use client'

import { useState } from 'react'
import { Demonstracao } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NarrativaFormProps {
  demonstracao: Demonstracao
  periodo: string
}

const QUESTIONS: Record<Demonstracao, { id: string; label: string; placeholder: string }[]> = {
  DRE: [
    { id: 'receitas', label: 'Como se comportaram as receitas no período?', placeholder: 'Ex: As receitas cresceram X% devido a...' },
    { id: 'despesas', label: 'Quais foram os principais itens de despesa?', placeholder: 'Ex: As despesas com pessoal aumentaram X% em razão de...' },
    { id: 'resultado', label: 'Qual foi o resultado e como compara ao período anterior?', placeholder: 'Ex: O superávit foi de R$X, representando crescimento de...' },
  ],
  BP: [
    { id: 'ativo', label: 'Como evoluiu a composição do ativo?', placeholder: 'Ex: O ativo circulante cresceu X% por conta de...' },
    { id: 'passivo', label: 'Como está a estrutura de financiamento?', placeholder: 'Ex: O endividamento de longo prazo representa...' },
    { id: 'pl', label: 'Como evoluiu o patrimônio líquido?', placeholder: 'Ex: O PL aumentou X% refletindo...' },
  ],
  DFC: [
    { id: 'operacional', label: 'Como foi a geração de caixa operacional?', placeholder: 'Ex: O FCO foi de R$X, impactado por...' },
    { id: 'investimento', label: 'Quais foram os principais investimentos?', placeholder: 'Ex: Foram investidos R$X em...' },
    { id: 'financiamento', label: 'Como foi o fluxo de financiamento?', placeholder: 'Ex: As captações líquidas foram de...' },
  ],
  DRA: [
    { id: 'resultado_liquido', label: 'Qual foi o resultado líquido do exercício?', placeholder: 'Ex: O superávit líquido foi de R$X...' },
    { id: 'oci', label: 'Quais foram os outros resultados abrangentes?', placeholder: 'Ex: Os ajustes de avaliação patrimonial impactaram...' },
  ],
}

type Status = 'rascunho' | 'revisao' | 'aprovado'

export default function NarrativaForm({ demonstracao, periodo }: NarrativaFormProps) {
  const questions = QUESTIONS[demonstracao] ?? []
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('rascunho')
  const [textoGerado, setTextoGerado] = useState('')

  function handleChange(id: string, value: string) {
    setRespostas((prev) => ({ ...prev, [id]: value }))
  }

  function gerarNarrativa() {
    const partes = questions
      .filter((q) => respostas[q.id]?.trim())
      .map((q) => respostas[q.id].trim())
    const texto = partes.join(' ')
    setTextoGerado(texto || 'Preencha os campos acima para gerar a narrativa.')
  }

  const statusColors: Record<Status, string> = {
    rascunho: 'bg-gray-100 text-gray-700',
    revisao: 'bg-amber-100 text-amber-800',
    aprovado: 'bg-green-100 text-green-800',
  }

  const statusLabels: Record<Status, string> = {
    rascunho: 'Rascunho',
    revisao: 'Em Revisão',
    aprovado: 'Aprovado',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{demonstracao} — {periodo}</h3>
          <p className="text-sm text-gray-500">Guia de narrativa para análise financeira</p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', statusColors[status])}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{q.label}</label>
            <textarea
              value={respostas[q.id] ?? ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cbf-green resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={gerarNarrativa}
        className="px-4 py-2 bg-cbf-navy text-white rounded-lg text-sm font-medium hover:bg-cbf-navy-light transition-colors"
      >
        Gerar Narrativa
      </button>

      {/* Preview */}
      {textoGerado && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Prévia da Narrativa</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{textoGerado}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          onClick={() => setStatus('rascunho')}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Salvar Rascunho
        </button>
        <button
          onClick={() => setStatus('revisao')}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          Enviar para Revisão
        </button>
        <button
          onClick={() => setStatus('aprovado')}
          className="px-4 py-2 bg-cbf-green text-white rounded-lg text-sm font-medium hover:bg-cbf-green-dark transition-colors"
        >
          Aprovar
        </button>
      </div>
    </div>
  )
}
