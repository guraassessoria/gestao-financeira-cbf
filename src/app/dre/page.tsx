'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PeriodoSelector } from '@/components/financeiro/PeriodoSelector'
import { TabelaFinanceira } from '@/components/financeiro/TabelaFinanceira'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PeriodoTipo, Moeda, LinhaFinanceira } from '@/types/financeiro'

const dreLinhasSample: LinhaFinanceira[] = [
  {
    codigo: 'RB', descricao: 'RECEITA BRUTA', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'RB01', descricao: 'Receitas de Filiadas', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'RB02', descricao: 'Receitas de Patrocínios', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'RB03', descricao: 'Receitas de Transmissão', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'RB04', descricao: 'Receitas de Competições', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'DED', descricao: 'DEDUÇÕES DA RECEITA', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'RL', descricao: 'RECEITA LÍQUIDA', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  {
    codigo: 'CPV', descricao: 'CUSTOS E DESPESAS OPERACIONAIS', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'CPV01', descricao: 'Despesas com Pessoal', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'CPV02', descricao: 'Despesas Administrativas', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
      { codigo: 'CPV03', descricao: 'Despesas com Competições', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'EBITDA', descricao: 'EBITDA', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'DA', descricao: 'DEPRECIAÇÃO E AMORTIZAÇÃO', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'EBIT', descricao: 'RESULTADO OPERACIONAL (EBIT)', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'RF', descricao: 'RESULTADO FINANCEIRO', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'RAI', descricao: 'RESULTADO ANTES DO IR/CSLL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'IRCSLL', descricao: 'IR/CSLL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'LL', descricao: 'RESULTADO LÍQUIDO DO EXERCÍCIO', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
]

export default function DrePage() {
  const [ano, setAno] = useState(2025)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [trimestre, setTrimestre] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoTipo>('mensal')
  const [moeda, setMoeda] = useState<Moeda>('BRL')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DRE — Demonstração do Resultado</h2>
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

        <Card>
          <CardHeader>
            <CardTitle>Resultado do Exercício</CardTitle>
            <CardDescription>
              {periodo === 'mensal' && `${mes}/${ano} vs ${mes}/${ano - 1}`}
              {periodo === 'trimestral' && `${trimestre}º Trimestre ${ano} vs ${ano - 1}`}
              {periodo === 'anual' && `${ano} vs ${ano - 1}`}
              {moeda === 'USD' && ' — valores convertidos para USD'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Importe os lançamentos CT2 e configure o mapeamento De_Para para visualizar a DRE real.
              </p>
            </div>
            <TabelaFinanceira linhas={dreLinhasSample} moeda={moeda} titulo="Demonstração do Resultado" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
