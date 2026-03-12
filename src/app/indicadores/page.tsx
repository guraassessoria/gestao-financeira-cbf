'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { IndicadorFinanceiro } from '@/types/financeiro'

const indicadoresSample: IndicadorFinanceiro[] = [
  { nome: 'Margem EBITDA', sigla: 'EBITDA%', valor: null, valor_anterior: null, unidade: '%', descricao: 'EBITDA / Receita Líquida', interpretacao: 'Indica a rentabilidade operacional antes de depreciação e amortização.' },
  { nome: 'Margem Líquida', sigla: 'ML', valor: null, valor_anterior: null, unidade: '%', descricao: 'Resultado Líquido / Receita Líquida', interpretacao: 'Representa quanto da receita se converte em lucro final.' },
  { nome: 'ROE', sigla: 'ROE', valor: null, valor_anterior: null, unidade: '%', descricao: 'Resultado Líquido / Patrimônio Líquido', interpretacao: 'Retorno sobre o patrimônio dos sócios/controladores.' },
  { nome: 'ROA', sigla: 'ROA', valor: null, valor_anterior: null, unidade: '%', descricao: 'Resultado Líquido / Ativo Total', interpretacao: 'Retorno sobre o total de ativos da entidade.' },
  { nome: 'Liquidez Corrente', sigla: 'LC', valor: null, valor_anterior: null, unidade: 'x', descricao: 'Ativo Circulante / Passivo Circulante', interpretacao: 'Capacidade de honrar obrigações de curto prazo. > 1 é saudável.' },
  { nome: 'Endividamento Geral', sigla: 'EG', valor: null, valor_anterior: null, unidade: '%', descricao: '(PC + PNC) / Ativo Total', interpretacao: 'Proporção do ativo financiada por terceiros.' },
  { nome: 'Composição do Endiv. (CP)', sigla: 'CE-CP', valor: null, valor_anterior: null, unidade: '%', descricao: 'PC / (PC + PNC)', interpretacao: 'Quanto da dívida total vence no curto prazo.' },
  { nome: 'Cobertura de Juros', sigla: 'CJ', valor: null, valor_anterior: null, unidade: 'x', descricao: 'EBIT / Despesas Financeiras', interpretacao: 'Capacidade de pagar juros com o resultado operacional. > 2 é saudável.' },
  { nome: 'Conversão Caixa Operacional', sigla: 'CFO/EBITDA', valor: null, valor_anterior: null, unidade: 'x', descricao: 'CFO / EBITDA', interpretacao: 'Qualidade do EBITDA em termos de geração de caixa real.' },
]

export default function IndicadoresPage() {
  const [ano, setAno] = useState(2025)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Indicadores Financeiros</h2>
          <p className="text-muted-foreground">KPIs para empresa de serviços — CPC/IFRS</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Exercício:</span>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2024, 2023].map((a) => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Os indicadores serão calculados automaticamente após o mapeamento das demonstrações e importação dos lançamentos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {indicadoresSample.map((ind) => (
            <Card key={ind.sigla}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{ind.nome}</CardTitle>
                  <Badge variant="outline" className="text-xs">{ind.sigla}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {ind.valor !== null ? `${ind.valor.toFixed(1)}${ind.unidade}` : '—'}
                </div>
                {ind.valor_anterior != null && (
                  <div className="text-xs text-muted-foreground">
                    Anterior: {ind.valor_anterior.toFixed(1)}{ind.unidade}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{ind.descricao}</p>
                {ind.interpretacao && (
                  <p className="text-xs text-slate-500 mt-1 border-t pt-1">{ind.interpretacao}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
