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
  valorAtualBase: number
  valorAnteriorBase: number
  filhos: NoDRE[]
}

function normalizeCode(value: string | null | undefined): string {
  return String(value || '').trim().replace(/[^0-9A-Za-z]/g, '')
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

function montarArvore(estrutura: NoDRE[]): NoDRE[] {
  const byCodigo = new Map<string, NoDRE>()

  for (const linha of estrutura) {
    byCodigo.set(linha.codigoConta, { ...linha, filhos: [] })
  }

  const raizes: NoDRE[] = []

  for (const linha of byCodigo.values()) {
    if (linha.codigoSuperior && byCodigo.has(linha.codigoSuperior)) {
      byCodigo.get(linha.codigoSuperior)!.filhos.push(linha)
    } else {
      raizes.push(linha)
    }
  }

  return raizes
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
    valor: no.valorAtualBase,
    valorAnterior,
    variacaoAbsoluta,
    variacaoPercentual,
    filhos: no.filhos.map(toLinhaDRE),
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

    const { data: periodRows, error: periodError } = await supabase
      .from('lancamentos_contabeis')
      .select('periodo')

    if (periodError) {
      return NextResponse.json({ error: periodError.message }, { status: 500 })
    }

    const periodosDisponiveis = Array.from(new Set((periodRows || []).map((r) => r.periodo))).sort((a, b) => {
      return periodToDate(b).getTime() - periodToDate(a).getTime()
    })

    if (periodosDisponiveis.length === 0) {
      return NextResponse.json(
        {
          periodosDisponiveis: [],
          periodo: null,
          periodoComparativo: null,
          linhas: [],
          mensagem: 'Nenhum lançamento contábil encontrado. Faça upload do CT2.',
        },
        { status: 200 }
      )
    }

    const periodoAtual =
      requestedPeriod && periodosDisponiveis.includes(requestedPeriod)
        ? requestedPeriod
        : periodosDisponiveis[0]

    const idxAtual = periodosDisponiveis.indexOf(periodoAtual)
    const periodoComparativo = idxAtual >= 0 && idxAtual < periodosDisponiveis.length - 1
      ? periodosDisponiveis[idxAtual + 1]
      : null

    const periodosConsulta = periodoComparativo
      ? [periodoAtual, periodoComparativo]
      : [periodoAtual]

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
      supabase
        .from('lancamentos_contabeis')
        .select('periodo, cta_debito, cta_credito, c_custo_deb, c_custo_crd, valor')
        .in('periodo', periodosConsulta),
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
          periodosDisponiveis,
          periodo: periodoAtual,
          periodoComparativo,
          linhas: [],
          mensagem: 'Estrutura DRE não carregada. Faça upload do arquivo Estrutura DRE.',
        },
        { status: 200 }
      )
    }

    if (dePara.length === 0) {
      return NextResponse.json(
        {
          periodosDisponiveis,
          periodo: periodoAtual,
          periodoComparativo,
          linhas: [],
          mensagem: 'De-Para DRE não carregado. Faça upload do arquivo De-Para DRE.',
        },
        { status: 200 }
      )
    }

    const condNormalByConta = new Map<string, string>()
    for (const c of contas) {
      condNormalByConta.set(normalizeCode(c.cod_conta), c.cond_normal || 'Credora')
    }

    const saldoContaPeriodo = new Map<string, Saldo>()
    const saldoContaCcPeriodo = new Map<string, Saldo>()

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
      }
    }

    const acumuladoPorLinhaAtual = new Map<string, number>()
    const acumuladoPorLinhaAnterior = new Map<string, number>()

    const somarNoMapa = (mapa: Map<string, number>, key: string, valor: number) => {
      mapa.set(key, (mapa.get(key) || 0) + valor)
    }

    for (const m of dePara) {
      const conta = normalizeCode(m.codigo_conta_contabil)
      const linhaNorm = normalizeCode(m.codigo_linha_dre)

      let linha = estruturaByCodeNormalized.get(linhaNorm)
      if (!linha) {
        const linhaViaEntidade = linhaFromEntidadeByCodigo.get(linhaNorm)
        if (linhaViaEntidade) {
          linha = estruturaByCodeNormalized.get(normalizeCode(linhaViaEntidade))
        }
      }

      const cc = normalizeCode(m.codigo_centro_custo)

      if (!linha) {
        continue
      }

      const condNormal = condNormalByConta.get(conta)

      const saldoAtual = cc
        ? saldoContaCcPeriodo.get(`${periodoAtual}|${conta}|${cc}`) || { debito: 0, credito: 0 }
        : saldoContaPeriodo.get(`${periodoAtual}|${conta}`) || { debito: 0, credito: 0 }

      const valorAtual = getSaldoNatureza(saldoAtual, condNormal)
      somarNoMapa(acumuladoPorLinhaAtual, linha, valorAtual)

      if (periodoComparativo) {
        const saldoAnterior = cc
          ? saldoContaCcPeriodo.get(`${periodoComparativo}|${conta}|${cc}`) || { debito: 0, credito: 0 }
          : saldoContaPeriodo.get(`${periodoComparativo}|${conta}`) || { debito: 0, credito: 0 }
        const valorAnterior = getSaldoNatureza(saldoAnterior, condNormal)
        somarNoMapa(acumuladoPorLinhaAnterior, linha, valorAnterior)
      }
    }

    const nosBase: NoDRE[] = estrutura.map((e) => ({
      codigoConta: e.codigo_conta,
      descricao: fixMojibake(e.descricao_conta),
      nivel: e.nivel,
      nivelVisualizacao: (e.nivel_visualizacao as 1 | 2 | 3) || 1,
      codigoSuperior: e.codigo_cta_superior,
      valorAtualBase: acumuladoPorLinhaAtual.get(e.codigo_conta) || 0,
      valorAnteriorBase: acumuladoPorLinhaAnterior.get(e.codigo_conta) || 0,
      filhos: [],
    }))

    const arvore = montarArvore(nosBase)
    for (const raiz of arvore) {
      consolidarValores(raiz)
    }

    const linhas = arvore.map(toLinhaDRE)

    return NextResponse.json({
      periodosDisponiveis,
      periodo: periodoAtual,
      periodoComparativo,
      linhas,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
