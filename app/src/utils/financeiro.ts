import type {
  IndicadorFinanceiro,
  SaldoMensal,
  MapeamentoConta,
} from '@/types'

// ============================================================
// Formatadores
// ============================================================

export function formatarMoeda(valor: number, moeda: 'BRL' | 'USD' = 'BRL'): string {
  const locale = moeda === 'BRL' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatarPercentual(valor: number | null, casas = 1): string {
  if (valor === null || !isFinite(valor)) return '-'
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(casas)}%`
}

export function nomeMes(mes: number): string {
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  return meses[mes - 1] ?? String(mes)
}

export function nomeTrimestre(trimestre: number): string {
  return `${trimestre}T`
}

// ============================================================
// Calculos de variacao
// ============================================================

export function calcularVariacao(
  valorAtual: number,
  valorAnterior: number
): { variacao: number; variacaoPercentual: number | null } {
  const variacao = valorAtual - valorAnterior
  const variacaoPercentual =
    valorAnterior !== 0 ? (variacao / Math.abs(valorAnterior)) * 100 : null
  return { variacao, variacaoPercentual }
}

export function classificarVariacao(
  variacaoPercentual: number | null,
  ehDespesa: boolean = false
): string {
  if (variacaoPercentual === null) return '-'
  const limite = 5
  if (Math.abs(variacaoPercentual) < limite) return 'Estável'
  const cresceu = variacaoPercentual > 0
  if (ehDespesa) {
    return cresceu ? 'Aumento de custos' : 'Redução de custos'
  }
  return cresceu ? 'Crescimento' : 'Redução'
}

// ============================================================
// Agrupamento temporal
// ============================================================

export function filtrarSaldosPorPeriodo(
  saldos: SaldoMensal[],
  ano: number,
  mes?: number,
  trimestre?: number
): SaldoMensal[] {
  return saldos.filter((s) => {
    if (s.ano !== ano) return false
    if (mes !== undefined) return s.mes === mes
    if (trimestre !== undefined) {
      const mesInicio = (trimestre - 1) * 3 + 1
      const mesFim = trimestre * 3
      return s.mes >= mesInicio && s.mes <= mesFim
    }
    return true
  })
}

export function agregarSaldosPorConta(
  saldos: SaldoMensal[]
): Map<string, { debito: number; credito: number; liquido: number }> {
  const mapa = new Map<string, { debito: number; credito: number; liquido: number }>()
  for (const s of saldos) {
    const atual = mapa.get(s.cod_conta) ?? { debito: 0, credito: 0, liquido: 0 }
    atual.debito += s.total_debito
    atual.credito += s.total_credito
    atual.liquido += s.saldo_liquido
    mapa.set(s.cod_conta, atual)
  }
  return mapa
}

// ============================================================
// Calculo de valor de linha com base no mapeamento
// ============================================================

export function calcularValorLinha(
  mapeamento: MapeamentoConta,
  saldosPorConta: Map<string, { debito: number; credito: number; liquido: number }>,
  valoresPorLinha: Map<string, number>
): number {
  const sinal = mapeamento.sinal_apresentacao === 'negativo' ? -1 : 1

  if (mapeamento.regra_soma === 'regra') {
    // Linhas de total calculadas a partir de outras linhas
    return valoresPorLinha.get(mapeamento.linha) ?? 0
  }

  if (mapeamento.regra_soma === 'faixa') {
    const inicio = mapeamento.conta_protheus_inicio
    const fim = mapeamento.conta_protheus_fim
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

  if (mapeamento.regra_soma === 'lista') {
    const lista = mapeamento.conta_protheus_lista ?? []
    let soma = 0
    for (const conta of lista) {
      soma += saldosPorConta.get(conta)?.liquido ?? 0
    }
    return soma * sinal
  }

  return 0
}

// ============================================================
// Indicadores Financeiros V1 (empresa de servicos)
// ============================================================

export interface DadosIndicadores {
  receitaLiquida: number
  lucroLiquido: number
  ebitda: number
  ebit: number
  ativoTotal: number
  ativoCirculante: number
  passivoCirculante: number
  passivoTotal: number
  patrimonioLiquido: number
  emprestimosCP: number
  emprestimosLP: number
  jurosDevidos: number
  caixaOperacional: number
  receitaLiquidaAnterior?: number
  lucroLiquidoAnterior?: number
  ebitdaAnterior?: number
  patrimonioLiquidoAnterior?: number
}

export function calcularIndicadores(dados: DadosIndicadores): IndicadorFinanceiro[] {
  const {
    receitaLiquida,
    lucroLiquido,
    ebitda,
    ebit,
    ativoTotal,
    ativoCirculante,
    passivoCirculante,
    passivoTotal,
    patrimonioLiquido,
    emprestimosCP,
    emprestimosLP,
    jurosDevidos,
    caixaOperacional,
    receitaLiquidaAnterior,
    ebitdaAnterior,
    patrimonioLiquidoAnterior,
  } = dados

  const divida = emprestimosCP + emprestimosLP

  const margemEbitda = receitaLiquida !== 0 ? (ebitda / receitaLiquida) * 100 : null
  const margemLiquida = receitaLiquida !== 0 ? (lucroLiquido / receitaLiquida) * 100 : null
  const roe =
    patrimonioLiquido !== 0 ? (lucroLiquido / patrimonioLiquido) * 100 : null
  const roa = ativoTotal !== 0 ? (lucroLiquido / ativoTotal) * 100 : null
  const liquidezCorrente =
    passivoCirculante !== 0 ? ativoCirculante / passivoCirculante : null
  const endividamentoGeral = ativoTotal !== 0 ? (passivoTotal / ativoTotal) * 100 : null
  const composicaoEndivCP =
    divida !== 0 ? (emprestimosCP / divida) * 100 : null
  const coberturaJuros = jurosDevidos !== 0 ? ebit / jurosDevidos : null
  const conversaoCaixaOp = ebitda !== 0 ? (caixaOperacional / ebitda) * 100 : null

  function status(
    valor: number | null,
    bom: (v: number) => boolean,
    atencao: (v: number) => boolean
  ): IndicadorFinanceiro['status'] {
    if (valor === null) return 'neutro'
    if (bom(valor)) return 'bom'
    if (atencao(valor)) return 'atencao'
    return 'critico'
  }

  const anteriores = {
    margemEbitda:
      receitaLiquidaAnterior && ebitdaAnterior
        ? (ebitdaAnterior / receitaLiquidaAnterior) * 100
        : null,
    roe:
      patrimonioLiquidoAnterior && dados.lucroLiquidoAnterior
        ? (dados.lucroLiquidoAnterior / patrimonioLiquidoAnterior) * 100
        : null,
  }

  return [
    {
      codigo: 'MARGEM_EBITDA',
      nome: 'Margem EBITDA',
      descricao: 'EBITDA / Receita Liquida',
      valor: margemEbitda,
      valorAnterior: anteriores.margemEbitda,
      variacao:
        margemEbitda !== null && anteriores.margemEbitda !== null
          ? margemEbitda - anteriores.margemEbitda
          : null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        margemEbitda !== null
          ? margemEbitda >= 20
            ? 'Margem saudavel para empresa de servicos'
            : margemEbitda >= 10
              ? 'Margem em nivel de atencao'
              : 'Margem abaixo do esperado'
          : null,
      status: status(
        margemEbitda,
        (v) => v >= 20,
        (v) => v >= 10
      ),
    },
    {
      codigo: 'MARGEM_LIQUIDA',
      nome: 'Margem Liquida',
      descricao: 'Lucro Liquido / Receita Liquida',
      valor: margemLiquida,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        margemLiquida !== null
          ? margemLiquida >= 10
            ? 'Rentabilidade positiva'
            : margemLiquida >= 0
              ? 'Empresa lucrativa com margem reduzida'
              : 'Empresa em prejuizo'
          : null,
      status: status(
        margemLiquida,
        (v) => v >= 10,
        (v) => v >= 0
      ),
    },
    {
      codigo: 'ROE',
      nome: 'ROE',
      descricao: 'Retorno sobre Patrimonio Liquido',
      valor: roe,
      valorAnterior: anteriores.roe,
      variacao:
        roe !== null && anteriores.roe !== null ? roe - anteriores.roe : null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        roe !== null
          ? roe >= 15
            ? 'Retorno elevado ao acionista'
            : roe >= 5
              ? 'Retorno moderado'
              : 'Retorno insuficiente'
          : null,
      status: status(
        roe,
        (v) => v >= 15,
        (v) => v >= 5
      ),
    },
    {
      codigo: 'ROA',
      nome: 'ROA',
      descricao: 'Retorno sobre Ativo Total',
      valor: roa,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        roa !== null
          ? roa >= 5
            ? 'Boa eficiencia dos ativos'
            : roa >= 0
              ? 'Utilizacao dos ativos pode melhorar'
              : 'Retorno negativo sobre ativos'
          : null,
      status: status(
        roa,
        (v) => v >= 5,
        (v) => v >= 0
      ),
    },
    {
      codigo: 'LIQUIDEZ_CORRENTE',
      nome: 'Liquidez Corrente',
      descricao: 'Ativo Circulante / Passivo Circulante',
      valor: liquidezCorrente,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: 'x',
      qualitativo:
        liquidezCorrente !== null
          ? liquidezCorrente >= 1.5
            ? 'Boa capacidade de pagamento de curto prazo'
            : liquidezCorrente >= 1
              ? 'Liquidez adequada com margem limitada'
              : 'Risco de liquidez no curto prazo'
          : null,
      status: status(
        liquidezCorrente,
        (v) => v >= 1.5,
        (v) => v >= 1
      ),
    },
    {
      codigo: 'ENDIVIDAMENTO_GERAL',
      nome: 'Endividamento Geral',
      descricao: 'Passivo Total / Ativo Total',
      valor: endividamentoGeral,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        endividamentoGeral !== null
          ? endividamentoGeral <= 40
            ? 'Baixo nivel de alavancagem'
            : endividamentoGeral <= 65
              ? 'Alavancagem moderada'
              : 'Alto endividamento'
          : null,
      status: status(
        endividamentoGeral,
        (v) => v <= 40,
        (v) => v <= 65
      ),
    },
    {
      codigo: 'COMPOSICAO_CP',
      nome: 'Composicao CP',
      descricao: 'Divida Curto Prazo / Divida Total',
      valor: composicaoEndivCP,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        composicaoEndivCP !== null
          ? composicaoEndivCP <= 30
            ? 'Perfil de vencimento confortavel'
            : composicaoEndivCP <= 60
              ? 'Atencao ao vencimento de curto prazo'
              : 'Concentracao alta no curto prazo'
          : null,
      status: status(
        composicaoEndivCP,
        (v) => v <= 30,
        (v) => v <= 60
      ),
    },
    {
      codigo: 'COBERTURA_JUROS',
      nome: 'Cobertura de Juros',
      descricao: 'EBIT / Despesas de Juros',
      valor: coberturaJuros,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: 'x',
      qualitativo:
        coberturaJuros !== null
          ? coberturaJuros >= 3
            ? 'Boa capacidade de cobertura de juros'
            : coberturaJuros >= 1.5
              ? 'Cobertura de juros limitada'
              : 'Risco de nao cobertura de juros'
          : null,
      status: status(
        coberturaJuros,
        (v) => v >= 3,
        (v) => v >= 1.5
      ),
    },
    {
      codigo: 'CONVERSAO_CAIXA',
      nome: 'Conversao de Caixa Op.',
      descricao: 'Caixa Operacional (CFO) / EBITDA',
      valor: conversaoCaixaOp,
      valorAnterior: null,
      variacao: null,
      variacaoPercentual: null,
      unidade: '%',
      qualitativo:
        conversaoCaixaOp !== null
          ? conversaoCaixaOp >= 70
            ? 'Alta conversao de lucro em caixa'
            : conversaoCaixaOp >= 40
              ? 'Conversao moderada'
              : 'Baixa conversao de lucro em caixa'
          : null,
      status: status(
        conversaoCaixaOp,
        (v) => v >= 70,
        (v) => v >= 40
      ),
    },
  ]
}
