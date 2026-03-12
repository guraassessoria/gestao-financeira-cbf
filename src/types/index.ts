export type UserRole = 'auditor' | 'contador' | 'presidente' | 'diretor'

export type Currency = 'BRL' | 'USD'

export type PeriodType = 'mensal' | 'trimestral' | 'anual'

export type DemonstrationType = 'BP' | 'DRE' | 'DFC' | 'DRA'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface ContaContabil {
  codigo: string
  descricao: string
  tipo: string
  nivel: number
  grupo: string
}

export interface Lancamento {
  id: string
  data: string
  conta_debito: string
  conta_credito: string
  valor: number
  historico: string
  centro_custo?: string
  entidade?: string
  periodo: string // YYYY-MM
  ano: number
  mes: number
}

export interface LinhaFinanceira {
  id: string
  demonstracao: DemonstrationType
  secao: string
  subsecao: string
  ordem: number
  descricao: string
  contas: string[]
  sinal: number // 1 or -1
  nivel: number
  is_subtotal: boolean
  is_total: boolean
}

export interface ValorPeriodo {
  periodo: string
  ano: number
  mes?: number
  trimestre?: number
  valor: number
  valor_anterior: number
  variacao_absoluta: number
  variacao_percentual: number
}

export interface IndicadorFinanceiro {
  nome: string
  valor: number
  valor_anterior: number
  variacao: number
  unidade: 'percentual' | 'valor' | 'indice'
  descricao: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  details: Record<string, unknown>
  created_at: string
}
