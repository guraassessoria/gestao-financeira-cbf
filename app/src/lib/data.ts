import { createClient } from '@/lib/supabase/server'
import type {
  MapeamentoConta,
  SaldoMensal,
  DreDePara,
  Fechamento,
  Demonstracao,
} from '@/types'

export async function getMapeamento(
  demonstracao: Demonstracao
): Promise<MapeamentoConta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mapeamento_contas')
    .select('*')
    .eq('demonstracao', demonstracao)
    .order('ordem')

  if (error) throw new Error(`Erro ao carregar mapeamento: ${error.message}`)
  return data ?? []
}

export async function getSaldosMensais(
  ano: number,
  anoComparativo?: number
): Promise<SaldoMensal[]> {
  const supabase = await createClient()
  const anos = [ano, ...(anoComparativo ? [anoComparativo] : [])]

  const { data, error } = await supabase
    .from('vw_saldo_liquido_mensal')
    .select('*')
    .in('ano', anos)

  if (error) throw new Error(`Erro ao carregar saldos: ${error.message}`)
  return data ?? []
}

export async function getDreDePara(): Promise<DreDePara[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dre_de_para')
    .select('*')
    .order('linha_dre')

  if (error) throw new Error(`Erro ao carregar DRE De-Para: ${error.message}`)
  return data ?? []
}

export async function getFechamentos(): Promise<Fechamento[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fechamentos')
    .select('*')
    .order('ano', { ascending: false })
    .order('mes', { ascending: false })

  if (error) throw new Error(`Erro ao carregar fechamentos: ${error.message}`)
  return data ?? []
}

export async function getAnosDisponiveis(): Promise<number[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ct2_lancamentos')
    .select('data_lcto')
    .eq('tipo_lcto', 'Partida Dobrada')

  if (error) return []

  const anos = new Set<number>()
  for (const row of data ?? []) {
    if (row.data_lcto) {
      anos.add(new Date(row.data_lcto).getFullYear())
    }
  }
  return Array.from(anos).sort((a, b) => b - a)
}
