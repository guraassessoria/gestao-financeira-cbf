export default function DraPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          DRA — Demonstrativo de Resultado Abrangente
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Outros Resultados Abrangentes (OCI) • Mapeamento em definição
        </p>
      </div>

      {/* Lucro Líquido row */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700">DRA</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-slate-600 font-medium w-1/2">Descrição</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">Ano Atual</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">Ano Anterior</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">Variação R$</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">Variação %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50">
              <td className="px-6 py-3 font-medium text-slate-800">Lucro Líquido do Exercício</td>
              <td className="text-right px-4 py-3 text-slate-800">7.890</td>
              <td className="text-right px-4 py-3 text-slate-600">6.540</td>
              <td className="text-right px-4 py-3 text-green-600 font-medium">+1.350</td>
              <td className="text-right px-4 py-3 text-green-600 font-medium">+20,6%</td>
            </tr>
            <tr className="border-b border-slate-50 bg-amber-50">
              <td className="px-6 py-3 text-slate-600 italic" colSpan={5}>
                Outros Resultados Abrangentes (OCI) — componentes finais pendentes de definição
              </td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="px-6 py-3 text-slate-400 pl-10">Variações Atuariais de Benefícios</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="px-6 py-3 text-slate-400 pl-10">Ajuste de Avaliação Patrimonial</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
              <td className="text-right px-4 py-3 text-slate-400">—</td>
            </tr>
            <tr className="bg-primary-50">
              <td className="px-6 py-3 font-bold text-slate-900">RESULTADO ABRANGENTE TOTAL</td>
              <td className="text-right px-4 py-3 font-bold text-slate-900">7.890</td>
              <td className="text-right px-4 py-3 font-bold text-slate-700">6.540</td>
              <td className="text-right px-4 py-3 font-bold text-green-600">+1.350</td>
              <td className="text-right px-4 py-3 font-bold text-green-600">+20,6%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Pendente:</strong> Os componentes de Outros Resultados Abrangentes (OCI) serão
        definidos na Onda 1 do backlog — Dicionário de dados e mapeamento DRA.
      </div>
    </div>
  )
}
