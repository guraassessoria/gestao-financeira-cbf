'use client'

import { Upload as UploadIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface UploadResponse {
  success: boolean
  uploadId?: number
  totalLancamentos?: number
  totalValor?: number
  error?: string
}

export default function UploadPage() {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [fileName, setFileName] = useState('')

  if (!session?.user) {
    redirect('/login')
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

    try {
      const response = await fetch('/api/parse/ct2', {
        method: 'POST',
        body: formData,
      })

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

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Upload de Dados</h1>
      <p className="text-slate-600 mb-8">Ingestão e processamento de arquivo CT2 (Lançamentos)</p>

      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <UploadIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Selecione um arquivo CT2</h3>
          <p className="text-slate-600 mb-6">Arraste ou clique para selecionar o arquivo CSV</p>

          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-12 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
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
              }}
            />
            <p className="text-slate-600">
              {uploading ? '⏳ Processando...' : '📁 Clique ou arraste o arquivo CSV aqui'}
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Requisitos:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Formato: CSV (delimitador ;)</li>
              <li>✓ Encoding: Latin-1 (TOTVS Protheus)</li>
              <li>✓ Tipo de transação: Partida Dobrada</li>
              <li>✓ Tamanho: até 100MB</li>
              <li>✓ Arquivo: CT2 - Lançamentos.csv</li>
            </ul>
          </div>
        </div>
      </div>

      {uploadStatus === 'success' && uploadResult?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Upload realizado com sucesso!</h3>
              <p className="text-sm text-green-800 space-y-1">
                <div>📄 Arquivo: {fileName}</div>
                <div>📊 Lançamentos: {uploadResult.totalLancamentos?.toLocaleString('pt-BR')}</div>
                <div>💰 Total: R$ {uploadResult.totalValor?.toLocaleString('pt-BR')}</div>
                <div>🆔 Upload ID: {uploadResult.uploadId}</div>
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && uploadResult && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Erro no upload</h3>
              <p className="text-sm text-red-800">{uploadResult.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Status</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
          <p className="text-slate-600">
            {uploadStatus === 'idle' && 'Aguardando envio de arquivo CT2...'}
            {uploadStatus === 'uploading' && '⏳ Processando arquivo... (pode levar alguns segundos)'}
            {uploadStatus === 'success' &&
              'Dados carregados! Os lançamentos foram salvos no banco de dados.'}
            {uploadStatus === 'error' && 'Ocorreu um erro no upload.'}
          </p>
          <p className="text-xs text-slate-500 mt-3">Usuário: {session.user.email}</p>
        </div>
      </div>
    </div>
  )
}
