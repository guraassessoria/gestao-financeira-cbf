import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// VisaoTemporal and Moeda used in request body typing
import { calcularIndicadores } from '@/utils/financeiro'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ano = Number(searchParams.get('ano') ?? new Date().getFullYear())
    const anoComparativo = Number(searchParams.get('anoComparativo') ?? ano - 1)

    const supabase = await createClient()

    // Buscar saldos agregados para calcular indicadores
    const { data: saldos } = await supabase
      .from('vw_saldo_liquido_mensal')
      .select('*')
      .in('ano', [ano, anoComparativo])

    if (!saldos || saldos.length === 0) {
      // Retornar indicadores zerados mas calculados
      const dadosVazios = {
        receitaLiquida: 0,
        lucroLiquido: 0,
        ebitda: 0,
        ebit: 0,
        ativoTotal: 0,
        ativoCirculante: 0,
        passivoCirculante: 0,
        passivoTotal: 0,
        patrimonioLiquido: 0,
        emprestimosCP: 0,
        emprestimosLP: 0,
        jurosDevidos: 0,
        caixaOperacional: 0,
      }
      return NextResponse.json({ indicadores: calcularIndicadores(dadosVazios) })
    }

    // Para calcular indicadores precisamos dos saldos agregados por conta
    // e do mapeamento BP/DRE. Aqui fazemos uma versão simplificada
    // buscando o mapeamento e calculando via faixa de contas.

    const { data: mapeamentoDRE } = await supabase
      .from('mapeamento_contas')
      .select('*')
      .eq('demonstracao', 'DRE')
      .order('ordem')

    const { data: mapeamentoBP } = await supabase
      .from('mapeamento_contas')
      .select('*')
      .eq('demonstracao', 'BP')
      .order('ordem')

    // Agregar saldos do ano atual
    const saldosAno = saldos.filter((s) => s.ano === ano)
    const saldosAnoAnt = saldos.filter((s) => s.ano === anoComparativo)

    const saldosAnoMapa = agregarPorConta(saldosAno)
    const saldosAnoAntMapa = agregarPorConta(saldosAnoAnt)

    // Extrair valores de linhas DRE
    const dreValores = calcularValoresDRE(mapeamentoDRE ?? [], saldosAnoMapa)
    const dreValoresAnt = calcularValoresDRE(mapeamentoDRE ?? [], saldosAnoAntMapa)

    // Extrair valores BP
    const bpValores = calcularValoresBP(mapeamentoBP ?? [], saldosAnoMapa)
    const bpValoresAnt = calcularValoresBP(mapeamentoBP ?? [], saldosAnoAntMapa)

    const dados = {
      receitaLiquida: dreValores.receitaLiquida,
      lucroLiquido: dreValores.lucroLiquido,
      ebitda: dreValores.ebitda,
      ebit: dreValores.ebit,
      ativoTotal: bpValores.ativoTotal,
      ativoCirculante: bpValores.ativoCirculante,
      passivoCirculante: bpValores.passivoCirculante,
      passivoTotal: bpValores.passivoTotal,
      patrimonioLiquido: bpValores.patrimonioLiquido,
      emprestimosCP: bpValores.emprestimosCP,
      emprestimosLP: bpValores.emprestimosLP,
      jurosDevidos: dreValores.despesasFinanceiras,
      caixaOperacional: 0, // Precisa DFC
      receitaLiquidaAnterior: dreValoresAnt.receitaLiquida,
      lucroLiquidoAnterior: dreValoresAnt.lucroLiquido,
      ebitdaAnterior: dreValoresAnt.ebitda,
      patrimonioLiquidoAnterior: bpValoresAnt.patrimonioLiquido,
    }

    const indicadores = calcularIndicadores(dados)
    return NextResponse.json({ indicadores })
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

function agregarPorConta(
  saldos: { cod_conta: string; saldo_liquido: number }[]
): Map<string, number> {
  const mapa = new Map<string, number>()
  for (const s of saldos) {
    mapa.set(s.cod_conta, (mapa.get(s.cod_conta) ?? 0) + s.saldo_liquido)
  }
  return mapa
}

function somarFaixa(
  saldosMapa: Map<string, number>,
  inicio?: string,
  fim?: string
): number {
  let soma = 0
  for (const [conta, saldo] of saldosMapa) {
    if ((!inicio || conta >= inicio) && (!fim || conta <= fim)) {
      soma += saldo
    }
  }
  return soma
}

function calcularValoresDRE(
  mapeamentos: { linha: string; conta_protheus_inicio?: string; conta_protheus_fim?: string; sinal_apresentacao: string }[],
  saldosMapa: Map<string, number>
) {
  const resultado = {
    receitaLiquida: 0,
    lucroLiquido: 0,
    ebitda: 0,
    ebit: 0,
    despesasFinanceiras: 0,
  }

  for (const m of mapeamentos) {
    const sinal = m.sinal_apresentacao === 'negativo' ? -1 : 1
    const valor = somarFaixa(saldosMapa, m.conta_protheus_inicio, m.conta_protheus_fim) * sinal

    if (m.linha === 'Receita Operacional Liquida') resultado.receitaLiquida = valor
    if (m.linha === 'Lucro/Prejuizo Liquido do Exercicio') resultado.lucroLiquido = valor
    if (m.linha === 'EBITDA') resultado.ebitda = valor
    if (m.linha === 'Resultado Operacional (EBIT)') resultado.ebit = valor
    if (m.linha === 'Despesas Financeiras') resultado.despesasFinanceiras = Math.abs(valor)
  }

  return resultado
}

function calcularValoresBP(
  mapeamentos: { linha: string; conta_protheus_inicio?: string; conta_protheus_fim?: string; sinal_apresentacao: string }[],
  saldosMapa: Map<string, number>
) {
  const resultado = {
    ativoTotal: 0,
    ativoCirculante: 0,
    passivoCirculante: 0,
    passivoTotal: 0,
    patrimonioLiquido: 0,
    emprestimosCP: 0,
    emprestimosLP: 0,
  }

  for (const m of mapeamentos) {
    const sinal = m.sinal_apresentacao === 'negativo' ? -1 : 1
    const valor = somarFaixa(saldosMapa, m.conta_protheus_inicio, m.conta_protheus_fim) * sinal

    if (m.linha === 'TOTAL DO ATIVO') resultado.ativoTotal = valor
    if (m.linha === 'Total Ativo Circulante') resultado.ativoCirculante = valor
    if (m.linha === 'Total Passivo Circulante') resultado.passivoCirculante = valor
    if (m.linha === 'Total Patrimonio Liquido') resultado.patrimonioLiquido = valor
    if (m.linha === 'Emprestimos e Financiamentos CP') resultado.emprestimosCP = valor
    if (m.linha === 'Emprestimos e Financiamentos LP') resultado.emprestimosLP = valor
    if (m.linha === 'TOTAL PASSIVO + PL') resultado.passivoTotal = valor
  }

  return resultado
}
