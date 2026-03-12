import { TabelaDemonstracao } from '@/components/financeiro/tabela-demonstracao'
import type { LinhaTabela } from '@/components/financeiro/tabela-demonstracao'

// Mock DFC data — método indireto (R$ thousands)
const dfcData: LinhaTabela[] = [
  // Operacional
  { id: 'op1',  descricao: 'ATIVIDADES OPERACIONAIS',                     valor: 10_150, valorAnterior: 9_200,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: 'op2',  descricao: '  Lucro Líquido do Exercício',                valor: 7_890,  valorAnterior: 6_540,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'op3',  descricao: '  Ajustes de Itens Sem Efeito Caixa',         valor: 0,      valorAnterior: 0,      nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'op4',  descricao: '    Depreciação e Amortização',               valor: 1_640,  valorAnterior: 1_480,  nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op5',  descricao: '    Provisões',                               valor: 420,    valorAnterior: 380,    nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op6',  descricao: '  Variação de Capital de Giro',               valor: 0,      valorAnterior: 0,      nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'op7',  descricao: '    (Aumento)/Redução em Contas a Receber',   valor: -2_100, valorAnterior: -1_800, nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op8',  descricao: '    (Aumento)/Redução em Estoques',           valor: 600,    valorAnterior: -200,   nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op9',  descricao: '    Aumento/(Redução) em Fornecedores',       valor: 800,    valorAnterior: 400,    nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op10', descricao: '    Aumento/(Redução) em Obrigações',         valor: 900,    valorAnterior: 400,    nivel: 3, isSubtotal: false, isTotal: false },
  { id: 'op11', descricao: 'CAIXA GERADO POR ATIVIDADES OPERACIONAIS',   valor: 10_150, valorAnterior: 9_200,  nivel: 1, isSubtotal: true,  isTotal: false },

  // Investimento
  { id: 'in1',  descricao: 'ATIVIDADES DE INVESTIMENTO',                  valor: -5_800, valorAnterior: -4_500, nivel: 1, isSubtotal: false, isTotal: false },
  { id: 'in2',  descricao: '  Aquisição de Imobilizado',                  valor: -4_800, valorAnterior: -3_800, nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'in3',  descricao: '  Aquisição de Intangível',                   valor: -1_200, valorAnterior: -900,   nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'in4',  descricao: '  Recebimento por Venda de Ativos',           valor: 200,    valorAnterior: 200,    nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'in5',  descricao: 'CAIXA UTILIZADO EM INVESTIMENTOS',            valor: -5_800, valorAnterior: -4_500, nivel: 1, isSubtotal: true,  isTotal: false },

  // Financiamento
  { id: 'fn1',  descricao: 'ATIVIDADES DE FINANCIAMENTO',                 valor: -2_050, valorAnterior: -1_800, nivel: 1, isSubtotal: false, isTotal: false },
  { id: 'fn2',  descricao: '  Captação de Empréstimos',                   valor: 2_000,  valorAnterior: 3_000,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'fn3',  descricao: '  Pagamento de Empréstimos',                  valor: -3_200, valorAnterior: -3_800, nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'fn4',  descricao: '  Pagamento de Dividendos',                   valor: -850,   valorAnterior: -1_000, nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'fn5',  descricao: 'CAIXA UTILIZADO EM FINANCIAMENTOS',           valor: -2_050, valorAnterior: -1_800, nivel: 1, isSubtotal: true,  isTotal: false },

  // Resultado
  { id: 'r1',   descricao: 'VARIAÇÃO LÍQUIDA DE CAIXA',                   valor: 2_300,  valorAnterior: 2_900,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: 'r2',   descricao: 'Saldo Inicial de Caixa',                      valor: 10_200, valorAnterior: 7_300,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: 'r3',   descricao: 'SALDO FINAL DE CAIXA',                        valor: 12_500, valorAnterior: 10_200, nivel: 1, isSubtotal: false, isTotal: true  },
]

export default function DfcPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          DFC — Demonstrativo de Fluxo de Caixa
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Método Indireto • Comparativo Ano Atual × Ano Anterior • Valores em R$ mil
        </p>
      </div>

      <TabelaDemonstracao linhas={dfcData} titulo="DFC — Método Indireto" />
    </div>
  )
}
