export default function CargaDadosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Carga de Dados</h1>
        <p className="text-slate-500 text-sm mt-1">
          Importação de arquivos CSV/XLS exportados do TOTVS Protheus
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-5 text-sm text-primary-900">
        <h2 className="font-semibold text-base mb-2">Formato esperado — TOTVS Protheus</h2>
        <ul className="list-disc list-inside space-y-1 text-primary-800">
          <li>Os arquivos CSV do Protheus possuem <strong>2 linhas de preâmbulo</strong> que serão ignoradas.</li>
          <li>Delimitador: <code className="bg-primary-100 px-1 rounded">;</code> (ponto e vírgula)</li>
          <li>Encoding aceito: <strong>UTF-8</strong> ou <strong>Latin-1 (ISO-8859-1)</strong></li>
          <li>Arquivos XLS exportados nativamente do Protheus são suportados.</li>
        </ul>
      </div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'CT1 — Plano de Contas', hint: 'CT1 - Plano de contas.csv', tipo: 'plano_contas' },
          { label: 'CT2 — Lançamentos Contábeis', hint: 'CT2 - Lancamentos.csv', tipo: 'lancamentos' },
          { label: 'CTT — Centros de Custo', hint: 'CTT - Centros de Custo.csv', tipo: 'centros_custo' },
          { label: 'CV0 — Entidade 05', hint: 'CV0 - Entidade 05.csv', tipo: 'entidade' },
          { label: 'DRE — Estrutura', hint: 'DRE - Estrutura.xls', tipo: 'dre_estrutura' },
          { label: 'DRE — De × Para', hint: 'DRE - De_Para.xls', tipo: 'dre_de_para' },
        ].map((arquivo) => (
          <div
            key={arquivo.tipo}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <h3 className="font-semibold text-slate-800 text-sm mb-1">{arquivo.label}</h3>
            <p className="text-xs text-slate-400 mb-4">Arquivo esperado: <code>{arquivo.hint}</code></p>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer group">
              <div className="text-slate-400 group-hover:text-primary-500 transition-colors">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                </svg>
                <p className="text-xs">Arraste o arquivo ou <span className="text-primary-600 font-medium">clique para selecionar</span></p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                disabled
                className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg opacity-50 cursor-not-allowed"
              >
                Processar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Onda 2 do backlog:</strong> A ingestão e validação automática dos arquivos Protheus
        será implementada na próxima sprint. Por enquanto, o upload está desabilitado.
      </div>
    </div>
  )
}
