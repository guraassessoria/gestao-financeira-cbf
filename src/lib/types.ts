// Application-wide TypeScript types

export type Periodo = 'mensal' | 'trimestral' | 'anual'
export type Demonstracao = 'DRE' | 'BP' | 'DFC' | 'DRA'
export type Moeda = 'BRL' | 'USD'

export interface FiltrosPeriodo {
  ano: number
  mes?: number
  trimestre?: number
  periodo: Periodo
  moeda: Moeda
  comparar_ano_anterior: boolean
}

export interface LinhaFinanceira {
  codigo: string
  descricao: string
  nivel: number
  nivel_visualizacao: number
  valor_atual: number
  valor_anterior?: number
  variacao_absoluta?: number
  variacao_percentual?: number
  qualitativa?: string
  filhos?: LinhaFinanceira[]
}

export interface IndicadorFinanceiro {
  nome: string
  sigla: string
  valor: number
  valor_anterior?: number
  variacao?: number
  formula: string
  interpretacao: string
  categoria: string
  positivo_quando_sobe: boolean
}

export interface RelatorioNarrativa {
  periodo: string
  demonstracao: Demonstracao
  destaques: string[]
  preocupacoes: string[]
  texto_gerado: string
  aprovado_por?: string
  aprovado_em?: string
}

export interface KPICard {
  titulo: string
  valor: number
  valor_anterior?: number
  variacao?: number
  moeda: Moeda
  icone?: string
}

export interface PlanoConta {
  cod_conta: string
  desc_conta: string
  classe_conta: string
  cond_normal: string
  cod_reduzido: string
  cta_superior: string
  filial: string
}

export interface CentroCusto {
  c_custo: string
  classe: string
  cond_normal: string
  desc_cc: string
  filial: string
}

export interface Lancamento {
  id?: string
  filial: string
  data_lcto: string
  numero_lote: string
  sub_lote: string
  numero_doc: string
  tipo_lcto: string
  cta_debito: string
  cta_credito: string
  valor: number
  hist_lanc: string
  c_custo_deb: string
  c_custo_crd: string
  origem?: string
}

export interface DREEstrutura {
  codigo_conta: string
  desc_dre: string
  codigo_cta_superior: string
  nivel: number
  nivel_visualizacao: number
}

export interface DREDePara {
  codigo_de_para: string
  desc_conta_dre: string
  codigo_conta_contabil: string
  codigo_centro_custo: string
}

export interface DadosMensais {
  mes: string
  receitas: number
  despesas: number
  resultado: number
}
