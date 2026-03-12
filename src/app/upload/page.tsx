'use client'

import { Upload as UploadIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UploadResponse {
  success: boolean
  uploadId?: number
  totalLancamentos?: number
  totalContas?: number
  totalCC?: number
  totalEntidades?: number
  totalValor?: number
  error?: string
}

type FileType = 'CT1' | 'CTT' | 'CV0' | 'CT2'

const FILE_TYPE_CONFIG: Record<
  FileType,
  { label: string; endpoint: string; description: string; hint: string }
> = {
  CT1: {
    label: 'CT1 — Plano de Contas',
    endpoint: '/api/parse/ct1',
    description: 'Importa o cadastro de contas contábeis',
    hint: 'CT1 - Plano de contas.csv',
  },
  CTT: {
    label: 'CTT — Centros de Custo',
    endpoint: '/api/parse/ctt',
    description: 'Importa hierarquia de centros de custo',
    hint: 'CTT - Centros de Custo.csv',
  },
  CV0: {
    label: 'CV0 — Entidade (Competições)',
    endpoint: '/api/parse/cv0',
    description: 'Importa entidades do DRE (competições/seleções)',
    hint: 'CV0 - Entidade 05.csv',
  },
  CT2: {
    label: 'CT2 — Lançamentos Contábeis',
    endpoint: '/api/parse/ct2',
    description: 'Importa lançamentos contábeis (Partida Dobrada)',
    hint: 'CT2 - Lançamentos.csv',
  },
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<FileType>('CT2')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  )
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || !session?.user) {
    return null
  }

  async function handleFileUpload(file: File) {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error')
      setUploadResult({ success: false, error: 'Apenas arquivos CSV são aceitos' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadStatus('uploading')
    setFileName(file.name)
    setUploadResult(null)

    const endpoint = FILE_TYPE_CONFIG[selectedType].endpoint

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData })
      const data = (await response.json()) as UploadResponse

      if (!response.ok) {
        setUploadStatus('error')
        setUploadResult({ success: false, error: data.error })
      } else {
        setUploadStatus('success')
        setUploadResult(data)
      }
    } catch (error) {
      setUploadStatus('error')
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const config = FILE_TYPE_CONFIG[selectedType]

  function successSummary() {
    if (!uploadResult?.success) return null
    if (uploadResult.totalLancamentos !== undefined)
      return `${uploadResult.totalLancamentos.toLocaleString('pt-BR')} lançamentos`
    if (uploadResult.totalContas !== undefined)
      return `${uploadResult.totalContas.toLocaleString('pt-BR')} contas`
    if (uploadResult.totalCC !== undefined)
      return `${uploadResult.totalCC.toLocaleString('pt-BR')} centros de custo`
    if (uploadResult.totalEntidades !== undefined)
      return `${uploadResult.totalEntidades.toLocaleString('pt-BR')} entidades`
    return 'Dados carregados'
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Upload de Dados</h1>
      <p className="text-slate-600 mb-8">
        Ingestão e processamento de arquivos TOTVS Protheus
      </p>

      {/* Seleção do tipo de arquivo */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipo de arquivo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(FILE_TYPE_CONFIG) as FileType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type)
                setUploadStatus('idle')
                setUploadResult(null)
              }}
              className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                selectedType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <p className="font-semibold">{type}</p>
              <p className="text-xs text-slate-500 mt-1">{FILE_TYPE_CONFIG[type].description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Área de upload */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <UploadIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-1">{config.label}</h3>
          <p className="text-slate-500 text-sm mb-6">{config.description}</p>

          <div
            className={`border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
                e.target.value = ''
              }}
            />
            <p className="text-slate-600">
              {uploading
                ? '⏳ Processando...'
                : isDragging
                  ? '📂 Solte o arquivo aqui'
                  : '📁 Clique ou arraste o arquivo CSV aqui'}
            </p>
            <p className="text-xs text-slate-400 mt-2">Arquivo esperado: {config.hint}</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Requisitos:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Formato: CSV (delimitador ;)</li>
              <li>✓ Encoding: Latin-1 (TOTVS Protheus)</li>
              <li>✓ Tamanho: até 100 MB</li>
              {selectedType === 'CT2' && (
                <li>✓ Tipo de transação: Partida Dobrada</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {uploadStatus === 'success' && uploadResult?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Upload realizado com sucesso!</h3>
              <p className="text-sm text-green-800">
                <span>📄 Arquivo: {fileName}</span>
                <br />
                <span>📊 {successSummary()}</span>
                {uploadResult.totalValor !== undefined && (
                  <>
                    <br />
                    <span>
                      💰 Total:{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(uploadResult.totalValor)}
                    </span>
                  </>
                )}
                {uploadResult.uploadId !== undefined && (
                  <>
                    <br />
                    <span>🆔 Upload ID: {uploadResult.uploadId}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && uploadResult && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Erro no upload</h3>
              <p className="text-sm text-red-800">{uploadResult.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-xs text-slate-500 text-center">
          {uploadStatus === 'idle' && `Aguardando envio — tipo selecionado: ${selectedType}`}
          {uploadStatus === 'uploading' && '⏳ Processando arquivo...'}
          {uploadStatus === 'success' && 'Dados carregados com sucesso no banco de dados.'}
          {uploadStatus === 'error' && 'Ocorreu um erro no upload.'}
          {' '}· Usuário: {session.user.email}
        </p>
      </div>
    </div>
  )
}
