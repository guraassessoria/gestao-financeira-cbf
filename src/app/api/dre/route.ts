import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import type { LinhaDRECalculada } from '@/types'

type Saldo = {
  debito: number
  credito: number
}

type NoDRE = {
  codigoConta: string
  descricao: string
  nivel: number
  nivelVisualizacao: 1 | 2 | 3
  codigoSuperior: string | null
  ordem: number
  valorAtualBase: number
  valorAnteriorBase: number
  filhos: NoDRE[]
}

type SaldoContaEntry = {
  conta: string
  saldo: Saldo
}

type SaldoContaCcEntry = {
  conta: string
  cc: string
  saldo: Saldo
}

type SaldoContaEntidadeEntry = {
  conta: string
  entidade: string
  saldo: Saldo
}

type VisaoPeriodo = 'anual' | 'mensal'

function normalizeCode(value: string | null | undefined): string {
  return String(value || '').trim().replace(/[^0-9A-Za-z]/g, '')
}

function normalizeComparableCode(value: string | null | undefined): string {
  return normalizeCode(value).replace(/^0+(?=\d)/, '')
}

function codesMatch(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = normalizeComparableCode(left)
  const b = normalizeComparableCode(right)
  if (!a || !b) return false
  return a === b || a.startsWith(b) || b.startsWith(a)
}

function fixMojibake(value: string | null | undefined): string {
  const text = String(value || '')
  if (!/[ÃÂ]/.test(text)) return text
  try {
    return Buffer.from(text, 'latin1').toString('utf8')
  } catch {
    return text
  }
}

function periodToDate(periodo: string): Date {
  const [y, m] = periodo.split('-').map(Number)
  return new Date(y, (m || 1) - 1, 1)
}

function normalizeVisaoPeriodo(value: string | null): VisaoPeriodo {
  return value === 'mensal' ? 'mensal' : 'anual'
}

function getSaldoNatureza(
  saldo: Saldo,
  condNormal: string | null | undefined
): number {
  if ((condNormal || '').toLowerCase().startsWith('dev')) {
    return saldo.debito - saldo.credito
  }
  return saldo.credito - saldo.debito
}

function addSaldo(map: Map<string, Saldo>, key: string, tipo: 'debito' | 'credito', valor: number) {
  const atual = map.get(key) || { debito: 0, credito: 0 }
  atual[tipo] += Number(valor || 0)
  map.set(key, atual)
}

function montarArvore(estrutura: NoDRE[]): { raizes: NoDRE[]; byCodigo: Map<string, NoDRE> } {
  const byCodigo = new Map<string, NoDRE>()

  for (const linha of estrutura) {
    byCodigo.set(linha.codigoConta, { ...linha, filhos: [] })
  }

  const raizes: NoDRE[] = []

  for (const linha of estrutura) {
    const no = byCodigo.get(linha.codigoConta)!

    if (no.codigoSuperior && byCodigo.has(no.codigoSuperior)) {
      byCodigo.get(no.codigoSuperior)!.filhos.push(no)
    } else {
      raizes.push(no)
    }
  }

  return { raizes, byCodigo }
}

function consolidarValores(no: NoDRE): { atual: number; anterior: number } {
  let atual = no.valorAtualBase
  let anterior = no.valorAnteriorBase

  for (const filho of no.filhos) {
    const totals = consolidarValores(filho)
    atual += totals.atual
    anterior += totals.anterior
  }

  no.valorAtualBase = atual
  no.valorAnteriorBase = anterior

  return { atual, anterior }
}

function toLinhaDRE(no: NoDRE): LinhaDRECalculada {
  const valorAnterior = Number.isFinite(no.valorAnteriorBase) ? no.valorAnteriorBase : null
  const variacaoAbsoluta = valorAnterior === null ? null : no.valorAtualBase - valorAnterior
  const variacaoPercentual =
    valorAnterior === null || valorAnterior === 0
      ? null
      : (variacaoAbsoluta! / Math.abs(valorAnterior)) * 100

  return {
    codigoConta: no.codigoConta,
    descricao: no.descricao,
    nivel: no.nivel,
    nivelVisualizacao: no.nivelVisualizacao,
    codigoSuperior: no.codigoSuperior,
    temFilhos: no.filhos.length > 0,
    valor: no.valorAtualBase,
    valorAnterior,
    variacaoAbsoluta,
    variacaoPercentual,
    filhos: [],
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const url = new URL(request.url)
    const requestedPeriod = url.searchParams.get('periodo')
    const visao = normalizeVisaoPeriodo(url.searchParams.get('visao'))

    // Busca todos os períodos distintos com paginação (Supabase limita 1000 rows por query)
    let allPeriodRows: { periodo: string }[] = []
    let periodPage = 0
    const PAGE_SIZE = 1000
    while (true) {
      const { data: pageData, error: periodError } = await supabase
        .from('lancamentos_contabeis')
        .select('periodo')
        .range(periodPage * PAGE_SIZE, (periodPage + 1) * PAGE_SIZE - 1)
      if (periodError) {
        return NextResponse.json({ error: periodError.message }, { status: 500 })
      }
      if (!pageData || pageData.length === 0) break
      allPeriodRows = allPeriodRows.concat(pageData)
      if (pageData.length < PAGE_SIZE) break
      periodPage++
    }
    const periodRows = allPeriodRows

    const periodosMensaisDisponiveis = Array.from(new Set((periodRows || []).map((r) => r.periodo))).sort((a, b) => {
      return periodToDate(b).getTime() - periodToDate(a).getTime()
    })

    const periodosDisponiveis = Array.from(
      new Set(periodosMensaisDisponiveis.map((periodo) => periodo.slice(0, 4)))
    ).sort((a, b) => Number(b) - Number(a))

    if (periodosMensaisDisponiveis.length === 0) {
      return NextResponse.json(
        {
          periodosDisponiveis: [],
          periodo: null,
          periodoComparativo: null,
          visao,
          linhas: [],
          mensagem: 'Nenhum lançamento contábil encontrado. Faça upload do CT2.',
        },
        { status: 200 }
      )
    }

    const periodosExibicao = visao === 'mensal' ? periodosMensaisDisponiveis : periodosDisponiveis

    const periodoAtual =
      requestedPeriod && periodosExibicao.includes(requestedPeriod)
        ? requestedPeriod
        : periodosExibicao[0]

    const idxAtual = periodosExibicao.indexOf(periodoAtual)
    const periodoComparativo = idxAtual >= 0 && idxAtual < periodosExibicao.length - 1
      ? periodosExibicao[idxAtual + 1]
      : null

    const periodosConsultaAtual = visao === 'mensal'
      ? [periodoAtual]
      : periodosMensaisDisponiveis.filter((periodo) => periodo.startsWith(`${periodoAtual}-`))

    const periodosConsultaComparativo = !periodoComparativo
      ? []
      : visao === 'mensal'
        ? [periodoComparativo]
        : periodosMensaisDisponiveis.filter((periodo) => periodo.startsWith(`${periodoComparativo}-`))

    const periodosConsulta = [...new Set([...periodosConsultaAtual, ...periodosConsultaComparativo])]

    const [estruturaRes, deParaRes, contasRes, lancamentosRes, entidadesRes] = await Promise.all([
      supabase
        .from('estrutura_dre')
        .select('id, codigo_conta, descricao_conta, codigo_cta_superior, nivel, nivel_visualizacao')
        .order('id', { ascending: true }),
      supabase
        .from('de_para_dre')
        .select('codigo_linha_dre, codigo_conta_contabil, codigo_centro_custo'),
      supabase
        .from('contas_contabeis')
        .select('cod_conta, cond_normal'),
      (async () => {
        // Lê lançamentos com paginação — Supabase limita 1000 rows por query
        let allLancamentos: any[] = []
        let lancPage = 0
        while (true) {
          const { data: pageData, error: lancError } = await supabase
            .from('lancamentos_contabeis')
            .select('periodo, cta_debito, cta_credito, c_custo_deb, c_custo_crd, ocorren_deb, ocorren_crd, valor')
            .in('periodo', periodosConsulta)
            .range(lancPage * PAGE_SIZE, (lancPage + 1) * PAGE_SIZE - 1)
          if (lancError) return { data: null, error: lancError }
          if (!pageData || pageData.length === 0) break
          allLancamentos = allLancamentos.concat(pageData)
          if (pageData.length < PAGE_SIZE) break
          lancPage++
        }
        return { data: allLancamentos, error: null }
      })(),
      supabase
        .from('entidades_dre')
        .select('codigo, descricao'),
    ])

    if (estruturaRes.error) return NextResponse.json({ error: estruturaRes.error.message }, { status: 500 })
    if (deParaRes.error) return NextResponse.json({ error: deParaRes.error.message }, { status: 500 })
    if (contasRes.error) return NextResponse.json({ error: contasRes.error.message }, { status: 500 })
    if (lancamentosRes.error) return NextResponse.json({ error: lancamentosRes.error.message }, { status: 500 })
    if (entidadesRes.error) return NextResponse.json({ error: entidadesRes.error.message }, { status: 500 })

    const estrutura = estruturaRes.data || []
    const dePara = deParaRes.data || []
    const contas = contasRes.data || []
    const lancamentos = lancamentosRes.data || []
    const entidades = entidadesRes.data || []

    const estruturaByCodeNormalized = new Map<string, string>()
    for (const e of estrutura) {
      estruturaByCodeNormalized.set(normalizeCode(e.codigo_conta), e.codigo_conta)
    }

    const linhaFromEntidadeByCodigo = new Map<string, string>()
    for (const entidade of entidades) {
      const codigoEntidade = normalizeCode(entidade.codigo)
      const descricao = fixMojibake(entidade.descricao)
      const match = descricao.match(/^\s*(\d+)\s*-\|-\s*/)
      if (codigoEntidade && match?.[1]) {
        linhaFromEntidadeByCodigo.set(codigoEntidade, match[1])
      }
    }

    if (estrutura.length === 0) {
      return NextResponse.json(
        {
          periodosDisponiveis: periodosExibicao,
          periodo: periodoAtual,
          periodoComparativo,
          visao,
          linhas: [],
          mensagem: 'Estrutura DRE não carregada. Faça upload do arquivo Estrutura DRE.',
        },
        { status: 200 }
      )
    }

    if (dePara.length === 0) {
      return NextResponse.json(
        {
          periodosDisponiveis: periodosExibicao,
          periodo: periodoAtual,
          periodoComparativo,
          visao,
          linhas: [],
          mensagem: 'De-Para DRE não carregado. Faça upload do arquivo De-Para DRE.',
        },
        { status: 200 }
      )
    }

    const condNormalByConta = new Map<string, string>()
    for (const c of contas) {
      condNormalByConta.set(normalizeComparableCode(c.cod_conta), c.cond_normal || 'Credora')
    }

    const saldoContaPeriodo = new Map<string, Saldo>()
    const saldoContaCcPeriodo = new Map<string, Saldo>()
    const saldoContaEntidadePeriodo = new Map<string, Saldo>()

    for (const l of lancamentos) {
      const periodo = l.periodo
      const valor = Number(l.valor || 0)

      if (l.cta_debito) {
        const contaDeb = normalizeCode(l.cta_debito)
        addSaldo(saldoContaPeriodo, `${periodo}|${contaDeb}`, 'debito', valor)
        if (l.c_custo_deb) {
          addSaldo(
            saldoContaCcPeriodo,
            `${periodo}|${contaDeb}|${normalizeCode(l.c_custo_deb)}`,
            'debito',
            valor
          )
        }
        if (l.ocorren_deb) {
          addSaldo(
            saldoContaEntidadePeriodo,
            `${periodo}|${contaDeb}|${normalizeCode(l.ocorren_deb)}`,
            'debito',
            valor
          )
        }
      }

      if (l.cta_credito) {
        const contaCred = normalizeCode(l.cta_credito)
        addSaldo(saldoContaPeriodo, `${periodo}|${contaCred}`, 'credito', valor)
        if (l.c_custo_crd) {
          addSaldo(
            saldoContaCcPeriodo,
            `${periodo}|${contaCred}|${normalizeCode(l.c_custo_crd)}`,
            'credito',
            valor
          )
        }
        if (l.ocorren_crd) {
          addSaldo(
            saldoContaEntidadePeriodo,
            `${periodo}|${contaCred}|${normalizeCode(l.ocorren_crd)}`,
            'credito',
            valor
          )
        }
      }
    }

    const saldoContaEntriesByPeriodo = new Map<string, SaldoContaEntry[]>()
    for (const [key, saldo] of saldoContaPeriodo.entries()) {
      const [periodo, conta] = key.split('|')
      if (!saldoContaEntriesByPeriodo.has(periodo)) {
        saldoContaEntriesByPeriodo.set(periodo, [])
      }
      saldoContaEntriesByPeriodo.get(periodo)!.push({ conta, saldo })
    }

    const saldoContaCcEntriesByPeriodo = new Map<string, SaldoContaCcEntry[]>()
    for (const [key, saldo] of saldoContaCcPeriodo.entries()) {
      const [periodo, conta, cc] = key.split('|')
      if (!saldoContaCcEntriesByPeriodo.has(periodo)) {
        saldoContaCcEntriesByPeriodo.set(periodo, [])
      }
      saldoContaCcEntriesByPeriodo.get(periodo)!.push({ conta, cc, saldo })
    }

    const saldoContaEntidadeEntriesByPeriodo = new Map<string, SaldoContaEntidadeEntry[]>()
    for (const [key, saldo] of saldoContaEntidadePeriodo.entries()) {
      const [periodo, conta, entidade] = key.split('|')
      if (!saldoContaEntidadeEntriesByPeriodo.has(periodo)) {
        saldoContaEntidadeEntriesByPeriodo.set(periodo, [])
      }
      saldoContaEntidadeEntriesByPeriodo.get(periodo)!.push({ conta, entidade, saldo })
    }

    const acumuladoPorLinhaAtual = new Map<string, number>()
    const acumuladoPorLinhaAnterior = new Map<string, number>()

    const somarNoMapa = (mapa: Map<string, number>, key: string, valor: number) => {
      mapa.set(key, (mapa.get(key) || 0) + valor)
    }

    const getValorMapeamento = (periodo: string, contaRaw: string, ccRaw: string): number => {
      const conta = normalizeComparableCode(contaRaw)
      const cc = normalizeComparableCode(ccRaw)

      if (cc) {
        const saldoEntidadeExato = saldoContaEntidadePeriodo.get(`${periodo}|${normalizeCode(contaRaw)}|${normalizeCode(ccRaw)}`)
        if (saldoEntidadeExato) {
          const cond = condNormalByConta.get(conta)
          return getSaldoNatureza(saldoEntidadeExato, cond)
        }

        const entidadeEntries = saldoContaEntidadeEntriesByPeriodo.get(periodo) || []
        let totalEntidade = 0
        let encontrouEntidade = false

        for (const entry of entidadeEntries) {
          if (!codesMatch(entry.conta, conta) || !codesMatch(entry.entidade, cc)) {
            continue
          }
          encontrouEntidade = true
          const cond =
            condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
            condNormalByConta.get(conta)
          totalEntidade += getSaldoNatureza(entry.saldo, cond)
        }

        if (encontrouEntidade) {
          return totalEntidade
        }

        const saldoCcExato = saldoContaCcPeriodo.get(`${periodo}|${normalizeCode(contaRaw)}|${normalizeCode(ccRaw)}`)
        if (saldoCcExato) {
          const cond = condNormalByConta.get(conta)
          return getSaldoNatureza(saldoCcExato, cond)
        }

        const entries = saldoContaCcEntriesByPeriodo.get(periodo) || []
        let total = 0

        for (const entry of entries) {
          if (!codesMatch(entry.conta, conta) || !codesMatch(entry.cc, cc)) {
            continue
          }
          const cond =
            condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
            condNormalByConta.get(conta)
          total += getSaldoNatureza(entry.saldo, cond)
        }

        return total
      }

      const saldoContaExato = saldoContaPeriodo.get(`${periodo}|${normalizeCode(contaRaw)}`)
      if (saldoContaExato) {
        const cond = condNormalByConta.get(conta)
        return getSaldoNatureza(saldoContaExato, cond)
      }

      const entries = saldoContaEntriesByPeriodo.get(periodo) || []
      let total = 0

      for (const entry of entries) {
        if (!codesMatch(entry.conta, conta)) {
          continue
        }
        const cond =
          condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
          condNormalByConta.get(conta)
        total += getSaldoNatureza(entry.saldo, cond)
      }

      return total
    }

    for (const m of dePara) {
      const conta = normalizeComparableCode(m.codigo_conta_contabil)
      const linhaNorm = normalizeCode(m.codigo_linha_dre)

      let linha = estruturaByCodeNormalized.get(linhaNorm)
      if (!linha) {
        const linhaViaEntidade = linhaFromEntidadeByCodigo.get(linhaNorm)
        if (linhaViaEntidade) {
          linha = estruturaByCodeNormalized.get(normalizeCode(linhaViaEntidade))
        }
      }

      const cc = normalizeComparableCode(m.codigo_centro_custo)

      if (!linha) {
        continue
      }

      let valorAtualTotal = 0
      for (const periodo of periodosConsultaAtual) {
        valorAtualTotal += getValorMapeamento(periodo, conta, cc)
      }
      somarNoMapa(acumuladoPorLinhaAtual, linha, valorAtualTotal)

      if (periodoComparativo) {
        let valorAnteriorTotal = 0
        for (const periodo of periodosConsultaComparativo) {
          valorAnteriorTotal += getValorMapeamento(periodo, conta, cc)
        }
        somarNoMapa(acumuladoPorLinhaAnterior, linha, valorAnteriorTotal)
      }
    }

    const nosBase: NoDRE[] = estrutura.map((e) => ({
      codigoConta: e.codigo_conta,
      descricao: fixMojibake(e.descricao_conta),
      nivel: e.nivel,
      nivelVisualizacao: (e.nivel_visualizacao as 1 | 2 | 3) || 1,
      codigoSuperior: e.codigo_cta_superior,
      ordem: e.id,
      valorAtualBase: acumuladoPorLinhaAtual.get(e.codigo_conta) || 0,
      valorAnteriorBase: acumuladoPorLinhaAnterior.get(e.codigo_conta) || 0,
      filhos: [],
    }))

    const { raizes, byCodigo } = montarArvore(nosBase)
    for (const raiz of raizes) {
      consolidarValores(raiz)
    }

    const linhas = estrutura.map((linha) => toLinhaDRE(byCodigo.get(linha.codigo_conta)!))

    return NextResponse.json({
      periodosDisponiveis: periodosExibicao,
      periodo: periodoAtual,
      periodoComparativo,
      visao,
      linhas,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
