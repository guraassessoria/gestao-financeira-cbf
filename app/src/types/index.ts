export type Demonstracao = 'BP' | 'DRE' | 'DFC' | 'DRA'
export type VisaoTemporal = 'mensal' | 'trimestral' | 'anual'
export type Moeda = 'BRL' | 'USD'
export type StatusRelatorio = 'rascunho' | 'revisao' | 'aprovado' | 'emitido'

export interface PlanoContas {
  id: number
  filial: string
  cod_conta: string
  desc_conta: string
  classe_conta: 'Analitica' | 'Sintetica'
  cond_normal: 'Devedora' | 'Credora'
  cta_superior?: string
  nat_conta?: string
}

export interface CentroCusto {
  id: number
  filial: string
  c_custo: string
  desc_cc: string
  classe: 'Analitico' | 'Sintetico'
  cond_normal: 'Receita' | 'Despesa'
  cc_superior?: string
}

export interface Entidade05 {
  id: number
  filial: string
  plano_contab: string
  item?: string
  codigo: string
  descricao: string
  classe?: string
  cond_normal?: string
  entid_sup?: string
}

export interface Lancamento {
  id: number
  filial: string
  data_lcto: string
  numero_lote?: string
  sub_lote?: string
  numero_doc?: string
  moeda_lancto?: string
  tipo_lcto: string
  cta_debito?: string
  cta_credito?: string
  valor: number
  valor_moeda1?: number
  hist_lanc?: string
  c_custo_deb?: string
  c_custo_crd?: string
  atividade_deb?: string
  atividade_crd?: string
  origem?: string
}

export interface MapeamentoConta {
  id: number
  demonstracao: Demonstracao
  secao: string
  subsecao: string
  linha: string
  ordem: number
  conta_protheus_inicio?: string
  conta_protheus_fim?: string
  conta_protheus_lista?: string[]
  classe_conta?: string
  cond_normal?: string
  sinal_apresentacao: 'positivo' | 'negativo'
  regra_soma: 'faixa' | 'lista' | 'regra' | 'de_para'
  usa_ccusto: boolean
  usa_entidade05: boolean
  usa_de_para_dre: boolean
  observacao?: string
  owner_validacao?: string
  status: 'pendente' | 'aprovado' | 'revisao'
}

export interface DreDePara {
  id: number
  cod_conta: string
  desc_conta?: string
  linha_dre: string
  secao_dre: string
  subsecao_dre?: string
  sinal: 1 | -1
  usa_entidade05: boolean
  observacao?: string
  status: 'pendente' | 'aprovado' | 'revisao'
}

export interface Fechamento {
  id: number
  ano: number
  mes: number
  status: 'aberto' | 'fechado' | 'revisao'
  data_fechamento?: string
  usuario_fechamento?: string
  observacao?: string
}

export interface PoliticaCambio {
  id: number
  ano: number
  mes: number
  moeda_origem: string
  moeda_destino: string
  taxa_media?: number
  taxa_fechamento?: number
  fonte?: string
  data_referencia?: string
}

export interface Relatorio {
  id: number
  tipo: Demonstracao | 'INDICADORES' | 'EXECUTIVO'
  titulo: string
  periodo_inicio: string
  periodo_fim: string
  ano_comparativo?: number
  visao: VisaoTemporal
  moeda: Moeda
  dados?: Record<string, unknown>
  narrativa?: string
  status: StatusRelatorio
  aprovado_por?: string
  data_aprovacao?: string
  criado_por?: string
  created_at: string
}

// ---- Tipos de apresentacao ----

export interface LinhaFinanceira {
  linha: string
  secao: string
  subsecao: string
  ordem: number
  ehTotal: boolean
  ehSubtotal: boolean
  ehSeparador: boolean
  valorAtual: number
  valorAnterior: number
  variacao: number
  variacaoPercentual: number | null
  qualitativo: string | null
}

export interface DemonstracoFinanceira {
  demonstracao: Demonstracao
  titulo: string
  periodo: string
  periodoComparativo: string
  moeda: Moeda
  linhas: LinhaFinanceira[]
}

export interface IndicadorFinanceiro {
  codigo: string
  nome: string
  descricao: string
  valor: number | null
  valorAnterior: number | null
  variacao: number | null
  variacaoPercentual: number | null
  unidade: string
  qualitativo: string | null
  status: 'bom' | 'atencao' | 'critico' | 'neutro'
}

export interface FiltroVisualizacao {
  ano: number
  anoComparativo: number
  mes?: number
  trimestre?: number
  visao: VisaoTemporal
  moeda: Moeda
  demonstracao: Demonstracao
}

export interface SaldoMensal {
  filial: string
  ano: number
  mes: number
  cod_conta: string
  total_debito: number
  total_credito: number
  saldo_liquido: number
}
