import { TabelaDemonstracao } from '@/components/financeiro/tabela-demonstracao'
import type { LinhaTabela } from '@/components/financeiro/tabela-demonstracao'

// Mock DRE data (R$ thousands)
const dreData: LinhaTabela[] = [
  { id: '1',  descricao: 'RECEITA BRUTA',                   valor: 54_800,  valorAnterior: 49_200,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: '2',  descricao: '  Receita de Serviços',           valor: 54_800,  valorAnterior: 49_200,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '3',  descricao: 'DEDUÇÕES DA RECEITA',             valor: -6_480,  valorAnterior: -6_100,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: '4',  descricao: '  Impostos sobre Serviços',       valor: -4_920,  valorAnterior: -4_600,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '5',  descricao: '  Devoluções e Abatimentos',      valor: -1_560,  valorAnterior: -1_500,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '6',  descricao: 'RECEITA LÍQUIDA',                 valor: 48_320,  valorAnterior: 43_100,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: '7',  descricao: 'CUSTOS DOS SERVIÇOS PRESTADOS',   valor: -28_900, valorAnterior: -26_200, nivel: 1, isSubtotal: false, isTotal: false },
  { id: '8',  descricao: '  Pessoal e Encargos',            valor: -19_400, valorAnterior: -17_500, nivel: 2, isSubtotal: false, isTotal: false },
  { id: '9',  descricao: '  Subcontratados',                valor: -6_200,  valorAnterior: -5_800,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '10', descricao: '  Outros Custos',                 valor: -3_300,  valorAnterior: -2_900,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '11', descricao: 'LUCRO BRUTO',                     valor: 19_420,  valorAnterior: 16_900,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: '12', descricao: 'DESPESAS OPERACIONAIS',           valor: -8_640,  valorAnterior: -7_950,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: '13', descricao: '  Vendas e Marketing',            valor: -2_100,  valorAnterior: -1_900,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '14', descricao: '  Gerais e Administrativas',      valor: -5_840,  valorAnterior: -5_400,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '15', descricao: '  Outras Despesas Operacionais',  valor: -700,    valorAnterior: -650,    nivel: 2, isSubtotal: false, isTotal: false },
  { id: '16', descricao: 'EBITDA',                          valor: 12_480,  valorAnterior: 10_200,  nivel: 1, isSubtotal: true,  isTotal: false },
  { id: '17', descricao: 'Depreciação e Amortização',       valor: -1_640,  valorAnterior: -1_480,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '18', descricao: 'EBIT',                            valor: 10_840,  valorAnterior: 8_720,   nivel: 1, isSubtotal: true,  isTotal: false },
  { id: '19', descricao: 'RESULTADO FINANCEIRO',            valor: -1_450,  valorAnterior: -1_100,  nivel: 1, isSubtotal: false, isTotal: false },
  { id: '20', descricao: '  Receitas Financeiras',          valor: 320,     valorAnterior: 280,     nivel: 2, isSubtotal: false, isTotal: false },
  { id: '21', descricao: '  Despesas Financeiras',          valor: -1_770,  valorAnterior: -1_380,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '22', descricao: 'LAIR',                            valor: 9_390,   valorAnterior: 7_620,   nivel: 1, isSubtotal: true,  isTotal: false },
  { id: '23', descricao: 'Imposto de Renda e CSLL',         valor: -1_500,  valorAnterior: -1_080,  nivel: 2, isSubtotal: false, isTotal: false },
  { id: '24', descricao: 'LUCRO LÍQUIDO',                   valor: 7_890,   valorAnterior: 6_540,   nivel: 1, isSubtotal: false, isTotal: true  },
]

export default function DrePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          DRE — Demonstrativo de Resultado do Exercício
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Comparativo Ano Atual × Ano Anterior • Valores em R$ mil
        </p>
      </div>

      <TabelaDemonstracao linhas={dreData} titulo="DRE" />
    </div>
  )
}
