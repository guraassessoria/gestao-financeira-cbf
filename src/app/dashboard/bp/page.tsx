import { TabelaDemonstracao } from '@/components/financeiro/tabela-demonstracao'
import type { LinhaTabela } from '@/components/financeiro/tabela-demonstracao'

// Mock BP data (R$ thousands)
const ativoData: LinhaTabela[] = [
  { id: 'a1',  descricao: 'ATIVO',                              valor: 98_450,  valorAnterior: 88_200,  nivel: 1, isSubtotal: false, isTotal: true  },
  { id: 'a2',  descricao: 'ATIVO CIRCULANTE',                   valor: 42_300,  valorAnterior: 37_800,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: 'a3',  descricao: '  Caixa e Equivalentes',             valor: 12_500,  valorAnterior: 10_200,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a4',  descricao: '  Contas a Receber',                 valor: 18_400,  valorAnterior: 16_300,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a5',  descricao: '  Estoques',                         valor: 4_200,   valorAnterior: 4_800,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a6',  descricao: '  Outros Ativos Circulantes',        valor: 7_200,   valorAnterior: 6_500,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a7',  descricao: 'ATIVO NÃO CIRCULANTE',               valor: 56_150,  valorAnterior: 50_400,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: 'a8',  descricao: '  Realizável a Longo Prazo',         valor: 5_200,   valorAnterior: 4_600,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a9',  descricao: '  Investimentos',                    valor: 8_400,   valorAnterior: 7_200,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a10', descricao: '  Imobilizado Líquido',              valor: 32_550,  valorAnterior: 29_600,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'a11', descricao: '  Intangível',                       valor: 10_000,  valorAnterior: 9_000,   nivel: 2, isSubtotal: false, isTotal: false },
]

const passivoData: LinhaTabela[] = [
  { id: 'p1',  descricao: 'PASSIVO + PATRIMÔNIO LÍQUIDO',       valor: 98_450,  valorAnterior: 88_200,  nivel: 1, isSubtotal: false, isTotal: true  },
  { id: 'p2',  descricao: 'PASSIVO CIRCULANTE',                 valor: 28_600,  valorAnterior: 25_400,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: 'p3',  descricao: '  Fornecedores',                     valor: 8_200,   valorAnterior: 7_400,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p4',  descricao: '  Obrigações Trabalhistas',          valor: 7_600,   valorAnterior: 6_800,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p5',  descricao: '  Obrigações Fiscais',               valor: 4_400,   valorAnterior: 3_900,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p6',  descricao: '  Empréstimos de Curto Prazo',       valor: 5_200,   valorAnterior: 4_800,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p7',  descricao: '  Outros Passivos Circulantes',      valor: 3_200,   valorAnterior: 2_500,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p8',  descricao: 'PASSIVO NÃO CIRCULANTE',             valor: 18_400,  valorAnterior: 17_200,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: 'p9',  descricao: '  Empréstimos de Longo Prazo',       valor: 14_200,  valorAnterior: 13_500,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p10', descricao: '  Provisões de Longo Prazo',         valor: 4_200,   valorAnterior: 3_700,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p11', descricao: 'PATRIMÔNIO LÍQUIDO',                 valor: 51_450,  valorAnterior: 45_600,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: 'p12', descricao: '  Capital Social',                   valor: 30_000,  valorAnterior: 30_000,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p13', descricao: '  Reservas de Lucros',               valor: 13_560,  valorAnterior: 9_060,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'p14', descricao: '  Lucro do Exercício',               valor: 7_890,   valorAnterior: 6_540,   nivel: 2, isSubtotal: false, isTotal: false },
]

export default function BpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          BP — Balanço Patrimonial
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Comparativo Ano Atual × Ano Anterior • Valores em R$ mil
        </p>
      </div>

      <div className="space-y-6">
        <TabelaDemonstracao linhas={ativoData} titulo="ATIVO" />
        <TabelaDemonstracao linhas={passivoData} titulo="PASSIVO + PATRIMÔNIO LÍQUIDO" />
      </div>
    </div>
  )
}
