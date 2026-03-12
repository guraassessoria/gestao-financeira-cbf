import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Demonstracao, VisaoTemporal, Moeda } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tipo,
      ano,
      anoComparativo,
      visao,
      moeda,
      perguntas,
    } = body as {
      tipo: Demonstracao | 'EXECUTIVO'
      ano: number
      anoComparativo: number
      visao: VisaoTemporal
      moeda: Moeda
      perguntas: Record<string, string>
    }

    // Construir narrativa a partir das respostas guiadas
    const narrativa = construirNarrativa({
      tipo,
      ano,
      anoComparativo,
      visao,
      moeda,
      perguntas,
    })

    const supabase = await createClient()

    // Salvar relatório com status "revisao"
    const { data: relatorio, error } = await supabase
      .from('relatorios')
      .insert({
        tipo: tipo === 'EXECUTIVO' ? 'EXECUTIVO' : tipo,
        titulo: `Relatório ${tipo} — ${visao === 'anual' ? ano : `${ano}`}`,
        periodo_inicio: `${ano}-01-01`,
        periodo_fim: `${ano}-12-31`,
        ano_comparativo: anoComparativo,
        visao,
        moeda,
        narrativa,
        dados: { perguntas },
        status: 'revisao',
      })
      .select()
      .single()

    if (error) {
      // Se a tabela não existe ainda (sem Supabase configurado), retornar apenas a narrativa
      return NextResponse.json({ narrativa, id: null })
    }

    return NextResponse.json({ narrativa, id: relatorio?.id })
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

function construirNarrativa(params: {
  tipo: string
  ano: number
  anoComparativo: number
  visao: string
  moeda: string
  perguntas: Record<string, string>
}): string {
  const { tipo, ano, anoComparativo, moeda, perguntas } = params

  const secoes: string[] = []

  // Cabeçalho
  secoes.push(
    `RELATÓRIO FINANCEIRO — ${tipo}\n` +
    `Período: ${ano} vs ${anoComparativo} | Moeda: ${moeda}\n` +
    `Data de elaboração: ${new Date().toLocaleDateString('pt-BR')}\n` +
    `Status: REVISÃO — Aguardando aprovação\n`
  )

  // Seção 1: Desempenho Geral
  if (perguntas.resultado_geral) {
    secoes.push(`1. DESEMPENHO GERAL\n\n${perguntas.resultado_geral}`)
  } else {
    secoes.push(
      `1. DESEMPENHO GERAL\n\n` +
      `Análise do desempenho financeiro do exercício ${ano} em comparação com ${anoComparativo} ` +
      `pendente de complementação pela equipe de Controladoria.`
    )
  }

  // Seção 2: Receita
  if (perguntas.receita) {
    secoes.push(`2. ANÁLISE DE RECEITAS\n\n${perguntas.receita}`)
  }

  // Seção 3: Custos e despesas
  if (perguntas.custos_despesas) {
    secoes.push(`3. CUSTOS E DESPESAS OPERACIONAIS\n\n${perguntas.custos_despesas}`)
  }

  // Seção 4: EBITDA
  if (perguntas.ebitda) {
    secoes.push(`4. EBITDA E RESULTADO OPERACIONAL\n\n${perguntas.ebitda}`)
  }

  // Seção 5: Caixa
  if (perguntas.caixa) {
    secoes.push(`5. FLUXO DE CAIXA E LIQUIDEZ\n\n${perguntas.caixa}`)
  }

  // Seção 6: Endividamento
  if (perguntas.endividamento) {
    secoes.push(`6. ESTRUTURA DE CAPITAL E ENDIVIDAMENTO\n\n${perguntas.endividamento}`)
  }

  // Seção 7: Perspectivas
  if (perguntas.perspectivas) {
    secoes.push(`7. PERSPECTIVAS E RISCOS\n\n${perguntas.perspectivas}`)
  }

  // Rodapé
  secoes.push(
    `---\n` +
    `Este relatório foi elaborado com base nas demonstrações financeiras da entidade, ` +
    `seguindo as normas CPC/IFRS aplicáveis. As informações contidas dependem de revisão ` +
    `e aprovação formal antes da emissão oficial.\n` +
    `\n` +
    `Elaborado por: Sistema de Gestão Financeira CBF\n` +
    `Base normativa: CPC/IFRS com personalizações gerenciais documentadas`
  )

  return secoes.join('\n\n')
}
