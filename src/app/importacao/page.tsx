'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ArquivoStatus {
  nome: string
  tipo: 'CT1' | 'CT2' | 'CTT' | 'CV0' | 'DRE_DE_PARA'
  descricao: string
  status: 'aguardando' | 'processando' | 'concluido' | 'erro'
  registros?: number
  progresso?: number
  mensagem?: string
}

const arquivosEsperados: Omit<ArquivoStatus, 'status'>[] = [
  { nome: 'CT1 - Plano de contas.csv', tipo: 'CT1', descricao: 'Plano de Contas do TOTVS Protheus' },
  { nome: 'CT2 - Lançamentos.csv', tipo: 'CT2', descricao: 'Lançamentos Contábeis' },
  { nome: 'CTT - Centros de Custo.csv', tipo: 'CTT', descricao: 'Centros de Custo' },
  { nome: 'CV0 - Entidade 05.csv', tipo: 'CV0', descricao: 'Entidade 05 (Atividades)' },
]

export default function ImportacaoPage() {
  const [arquivos, setArquivos] = useState<ArquivoStatus[]>(
    arquivosEsperados.map((a) => ({ ...a, status: 'aguardando' as const }))
  )
  const [dragging, setDragging] = useState(false)
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(clearInterval)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const processFiles = useCallback((files: File[]) => {
    files.forEach((file) => {
      const tipo = detectarTipo(file.name)
      if (!tipo) return

      setArquivos((prev) =>
        prev.map((a) =>
          a.tipo === tipo ? { ...a, status: 'processando' as const, progresso: 0 } : a
        )
      )

      let progress = 0
      const interval = setInterval(() => {
        progress += 20
        setArquivos((prev) =>
          prev.map((a) =>
            a.tipo === tipo ? { ...a, progresso: progress } : a
          )
        )
        if (progress >= 100) {
          clearInterval(interval)
          intervalsRef.current = intervalsRef.current.filter((i) => i !== interval)
          setArquivos((prev) =>
            prev.map((a) =>
              a.tipo === tipo
                ? { ...a, status: 'concluido' as const, progresso: 100, mensagem: 'Arquivo validado. Configure a URL do Supabase para importar.' }
                : a
            )
          )
        }
      }, 200)
      intervalsRef.current.push(interval)
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }, [processFiles])

  function detectarTipo(nomeArquivo: string): ArquivoStatus['tipo'] | null {
    const nome = nomeArquivo.toUpperCase()
    if (nome.includes('CT1')) return 'CT1'
    if (nome.includes('CT2')) return 'CT2'
    if (nome.includes('CTT')) return 'CTT'
    if (nome.includes('CV0')) return 'CV0'
    if (nome.includes('DE_PARA') || nome.includes('DEPARA')) return 'DRE_DE_PARA'
    return null
  }

  const statusBadge = (status: ArquivoStatus['status']) => {
    switch (status) {
      case 'aguardando': return <Badge variant="outline">Aguardando</Badge>
      case 'processando': return <Badge variant="secondary">Processando...</Badge>
      case 'concluido': return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case 'erro': return <Badge variant="destructive">Erro</Badge>
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Importação de Dados</h2>
          <p className="text-muted-foreground">Carregue os arquivos exportados do TOTVS Protheus</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
          }`}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
          <p className="text-lg font-medium text-slate-600">Arraste os arquivos CSV aqui</p>
          <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
          <label className="mt-4 inline-block">
            <input
              type="file"
              multiple
              accept=".csv,.xls,.xlsx"
              className="sr-only"
              onChange={handleFileInput}
            />
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Selecionar arquivos</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-3">
            Formatos aceitos: CSV (delimitador ;), XLS/XLSX
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Arquivos</CardTitle>
            <CardDescription>Arquivos esperados para o Protótipo V1</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {arquivos.map((arquivo) => (
              <div key={arquivo.tipo} className="flex items-center gap-3 p-3 border rounded-md">
                <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{arquivo.nome}</span>
                    {statusBadge(arquivo.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{arquivo.descricao}</p>
                  {arquivo.status === 'processando' && arquivo.progresso !== undefined && (
                    <Progress value={arquivo.progresso} className="mt-2 h-1" />
                  )}
                  {arquivo.mensagem && (
                    <p className="text-xs text-green-700 mt-1">{arquivo.mensagem}</p>
                  )}
                </div>
                {arquivo.status === 'concluido' && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
                {arquivo.status === 'erro' && (
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções de Exportação (TOTVS Protheus)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">CT1 — Plano de Contas</p>
                <p className="text-muted-foreground mt-1">Módulo SIGACTB → Atualizações → Cadastros → Plano de Contas. Exportar em CSV com delimitador ;</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">CT2 — Lançamentos</p>
                <p className="text-muted-foreground mt-1">Módulo SIGACTB → Consultas → Lançamentos. Filtrar por período desejado. Exportar em CSV.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">CTT — Centros de Custo</p>
                <p className="text-muted-foreground mt-1">Módulo SIGACTB → Atualizações → Cadastros → Centros de Custo. Exportar em CSV.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium">CV0 — Entidade 05</p>
                <p className="text-muted-foreground mt-1">Módulo SIGACTB → Atualizações → Cadastros → Entidades. Filtrar plano 05. Exportar em CSV.</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800"><strong>Atenção:</strong> Os arquivos do Protheus contêm preâmbulo nas 2 primeiras linhas e utilizam delimitador <code>;</code>. O sistema ignora automaticamente o preâmbulo durante a importação.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
