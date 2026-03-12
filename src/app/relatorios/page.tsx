'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, MessageSquare, CheckCircle } from 'lucide-react'

const perguntas = [
  { id: 'receita', label: 'Comportamento das Receitas', placeholder: 'Ex: As receitas de patrocínios cresceram X% em relação ao período anterior...' },
  { id: 'custos', label: 'Evolução dos Custos e Despesas', placeholder: 'Ex: As despesas administrativas foram impactadas principalmente por...' },
  { id: 'caixa', label: 'Geração de Caixa Operacional', placeholder: 'Ex: A geração de caixa operacional refletiu o resultado positivo do período...' },
  { id: 'endividamento', label: 'Posição de Endividamento', placeholder: 'Ex: O endividamento manteve-se estável, com melhora no prazo médio...' },
  { id: 'perspectivas', label: 'Perspectivas e Próximos Passos', placeholder: 'Ex: Para o próximo trimestre, espera-se...' },
]

export default function RelatoriosPage() {
  const [ano, setAno] = useState(2025)
  const [tipoRelatorio, setTipoRelatorio] = useState('diretoria')
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [gerado, setGerado] = useState(false)

  const handleGerar = () => {
    setGerado(true)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Semiautomáticos</h2>
          <p className="text-muted-foreground">Gerador de narrativa contábil guiada para reuniões executivas</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diretoria">Reunião de Diretoria</SelectItem>
              <SelectItem value="notas">Notas Explicativas</SelectItem>
              <SelectItem value="executivo">Sumário Executivo</SelectItem>
            </SelectContent>
          </Select>
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
          <Badge variant="outline">Workflow: revisão humana obrigatória</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Perguntas Guiadas
            </CardTitle>
            <CardDescription>
              Responda as perguntas abaixo para gerar a narrativa do relatório. Todos os textos passarão por aprovação antes da emissão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {perguntas.map((p) => (
              <div key={p.id} className="space-y-1">
                <label className="text-sm font-medium">{p.label}</label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-y"
                  placeholder={p.placeholder}
                  value={respostas[p.id] || ''}
                  onChange={(e) =>
                    setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleGerar}>Gerar Rascunho</Button>
              <Button variant="outline">Salvar Rascunho</Button>
            </div>
          </CardContent>
        </Card>

        {gerado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rascunho Gerado
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">Aguardando Aprovação</Badge>
                <span>Revisão humana obrigatória antes da emissão</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 border rounded-md p-4 space-y-3 text-sm">
                <p className="font-semibold text-base">
                  Relatório para {tipoRelatorio === 'diretoria' ? 'Reunião de Diretoria' : tipoRelatorio === 'notas' ? 'Notas Explicativas' : 'Sumário Executivo'} — Exercício {ano}
                </p>
                {perguntas.map((p) => respostas[p.id] ? (
                  <div key={p.id}>
                    <p className="font-medium">{p.label}</p>
                    <p className="text-muted-foreground mt-1">{respostas[p.id]}</p>
                  </div>
                ) : null)}
                {Object.keys(respostas).length === 0 && (
                  <p className="text-muted-foreground italic">Nenhuma narrativa preenchida ainda.</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">Enviar para Aprovação</Button>
                <Button variant="outline" size="sm">Exportar PDF</Button>
                <Button variant="outline" size="sm">Exportar Word</Button>
              </div>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <CheckCircle className="inline h-3 w-3 mr-1" />
                Este relatório requer aprovação do Contador ou Presidente antes de ser emitido oficialmente.
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
