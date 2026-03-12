// ============================================================
// TIPOS DE DOMÍNIO — Sistema Gestão Financeira CBF
// ITG 2002 (R1) — Entidade sem fins lucrativos
// ============================================================

// --- Plano de Contas (CT1) ---
export interface ContaContabil {
  filial: string
  codConta: string
  descricao: string
  classe: 'Sintética' | 'Analítica'
  condNormal: 'Devedora' | 'Credora'
  ctaSuperior: string | null
  aceitaCC: boolean
  aceitaItem: boolean
  aceitaCLVL: boolean
  nivel: number // calculado a partir do código
}

// --- Centros de Custo (CTT) ---
export interface CentroCusto {
  filial: string
  codCC: string
  descricao: string
  classe: 'Sintético' | 'Analítico'
  condNormal: 'Receita' | 'Despesa'
  ccSuperior: string | null
  bloqueado: boolean
}

// --- Entidades DRE (CV0) ---
export interface EntidadeDRE {
  filial: string
  planoContab: string
  item: string
  codigo: string
  descricao: string
  classe: 'Analítica' | 'Sintética'
  condNormal: 'Devedora' | 'Credora'
  bloqueada: boolean
}

// --- De-Para DRE ---
export interface DeParaDRE {
  codigoDePara: string
  descricaoContaDRE: string
  codigoContaContabil: string
  codigoCentroCusto: string | null
}

// --- Estrutura DRE ---
export interface EstruturaLinhasDRE {
  codigoConta: string
  descricaoConta: string
  codigoCtaSuperior: string | null
  descricaoCtaSuperior: string | null
  nivel: number
  nivelVisualizacao: 1 | 2 | 3
}

// --- CT2 — Lançamento Contábil ---
export interface LancamentoContabil {
  filial: string
  dataLcto: Date
  numeroLote: string
  subLote: string
  numeroDoc: string
  moeda: string
  tipoLcto: 'Partida Dobrada' | 'Cont.Hist' | string
  ctaDebito: string | null
  ctaCredito: string | null
  valor: number // R$ inteiro (ex: 147000 = R$147.000,00)
  histPad: string | null
  histLanc: string | null
  cCustoDeb: string | null
  cCustoCrd: string | null
  ocorrenDeb: string | null
  ocorrenCrd: string | null
  valorMoeda1: number
  origem: string | null
  periodo: string // YYYY-MM derivado da data
}

// --- Upload de CT2 ---
export interface UploadCT2 {
  id: string
  nomeArquivo: string
  periodos: string[] // ex: ["2025-01", "2025-02"]
  totalLancamentos: number
  totalValor: number
  uploadedAt: Date
  uploadedBy: string
  status: 'processando' | 'ok' | 'erro'
  erros: string[]
}

// --- DRE Calculada ---
export interface LinhaDRECalculada {
  codigoConta: string
  descricao: string
  nivel: number
  nivelVisualizacao: 1 | 2 | 3
  codigoSuperior: string | null
  temFilhos?: boolean
  valor: number
  valorAnterior: number | null
  variacaoAbsoluta: number | null
  variacaoPercentual: number | null
  valoresMensaisAtual?: number[]
  valoresMensaisAnterior?: number[]
  filhos: LinhaDRECalculada[]
}

export interface DRECompleta {
  periodo: string
  periodoComparativo: string | null
  linhas: LinhaDRECalculada[]
  superavitDeficit: number // linha raiz 1854
  geradoEm: Date
  geradoPor: string
}

// --- Índice Financeiro ---
export interface IndiceFinanceiro {
  id: string
  nome: string
  descricao: string
  formula: string // ex: "1701 / 1819" (códigos DRE)
  unidade: 'R$' | '%' | 'x' | 'dias'
  casasDecimais: number
  ativo: boolean
  ordem: number
}

export interface IndiceCalculado extends IndiceFinanceiro {
  valor: number
  componentes: Record<string, number> // rastreabilidade
  periodo: string
}

// --- Análise por Competição / Centro de Custo ---
export interface AnaliseCC {
  codCC: string
  descricao: string
  receitas: number
  custos: number
  despesas: number
  resultado: number
  percentualReceita: number
  periodo: string
  detalhes: {
    codConta: string
    descConta: string
    debitos: number
    creditos: number
    saldo: number
  }[]
}

// --- Usuário / Controle de Acesso ---
export type Permissao =
  | 'admin'
  | 'upload'
  | 'demonstracoes'
  | 'indices'
  | 'competicoes'
  | 'centros_custo'
  | 'dashboard'
  | 'relatorios_ia'

export interface Perfil {
  id: string
  nome: string
  permissoes: Permissao[]
  somenteLeitura: boolean
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfilId: string
  perfil: Perfil
  ativo: boolean
  criadoEm: Date
  ultimoAcesso: Date | null
}

// --- Log de Relatório ---
export interface LogRelatorio {
  id: string
  tipo: 'DRE' | 'BP' | 'DFC' | 'DRA' | 'Indice' | 'Competicao' | 'CC'
  periodo: string
  geradoPor: string
  geradoEm: Date
  parametros: Record<string, unknown>
  uploadIds: string[] // rastreabilidade para os CT2 usados
}

// --- Filtros gerais ---
export interface FiltrosPeriodo {
  periodoInicio: string // YYYY-MM
  periodoFim: string
  comparativo?: string
  filial?: string
}
