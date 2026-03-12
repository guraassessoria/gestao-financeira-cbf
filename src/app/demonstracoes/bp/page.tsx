interface BPLinha {
  codigo: string
  descricao: string
  ano: number
  anoAnterior: number
  destaque?: 'secao' | 'total'
}

const anoBase = 2025

const ativoLinhas: BPLinha[] = [
  { codigo: '1.1', descricao: 'Ativo Circulante', ano: 3_950_000, anoAnterior: 3_480_000, destaque: 'secao' },
  { codigo: '1.1.1', descricao: 'Caixa e Equivalentes de Caixa', ano: 1_420_000, anoAnterior: 1_180_000 },
  { codigo: '1.1.2', descricao: 'Contas a Receber', ano: 1_080_000, anoAnterior: 1_020_000 },
  { codigo: '1.1.3', descricao: 'Outros Créditos', ano: 1_450_000, anoAnterior: 1_280_000 },
  { codigo: '1.2', descricao: 'Ativo Não Circulante', ano: 5_240_000, anoAnterior: 4_970_000, destaque: 'secao' },
  { codigo: '1.2.1', descricao: 'Realizável a Longo Prazo', ano: 1_760_000, anoAnterior: 1_640_000 },
  { codigo: '1.2.2', descricao: 'Imobilizado', ano: 3_480_000, anoAnterior: 3_330_000 },
  { codigo: '1', descricao: 'Total do Ativo', ano: 9_190_000, anoAnterior: 8_450_000, destaque: 'total' },
]

const passivoPLLinhas: BPLinha[] = [
  { codigo: '2.1', descricao: 'Passivo Circulante', ano: 2_240_000, anoAnterior: 2_090_000, destaque: 'secao' },
  { codigo: '2.1.1', descricao: 'Fornecedores e Obrigações', ano: 1_330_000, anoAnterior: 1_210_000 },
  { codigo: '2.1.2', descricao: 'Obrigações Tributárias e Sociais', ano: 910_000, anoAnterior: 880_000 },
  { codigo: '2.2', descricao: 'Passivo Não Circulante', ano: 1_980_000, anoAnterior: 1_760_000, destaque: 'secao' },
  { codigo: '2.2.1', descricao: 'Provisões e Contingências', ano: 1_980_000, anoAnterior: 1_760_000 },
  { codigo: '2.3', descricao: 'Patrimônio Líquido', ano: 4_970_000, anoAnterior: 4_600_000, destaque: 'secao' },
  { codigo: '2.3.1', descricao: 'Patrimônio Social', ano: 3_750_000, anoAnterior: 3_550_000 },
  { codigo: '2.3.2', descricao: 'Superávits Acumulados', ano: 1_220_000, anoAnterior: 1_050_000 },
  { codigo: '2 + 2.3', descricao: 'Total do Passivo + PL', ano: 9_190_000, anoAnterior: 8_450_000, destaque: 'total' },
]

export default function BPPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <h1 className="text-4xl font-bold mb-2">Balanço Patrimonial</h1>
      <p className="text-slate-600 mb-8">
        Modelo de visualização comparativa: {anoBase} x {anoBase - 1}
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2">
          <BPBloco
            titulo="Ativo"
            linhas={ativoLinhas}
            ano={anoBase}
            className="xl:border-r xl:border-slate-200"
          />
          <BPBloco
            titulo="Passivo + Patrimônio Líquido"
            linhas={passivoPLLinhas}
            ano={anoBase}
          />
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-slate-100 text-xs text-slate-600">
        Estrutura pronta para integração com mapeamento de De-Para e Estrutura DRE/BP. Valores acima são demonstrativos.
      </div>
    </div>
  )
}

function BPBloco({
  titulo,
  linhas,
  ano,
  className,
}: {
  titulo: string
  linhas: BPLinha[]
  ano: number
  className?: string
}) {
  return (
    <div className={className}>
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
      </div>

      <div className="grid grid-cols-[1fr_150px_150px] px-6 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
        <div>Conta</div>
        <div className="text-right">{ano}</div>
        <div className="text-right">{ano - 1}</div>
      </div>

      <div className="divide-y divide-slate-100">
        {linhas.map((linha) => {
          const isSecao = linha.destaque === 'secao'
          const isTotal = linha.destaque === 'total'

          return (
            <div
              key={linha.codigo + linha.descricao}
              className={[
                'grid grid-cols-[1fr_150px_150px] px-6 py-3 text-sm',
                isSecao ? 'bg-blue-50/60 font-semibold text-slate-900' : 'text-slate-700',
                isTotal ? 'bg-slate-900 text-white font-bold' : '',
              ].join(' ')}
            >
              <div className="pr-3">
                <span className={isTotal ? 'text-slate-200' : 'text-slate-400'}>{linha.codigo}</span>
                <span className="ml-2">{linha.descricao}</span>
              </div>
              <div className="text-right tabular-nums">{formatCurrency(linha.ano)}</div>
              <div className="text-right tabular-nums">{formatCurrency(linha.anoAnterior)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}
