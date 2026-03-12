import { Upload as UploadIcon } from 'lucide-react'

export default function UploadPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Upload de Dados</h1>
      <p className="text-slate-600 mb-8">Ingestão e processamento de arquivo CT2 (Lançamentos)</p>

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <UploadIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Selecione um arquivo CT2</h3>
          <p className="text-slate-600 mb-6">Arraste ou clique para selecionar o arquivo CSV</p>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 bg-slate-50">
            <input
              type="file"
              accept=".csv"
              className="w-full"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Requisitos:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Formato: CSV (delimitador ;)</li>
              <li>✓ Encoding: Latin-1</li>
              <li>✓ Tipo de transação: Partida Dobrada</li>
              <li>✓ Tamanho: até 100MB</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Uploads Recentes</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-500">
          Nenhum upload anterior. Envie seu primeiro arquivo CT2 acima.
        </div>
      </div>
    </div>
  )
}
