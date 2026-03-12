'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const mapeamentoStatus = [
  { demo: 'DRE', secao: 'RECEITAS', status: 'aprovado', regra: 'De_Para' },
  { demo: 'BP', secao: 'ATIVO Circulante', status: 'pendente', regra: 'faixa' },
  { demo: 'BP', secao: 'ATIVO Não Circulante', status: 'pendente', regra: 'faixa' },
  { demo: 'BP', secao: 'PASSIVO Circulante', status: 'pendente', regra: 'faixa' },
  { demo: 'BP', secao: 'PASSIVO Não Circulante', status: 'pendente', regra: 'faixa' },
  { demo: 'BP', secao: 'PATRIMÔNIO LÍQUIDO', status: 'pendente', regra: 'faixa' },
  { demo: 'DFC', secao: 'OPERACIONAL', status: 'pendente', regra: 'regra' },
  { demo: 'DFC', secao: 'INVESTIMENTO', status: 'pendente', regra: 'regra' },
  { demo: 'DFC', secao: 'FINANCIAMENTO', status: 'pendente', regra: 'regra' },
  { demo: 'DRA', secao: 'OCI', status: 'pendente', regra: 'regra' },
]

export default function ConfiguracoesPage() {
  const [taxaUSD, setTaxaUSD] = useState('')
  const [dataCorte, setDataCorte] = useState('')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Mapeamento contábil, câmbio e governança</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mapeamento Contábil</CardTitle>
            <CardDescription>
              Status do mapeamento de contas para cada demonstração financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demonstração</TableHead>
                  <TableHead>Seção</TableHead>
                  <TableHead>Regra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mapeamentoStatus.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell><Badge variant="outline">{m.demo}</Badge></TableCell>
                    <TableCell className="text-sm">{m.secao}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.regra}</TableCell>
                    <TableCell>
                      <Badge
                        className={m.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                      >
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" disabled={m.status === 'aprovado'}>
                        Configurar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Política de Câmbio BRL/USD</CardTitle>
            <CardDescription>
              Configure a taxa de câmbio para conversão das demonstrações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxa">Taxa BRL/USD (R$ por US$)</Label>
                <Input
                  id="taxa"
                  type="number"
                  step="0.0001"
                  placeholder="Ex: 5.9800"
                  value={taxaUSD}
                  onChange={(e) => setTaxaUSD(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataCorte">Data de Corte</Label>
                <Input
                  id="dataCorte"
                  type="date"
                  value={dataCorte}
                  onChange={(e) => setDataCorte(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Salvar Taxa</Button>
              <Button variant="outline" size="sm">Histórico de Taxas</Button>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              Fonte recomendada: Banco Central do Brasil (PTAX de fechamento). A taxa registrada ficará associada à versão do fechamento.
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Regra de Materialidade</CardTitle>
            <CardDescription>
              Define o limiar para destacar variações expressivas no texto qualitativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Variação Percentual Mínima (%)</Label>
                <Input type="number" placeholder="Ex: 10" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Valor Absoluto Mínimo (R$)</Label>
                <Input type="number" placeholder="Ex: 100000" defaultValue="100000" />
              </div>
            </div>
            <Button size="sm">Salvar Regra</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfis de Aprovação</CardTitle>
            <CardDescription>
              Usuários com permissão de aprovação de fechamento e emissão de relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { perfil: 'Contador', permissao: 'Revisão de mapeamento, aprovação de lançamentos' },
                { perfil: 'Auditor', permissao: 'Visualização irrestrita, trilha de auditoria' },
                { perfil: 'Diretor', permissao: 'Aprovação de relatórios, visualização de indicadores' },
                { perfil: 'Presidente', permissao: 'Aprovação final, emissão de relatórios oficiais' },
              ].map((p) => (
                <div key={p.perfil} className="flex items-start gap-3 p-3 border rounded-md">
                  <Badge variant="secondary" className="flex-shrink-0">{p.perfil}</Badge>
                  <p className="text-sm text-muted-foreground">{p.permissao}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              A gestão de usuários é realizada via painel do Supabase (Authentication → Users).
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
