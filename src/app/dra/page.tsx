'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PeriodoSelector } from '@/components/financeiro/PeriodoSelector'
import { TabelaFinanceira } from '@/components/financeiro/TabelaFinanceira'
import type { PeriodoTipo, LinhaFinanceira } from '@/types/financeiro'

const draLinhasSample: LinhaFinanceira[] = [
  { codigo: 'PL_INI', descricao: 'PATRIMÔNIO LÍQUIDO INICIAL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'AJUST', descricao: 'AJUSTES DE EXERCÍCIOS ANTERIORES', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'RL', descricao: 'RESULTADO LÍQUIDO DO EXERCÍCIO', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  {
    codigo: 'OCI', descricao: 'OUTROS RESULTADOS ABRANGENTES (OCI)', valor_atual: 0, valor_anterior: 0,
    variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica',
    filho: [
      { codigo: 'OCI01', descricao: 'Componentes OCI (a definir)', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 1, tipo: 'analitica' },
    ]
  },
  { codigo: 'RA', descricao: 'RESULTADO ABRANGENTE TOTAL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
  { codigo: 'PL_FIM', descricao: 'PATRIMÔNIO LÍQUIDO FINAL', valor_atual: 0, valor_anterior: 0, variacao_absoluta: 0, variacao_percentual: null, nivel: 0, tipo: 'sintetica' },
]

export default function DraPage() {
  const [ano, setAno] = useState(2025)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [trimestre, setTrimestre] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoTipo>('anual')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DRA — Demonstração do Resultado Abrangente</h2>
          <p className="text-muted-foreground">Comparativo: exercício selecionado vs. anterior</p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Definições pendentes:</strong> Os componentes de Outros Resultados Abrangentes (OCI) ainda não foram definidos pela Contabilidade. A DRA será finalizada após essa definição.
          </p>
        </div>

        <PeriodoSelector
          ano={ano} mes={mes} trimestre={trimestre} periodo={periodo}
          onAnoChange={setAno} onMesChange={setMes}
          onTrimestreChange={setTrimestre} onPeriodoChange={setPeriodo}
        />

        <Card>
          <CardHeader>
            <CardTitle>Resultado Abrangente</CardTitle>
            <CardDescription>{periodo === 'anual' ? `${ano} vs ${ano - 1}` : `${mes}/${ano}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <TabelaFinanceira linhas={draLinhasSample} moeda="BRL" titulo="DRA" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
