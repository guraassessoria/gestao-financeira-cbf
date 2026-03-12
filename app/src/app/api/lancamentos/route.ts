import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Demonstracao, VisaoTemporal, Moeda, MapeamentoConta, SaldoMensal } from '@/types'
import {
  filtrarSaldosPorPeriodo,
  agregarSaldosPorConta,
  calcularVariacao,
  classificarVariacao,
  nomeMes,
} from '@/utils/financeiro'

const LINHAS_TOTAL = new Set([
  'Total Ativo Circulante',
  'Total Ativo Nao Circulante',
  'TOTAL DO ATIVO',
  'Total Passivo Circulante',
  'Total Passivo Nao Circulante',
  'Total Patrimonio Liquido',
  'TOTAL PASSIVO + PL',
  'Receita Operacional Liquida',
  'Lucro Bruto',
  'EBITDA',
  'Resultado Operacional (EBIT)',
  'Resultado Financeiro Liquido',
  'Resultado Antes do IR/CSLL',
  'Lucro/Prejuizo Liquido do Exercicio',
  'Caixa Gerado pelas Operacoes',
  'Caixa Atividades de Investimento',
  'Caixa Atividades de Financiamento',
  'Variacao Liquida de Caixa',
  'Caixa Final do Periodo',
  'Resultado Abrangente Total',
])

const SECOES_SEPARADOR = new Set([
  'ATIVO',
  'PASSIVO',
  'PATRIMONIO LIQUIDO',
  'RECEITAS',
  'CUSTOS',
  'DESPESAS',
  'FINANCEIRO',
  'IMPOSTOS',
  'RESULTADO',
  'OPERACIONAL',
  'INVESTIMENTO',
  'FINANCIAMENTO',
  'OCI',
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demonstracao = (searchParams.get('demonstracao') as Demonstracao) ?? 'DRE'
    const ano = Number(searchParams.get('ano') ?? new Date().getFullYear())
    const anoComparativo = Number(searchParams.get('anoComparativo') ?? ano - 1)
    const _visao = (searchParams.get('visao') as VisaoTemporal) ?? 'anual'
    const moeda = (searchParams.get('moeda') as Moeda) ?? 'BRL'
    const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : undefined
    const trimestre = searchParams.get('trimestre')
      ? Number(searchParams.get('trimestre'))
      : undefined

    const supabase = await createClient()

    // Buscar mapeamento
    const { data: mapeamentos, error: mapError } = await supabase
      .from('mapeamento_contas')
      .select('*')
      .eq('demonstracao', demonstracao)
      .order('ordem')

    if (mapError) {
      // Supabase não configurado ou tabelas não criadas — retornar estrutura vazia
      return NextResponse.json({ linhas: [], grafico: [], aviso: 'Supabase não configurado. Execute as migrations e carregue os dados.' })
    }

    // Buscar saldos dos dois anos
    const { data: saldosRaw, error: saldosError } = await supabase
      .from('vw_saldo_liquido_mensal')
      .select('*')
      .in('ano', [ano, anoComparativo])

    if (saldosError) {
      // Sem dados: retornar estrutura vazia mas com mapeamento
      return NextResponse.json({
        linhas: buildLinhasVazias(mapeamentos ?? []),
        grafico: [],
      })
    }

    const saldos: SaldoMensal[] = saldosRaw ?? []

    // Filtrar por período conforme visao
    const saldosAtuais = filtrarSaldosPorPeriodo(saldos, ano, mes, trimestre)
    const saldosAnteriores = filtrarSaldosPorPeriodo(
      saldos,
      anoComparativo,
      mes,
      trimestre
    )

    // Agregar por conta
    const saldosAtContaMapa = agregarSaldosPorConta(saldosAtuais)
    const saldosAntContaMapa = agregarSaldosPorConta(saldosAnteriores)

    // Aplicar conversão BRL/USD se necessário
    let taxaCambio = 1
    if (moeda === 'USD') {
      const { data: cambio } = await supabase
        .from('politica_cambio')
        .select('taxa_fechamento')
        .eq('ano', ano)
        .eq('mes', mes ?? 12)
        .eq('moeda_origem', 'BRL')
        .eq('moeda_destino', 'USD')
        .single()
      if (cambio?.taxa_fechamento) {
        taxaCambio = cambio.taxa_fechamento
      }
    }

    // Construir linhas
    const valoresPorLinhaAt = new Map<string, number>()
    const valoresPorLinhaAnt = new Map<string, number>()
    const linhas = []
    let ultimaSecao = ''

    for (const mapa of mapeamentos ?? []) {
      // Inserir separador de seção
      if (mapa.secao !== ultimaSecao && SECOES_SEPARADOR.has(mapa.secao)) {
        linhas.push({
          linha: mapa.secao,
          secao: mapa.secao,
          subsecao: '',
          ordem: mapa.ordem - 0.5,
          ehTotal: false,
          ehSubtotal: false,
          ehSeparador: true,
          valorAtual: 0,
          valorAnterior: 0,
          variacao: 0,
          variacaoPercentual: null,
          qualitativo: null,
        })
        ultimaSecao = mapa.secao
      }

      const valorAt = calcularValorLinhaComMapa(mapa, saldosAtContaMapa, valoresPorLinhaAt)
      const valorAnt = calcularValorLinhaComMapa(mapa, saldosAntContaMapa, valoresPorLinhaAnt)

      const valorAtFinal = valorAt * taxaCambio
      const valorAntFinal = valorAnt * taxaCambio

      valoresPorLinhaAt.set(mapa.linha, valorAtFinal)
      valoresPorLinhaAnt.set(mapa.linha, valorAntFinal)

      const { variacao, variacaoPercentual } = calcularVariacao(valorAtFinal, valorAntFinal)
      const ehDespesa = mapa.sinal_apresentacao === 'negativo'
      const qualitativo =
        variacaoPercentual !== null && Math.abs(variacaoPercentual) >= 5
          ? classificarVariacao(variacaoPercentual, ehDespesa)
          : null

      linhas.push({
        linha: mapa.linha,
        secao: mapa.secao,
        subsecao: mapa.subsecao,
        ordem: mapa.ordem,
        ehTotal: LINHAS_TOTAL.has(mapa.linha),
        ehSubtotal: mapa.linha.startsWith('Total') && !LINHAS_TOTAL.has(mapa.linha),
        ehSeparador: false,
        valorAtual: valorAtFinal,
        valorAnterior: valorAntFinal,
        variacao,
        variacaoPercentual,
        qualitativo,
      })
    }

    // Dados para gráfico mensal (apenas DRE)
    const grafico = demonstracao === 'DRE' ? buildGraficoMensal(saldos, ano, anoComparativo) : []

    return NextResponse.json({ linhas, grafico })
  } catch (e) {
    // Retornar resposta vazia com aviso em vez de 500 para melhor UX
    const msg = e instanceof Error ? e.message : 'Erro interno'
    const isConexao = msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('connect')
    if (isConexao) {
      return NextResponse.json({
        linhas: [],
        grafico: [],
        aviso: 'Supabase não acessível. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      })
    }
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

function calcularValorLinhaComMapa(
  mapa: MapeamentoConta,
  saldosPorConta: Map<string, { debito: number; credito: number; liquido: number }>,
  valoresPorLinha: Map<string, number>
): number {
  const sinal = mapa.sinal_apresentacao === 'negativo' ? -1 : 1

  if (mapa.regra_soma === 'regra') {
    // Linhas calculadas: soma de linhas anteriores definidas pelo contexto
    return valoresPorLinha.get(mapa.linha) ?? 0
  }

  if (mapa.regra_soma === 'faixa') {
    const inicio = mapa.conta_protheus_inicio
    const fim = mapa.conta_protheus_fim
    if (!inicio && !fim) return 0

    let soma = 0
    for (const [conta, saldo] of saldosPorConta) {
      const dentroFaixa =
        (!inicio || conta >= inicio) && (!fim || conta <= fim)
      if (dentroFaixa) {
        soma += saldo.liquido
      }
    }
    return soma * sinal
  }

  if (mapa.regra_soma === 'lista') {
    const lista = mapa.conta_protheus_lista ?? []
    let soma = 0
    for (const conta of lista) {
      soma += saldosPorConta.get(conta)?.liquido ?? 0
    }
    return soma * sinal
  }

  if (mapa.regra_soma === 'de_para') {
    // Para DRE: agrupar por conta_protheus_lista se disponível
    const lista = mapa.conta_protheus_lista ?? []
    if (lista.length === 0) {
      // Sem contas mapeadas ainda: retornar 0
      return 0
    }
    let soma = 0
    for (const conta of lista) {
      soma += saldosPorConta.get(conta)?.liquido ?? 0
    }
    return soma * sinal
  }

  return 0
}

function buildLinhasVazias(mapeamentos: MapeamentoConta[]) {
  const linhas = []
  let ultimaSecao = ''

  for (const mapa of mapeamentos) {
    if (mapa.secao !== ultimaSecao && SECOES_SEPARADOR.has(mapa.secao)) {
      linhas.push({
        linha: mapa.secao,
        secao: mapa.secao,
        subsecao: '',
        ordem: mapa.ordem - 0.5,
        ehTotal: false,
        ehSubtotal: false,
        ehSeparador: true,
        valorAtual: 0,
        valorAnterior: 0,
        variacao: 0,
        variacaoPercentual: null,
        qualitativo: null,
      })
      ultimaSecao = mapa.secao
    }

    linhas.push({
      linha: mapa.linha,
      secao: mapa.secao,
      subsecao: mapa.subsecao,
      ordem: mapa.ordem,
      ehTotal: LINHAS_TOTAL.has(mapa.linha),
      ehSubtotal: false,
      ehSeparador: false,
      valorAtual: 0,
      valorAnterior: 0,
      variacao: 0,
      variacaoPercentual: null,
      qualitativo: null,
    })
  }
  return linhas
}

function buildGraficoMensal(
  saldos: SaldoMensal[],
  ano: number,
  anoComparativo: number
) {
  const meses = Array.from({ length: 12 }, (_, i) => i + 1)
  return meses.map((mes) => {
    const at = saldos.filter((s) => s.ano === ano && s.mes === mes)
    const ant = saldos.filter((s) => s.ano === anoComparativo && s.mes === mes)
    const somaAt = at.reduce((acc, s) => acc + s.saldo_liquido, 0)
    const somaAnt = ant.reduce((acc, s) => acc + s.saldo_liquido, 0)
    return {
      periodo: nomeMes(mes),
      atual: Math.abs(somaAt),
      anterior: Math.abs(somaAnt),
    }
  })
}
