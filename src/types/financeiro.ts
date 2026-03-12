export type Demonstracao = 'BP' | 'DRE' | 'DFC' | 'DRA'
export type PeriodoTipo = 'mensal' | 'trimestral' | 'anual'
export type Moeda = 'BRL' | 'USD'

export interface PlanoConta {
  id: string
  filial: string
  cod_conta: string
  desc_conta: string
  classe_conta: 'Sintetica' | 'Analitica'
  cond_normal: 'Devedora' | 'Credora'
  cta_superior?: string
  grupo?: string
  nat_conta?: string
}

export interface CentroCusto {
  id: string
  filial: string
  c_custo: string
  descricao: string
  classe: string
  cond_normal: string
  cc_superior?: string
}

export interface Lancamento {
  id: string
  filial: string
  data_lcto: string
  numero_lote?: string
  numero_doc?: string
  tipo_lcto: string
  cta_debito?: string
  cta_credito?: string
  valor: number
  hist_lanc?: string
  c_custo_deb?: string
  c_custo_crd?: string
  valor_moeda1?: number
}

export interface MapeamentoContabil {
  id: string
  demonstracao: Demonstracao
  secao: string
  subsecao?: string
  ordem: number
  conta_inicio?: string
  conta_fim?: string
  conta_lista?: string
  sinal_apresentacao: string
  regra_soma: string
  usa_ccusto: boolean
  usa_entidade05: boolean
  usa_de_para_dre: boolean
  observacao?: string
  status: string
}

export interface TaxaCambio {
  id: string
  data_referencia: string
  moeda_origem: string
  moeda_destino: string
  taxa: number
  tipo: string
  fonte?: string
}

export interface LinhaFinanceira {
  codigo: string
  descricao: string
  valor_atual: number
  valor_anterior: number
  variacao_absoluta: number
  variacao_percentual: number | null
  nivel: number
  tipo: 'sintetica' | 'analitica'
  filho?: LinhaFinanceira[]
}

export interface DadosMensais {
  mes: number
  ano: number
  valor: number
  moeda: Moeda
}

export interface IndicadorFinanceiro {
  nome: string
  sigla: string
  valor: number | null
  valor_anterior?: number | null
  unidade: '%' | 'x' | 'R$' | 'USD'
  descricao: string
  interpretacao?: string
}
