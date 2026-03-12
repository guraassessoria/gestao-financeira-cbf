import { NextResponse } from 'next/server'
import { mockDREData } from '@/lib/mock-data'
import { calcularVariacao, calcularVariacaoAbsoluta, getQualitativa } from '@/lib/utils'
import { LinhaFinanceira } from '@/lib/types'

function enrichLinhas(linhas: LinhaFinanceira[]): LinhaFinanceira[] {
  return linhas.map((l) => {
    const var_abs = l.valor_anterior !== undefined
      ? calcularVariacaoAbsoluta(l.valor_atual, l.valor_anterior)
      : undefined
    const var_pct = l.valor_anterior !== undefined
      ? calcularVariacao(l.valor_atual, l.valor_anterior)
      : undefined
    return {
      ...l,
      variacao_absoluta: var_abs,
      variacao_percentual: var_pct ?? undefined,
      qualitativa: var_pct !== null && var_pct !== undefined ? getQualitativa(var_pct) : '—',
      filhos: l.filhos ? enrichLinhas(l.filhos) : undefined,
    }
  })
}

export async function GET() {
  try {
    const data = enrichLinhas(mockDREData)
    return NextResponse.json({ data, fonte: 'mock' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar DRE' }, { status: 500 })
  }
}
