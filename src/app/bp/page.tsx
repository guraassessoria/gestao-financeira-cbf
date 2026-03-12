'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PeriodoSelector } from '@/components/financeiro/PeriodoSelector'
import { TabelaFinanceira } from '@/components/financeiro/TabelaFinanceira'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PeriodoTipo, Moeda, LinhaFinanceira } from '@/types/financeiro'

const bpAtivoSample: LinhaFinanceira[] = [
  {
    codigo: 'AC', descricao: 'ATIVO CIRCULANTE', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'AC01', descricao: 'Caixa e Equivalentes de Caixa', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'AC02', descricao: 'Contas a Receber', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'AC03', descricao: 'Outros Ativos Circulantes', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  {
    codigo: 'ANC', descricao: 'ATIVO NÃO CIRCULANTE', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'ANC01', descricao: 'Imobilizado', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'ANC02', descricao: 'Intangível', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'AT', descricao: 'TOTAL DO ATIVO', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
]

const bpPassivoSample: LinhaFinanceira[] = [
  {
    codigo: 'PC', descricao: 'PASSIVO CIRCULANTE', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'PC01', descricao: 'Fornecedores', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'PC02', descricao: 'Obrigações Trabalhistas', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'PC03', descricao: 'Outros Passivos Circulantes', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'PNC', descricao: 'PASSIVO NÃO CIRCULANTE', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  {
    codigo: 'PL', descricao: 'PATRIMÔNIO LÍQUIDO', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'PL01', descricao: 'Capital Social', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'PL02', descricao: 'Reservas', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'PL03', descricao: 'Resultados Acumulados', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'PT', descricao: 'TOTAL PASSIVO + PL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
]

export default function BpPage() {
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
          <h2 className="text-2xl font-bold tracking-tight">BP — Balanço Patrimonial</h2>
          <p className="text-muted-foreground">Comparativo: exercício selecionado vs. anterior</p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ativo</CardTitle>
              <CardDescription>{periodo === 'anual' ? `${ano} vs ${ano - 1}` : `${mes}/${ano}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  Mapeamento de contas pendente. Configure as faixas contábeis na página de Configurações.
                </p>
              </div>
              <TabelaFinanceira linhas={bpAtivoSample} moeda={moeda} titulo="Ativo" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passivo e Patrimônio Líquido</CardTitle>
              <CardDescription>{periodo === 'anual' ? `${ano} vs ${ano - 1}` : `${mes}/${ano}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <TabelaFinanceira linhas={bpPassivoSample} moeda={moeda} titulo="Passivo + PL" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
