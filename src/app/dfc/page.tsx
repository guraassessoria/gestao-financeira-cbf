'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PeriodoSelector } from '@/components/financeiro/PeriodoSelector'
import { TabelaFinanceira } from '@/components/financeiro/TabelaFinanceira'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PeriodoTipo, Moeda, LinhaFinanceira } from '@/types/financeiro'

const dfcLinhasSample: LinhaFinanceira[] = [
  {
    codigo: 'OP', descricao: 'ATIVIDADES OPERACIONAIS', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'OP01', descricao: 'Resultado líquido do exercício', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'OP02', descricao: '(+) Depreciação e Amortização', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'OP03', descricao: 'Variação em contas a receber', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'OP04', descricao: 'Variação em fornecedores', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'OP05', descricao: 'Variação em outras contas', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'CFO', descricao: 'CAIXA GERADO NAS OPERAÇÕES (CFO)', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  {
    codigo: 'INV', descricao: 'ATIVIDADES DE INVESTIMENTO', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'INV01', descricao: 'Aquisição de imobilizado', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'INV02', descricao: 'Alienação de ativos', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'CFI', descricao: 'CAIXA GERADO NOS INVESTIMENTOS (CFI)', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  {
    codigo: 'FIN', descricao: 'ATIVIDADES DE FINANCIAMENTO', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'FIN01', descricao: 'Captação de empréstimos', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'FIN02', descricao: 'Pagamento de empréstimos', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'CFF', descricao: 'CAIXA GERADO NOS FINANCIAMENTOS (CFF)', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'VCX', descricao: 'VARIAÇÃO LÍQUIDA DO CAIXA', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'CXI', descricao: 'CAIXA INICIAL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'CXF', descricao: 'CAIXA FINAL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
]

export default function DfcPage() {
  const [ano, setAno] = useState(2025)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [trimestre, setTrimestre] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoTipo>('anual')
  const [moeda, setMoeda] = useState<Moeda>('BRL')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DFC — Demonstração de Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Método Indireto — Comparativo: exercício selecionado vs. anterior</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodoSelector
            ano={ano} mes={mes} trimestre={trimestre} periodo={periodo}
            onAnoChange={setAno} onMesChange={setMes}
            onTrimestreChange={setTrimestre} onPeriodoChange={setPeriodo}
          />
          <Select value={moeda} onValueChange={(v) => setMoeda(v as Moeda)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa — Método Indireto</CardTitle>
            <CardDescription>
              {periodo === 'anual' ? `${ano} vs ${ano - 1}` : `${mes}/${ano}`}
              {moeda === 'USD' && ' — valores convertidos para USD'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Configure o mapeamento DFC (método indireto) na página de Configurações para visualizar os dados reais.
              </p>
            </div>
            <TabelaFinanceira linhas={dfcLinhasSample} moeda={moeda} titulo="Fluxo de Caixa" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
