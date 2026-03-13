import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import type { LinhaDRECalculada } from '@/types'

export const maxDuration = 300

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
  valoresMensaisAtualBase: number[]
  valoresMensaisAnteriorBase: number[]
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
const MONTH_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

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
  // Comparação estrita para evitar agregação indevida entre contas/CC parecidos.
  return a === b
}

function contaMatchesMapeamento(
  contaLancamento: string | null | undefined,
  contaMapeada: string | null | undefined,
  classeContaMapeada: string | null | undefined,
  contaSuperiorByConta: Map<string, string>
): boolean {
  const lanc = normalizeComparableCode(contaLancamento)
  const mapa = normalizeComparableCode(contaMapeada)
  if (!lanc || !mapa) return false
  if (lanc === mapa) return true

  const classe = (classeContaMapeada || '').toLowerCase()
  if (!classe.startsWith('sint')) {
    return false
  }

  // Se a conta mapeada é sintética, aceita contas analíticas descendentes via CT1.
  const visited = new Set<string>()
  let atual = lanc
  while (atual && !visited.has(atual)) {
    visited.add(atual)
    const superior = contaSuperiorByConta.get(atual)
    if (!superior) break
    if (superior === mapa) return true
    atual = superior
  }

  return false
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

function normalizeContaNaturezaCode(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
}

function inferCondNormalByConta(contaCode: string | null | undefined, condNormal: string | null | undefined): 'Devedora' | 'Credora' {
  const cond = (condNormal || '').toLowerCase()
  if (cond.startsWith('dev')) return 'Devedora'
  if (cond.startsWith('cred')) return 'Credora'

  // Regras por grupo de conta sem considerar separadores (ex.: 3.1, 3.1.01 -> 31, 3101)
  const code = normalizeContaNaturezaCode(contaCode)
  if (code.startsWith('31')) return 'Credora' // Receita
  if (code.startsWith('2')) return 'Credora' // Passivo
  if (code.startsWith('32') || code.startsWith('33') || code.startsWith('34')) return 'Devedora' // Custos/Despesas
  if (code.startsWith('1')) return 'Devedora' // Ativo

  return 'Credora'
}

function getSaldoNatureza(
  saldo: Saldo,
  condNormal: string | null | undefined,
  contaCode: string | null | undefined
): number {
  const natureza = inferCondNormalByConta(contaCode, condNormal)
  if (natureza === 'Devedora') {
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
  const mensalAtual = [...no.valoresMensaisAtualBase]
  const mensalAnterior = [...no.valoresMensaisAnteriorBase]

  for (const filho of no.filhos) {
    const totals = consolidarValores(filho)
    atual += totals.atual
    anterior += totals.anterior
    for (let i = 0; i < MONTH_KEYS.length; i++) {
      mensalAtual[i] += filho.valoresMensaisAtualBase[i] || 0
      mensalAnterior[i] += filho.valoresMensaisAnteriorBase[i] || 0
    }
  }

  no.valorAtualBase = atual
  no.valorAnteriorBase = anterior
  no.valoresMensaisAtualBase = mensalAtual
  no.valoresMensaisAnteriorBase = mensalAnterior

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
    valoresMensaisAtual: no.valoresMensaisAtualBase,
    valoresMensaisAnterior: no.valoresMensaisAnteriorBase,
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
    const PAGE_SIZE = 1000
    const FETCH_CONCURRENCY = 8

    // Caminho rápido: reaproveita períodos já calculados no upload CT2 (evita varrer toda a tabela)
    let periodosMensaisDisponiveis: string[] = []
    const { data: latestCt2Upload } = await supabase
      .from('upload_logs')
      .select('periodos')
      .eq('tipo_arquivo', 'CT2')
      .eq('status', 'ok')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const periodosFromLog = latestCt2Upload?.periodos
    if (typeof periodosFromLog === 'string' && periodosFromLog.trim() !== '') {
      try {
        const parsed = JSON.parse(periodosFromLog)
        if (Array.isArray(parsed)) {
          periodosMensaisDisponiveis = parsed
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .sort((a, b) => periodToDate(b).getTime() - periodToDate(a).getTime())
        }
      } catch {
        periodosMensaisDisponiveis = []
      }
    }

    // Fallback: sem log válido, busca períodos com paginação paralela
    if (periodosMensaisDisponiveis.length === 0) {
      const { count: totalLancRows, error: periodCountError } = await supabase
        .from('lancamentos_contabeis')
        .select('*', { count: 'exact', head: true })

      if (periodCountError) {
        return NextResponse.json({ error: periodCountError.message }, { status: 500 })
      }

      const totalPages = Math.ceil((totalLancRows || 0) / PAGE_SIZE)
      const allPeriodRows: { periodo: string }[] = []

      for (let pageStart = 0; pageStart < totalPages; pageStart += FETCH_CONCURRENCY) {
        const pageEnd = Math.min(pageStart + FETCH_CONCURRENCY, totalPages)
        const pageIndexes: number[] = []
        for (let page = pageStart; page < pageEnd; page++) {
          pageIndexes.push(page)
        }

        const pageResults = await Promise.all(
          pageIndexes.map((page) =>
            supabase
              .from('lancamentos_contabeis')
              .select('periodo')
              .order('id', { ascending: true })
              .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
          )
        )

        for (const result of pageResults) {
          if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 500 })
          }
          if (result.data?.length) {
            allPeriodRows.push(...result.data)
          }
        }
      }

      periodosMensaisDisponiveis = Array.from(new Set(allPeriodRows.map((r) => r.periodo))).sort((a, b) => {
        return periodToDate(b).getTime() - periodToDate(a).getTime()
      })
    }

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

    const periodosExibicao = periodosDisponiveis

    const periodoAtual =
      requestedPeriod && periodosExibicao.includes(requestedPeriod)
        ? requestedPeriod
        : periodosExibicao[0]

    const idxAtual = periodosExibicao.indexOf(periodoAtual)
    const periodoComparativo = idxAtual >= 0 && idxAtual < periodosExibicao.length - 1
      ? periodosExibicao[idxAtual + 1]
      : null

    const periodosConsultaAtual = periodosMensaisDisponiveis.filter((periodo) => periodo.startsWith(`${periodoAtual}-`))

    const periodosConsultaComparativo = !periodoComparativo
      ? []
      : periodosMensaisDisponiveis.filter((periodo) => periodo.startsWith(`${periodoComparativo}-`))

    const periodosConsulta = [...new Set([...periodosConsultaAtual, ...periodosConsultaComparativo])]

    const [estruturaRes, deParaRes, contasRes, lancamentosRes, entidadesRes, centrosCustoRes] = await Promise.all([
      supabase
        .from('estrutura_dre')
        .select('id, codigo_conta, descricao_conta, codigo_cta_superior, nivel, nivel_visualizacao')
        .order('id', { ascending: true }),
      supabase
        .from('de_para_dre')
        .select('codigo_linha_dre, codigo_conta_contabil, codigo_centro_custo'),
      supabase
        .from('contas_contabeis')
        .select('cod_conta, cond_normal, classe, cta_superior'),
      (async () => {
        // Lê lançamentos com paginação paralela (limite de 1000 rows por query no Supabase)
        const { count: totalRows, error: countError } = await supabase
          .from('lancamentos_contabeis')
          .select('*', { count: 'exact', head: true })
          .in('periodo', periodosConsulta)

        if (countError) return { data: null, error: countError }

        const totalPages = Math.ceil((totalRows || 0) / PAGE_SIZE)
        let allLancamentos: any[] = []

        for (let pageStart = 0; pageStart < totalPages; pageStart += FETCH_CONCURRENCY) {
          const pageEnd = Math.min(pageStart + FETCH_CONCURRENCY, totalPages)
          const pageIndexes: number[] = []
          for (let page = pageStart; page < pageEnd; page++) {
            pageIndexes.push(page)
          }

          const pageResults = await Promise.all(
            pageIndexes.map((page) =>
              supabase
                .from('lancamentos_contabeis')
                .select('periodo, cta_debito, cta_credito, c_custo_deb, c_custo_crd, ocorren_deb, ocorren_crd, valor')
                .in('periodo', periodosConsulta)
                .order('id', { ascending: true })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
            )
          )

          for (const result of pageResults) {
            if (result.error) return { data: null, error: result.error }
            if (result.data?.length) {
              allLancamentos = allLancamentos.concat(result.data)
            }
          }
        }

        return { data: allLancamentos, error: null }
      })(),
      supabase
        .from('entidades_dre')
        .select('codigo, descricao'),
      supabase
        .from('centros_custo')
        .select('cod_cc, ocorrencia'),
    ])

    if (estruturaRes.error) return NextResponse.json({ error: estruturaRes.error.message }, { status: 500 })
    if (deParaRes.error) return NextResponse.json({ error: deParaRes.error.message }, { status: 500 })
    if (contasRes.error) return NextResponse.json({ error: contasRes.error.message }, { status: 500 })
    if (lancamentosRes.error) return NextResponse.json({ error: lancamentosRes.error.message }, { status: 500 })
    if (entidadesRes.error) return NextResponse.json({ error: entidadesRes.error.message }, { status: 500 })
    if (centrosCustoRes.error) return NextResponse.json({ error: centrosCustoRes.error.message }, { status: 500 })

    const estrutura = estruturaRes.data || []
    const dePara = deParaRes.data || []
    const contas = contasRes.data || []
    const lancamentos = lancamentosRes.data || []
    const entidades = entidadesRes.data || []
    const centrosCusto = centrosCustoRes.data || []

    // Mapa: cod_cc normalizado → código de ocorrência normalizado (do campo "Ocorrencia" do CTT)
    const ocorrenciaByCc = new Map<string, string>()
    for (const cc of centrosCusto) {
      if (cc.ocorrencia) {
        ocorrenciaByCc.set(normalizeCode(cc.cod_cc), normalizeComparableCode(cc.ocorrencia))
      }
    }

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
    const classeByConta = new Map<string, string>()
    const contaSuperiorByConta = new Map<string, string>()
    for (const c of contas) {
      const codNorm = normalizeComparableCode(c.cod_conta)
      condNormalByConta.set(codNorm, c.cond_normal || 'Credora')
      classeByConta.set(codNorm, c.classe || '')
      if (c.cta_superior) {
        contaSuperiorByConta.set(codNorm, normalizeComparableCode(c.cta_superior))
      }
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
    const acumuladoPorLinhaMensalAtual = new Map<string, number[]>()
    const acumuladoPorLinhaMensalAnterior = new Map<string, number[]>()

    const somarNoMapa = (mapa: Map<string, number>, key: string, valor: number) => {
      mapa.set(key, (mapa.get(key) || 0) + valor)
    }

    const somarNoMapaMensal = (mapa: Map<string, number[]>, key: string, monthIndex: number, valor: number) => {
      const arr = mapa.get(key) || Array.from({ length: MONTH_KEYS.length }, () => 0)
      arr[monthIndex] = (arr[monthIndex] || 0) + valor
      mapa.set(key, arr)
    }

    const getValorMapeamento = (
      periodo: string,
      contaRaw: string,
      ccRaw: string,
      classeContaMapeada: string | null | undefined
    ): number => {
      const conta = normalizeComparableCode(contaRaw)
      const cc = normalizeComparableCode(ccRaw)

      if (cc) {
        const saldoEntidadeExato = saldoContaEntidadePeriodo.get(`${periodo}|${normalizeCode(contaRaw)}|${normalizeCode(ccRaw)}`)
        if (saldoEntidadeExato) {
          const cond = condNormalByConta.get(conta)
          return getSaldoNatureza(saldoEntidadeExato, cond, contaRaw)
        }

        const entidadeEntries = saldoContaEntidadeEntriesByPeriodo.get(periodo) || []
        let totalEntidade = 0
        let encontrouEntidade = false

        for (const entry of entidadeEntries) {
          if (!contaMatchesMapeamento(entry.conta, conta, classeContaMapeada, contaSuperiorByConta) || !codesMatch(entry.entidade, cc)) {
            continue
          }
          encontrouEntidade = true
          const cond =
            condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
            condNormalByConta.get(conta)
          totalEntidade += getSaldoNatureza(entry.saldo, cond, entry.conta)
        }

        if (encontrouEntidade) {
          return totalEntidade
        }

        const saldoCcExato = saldoContaCcPeriodo.get(`${periodo}|${normalizeCode(contaRaw)}|${normalizeCode(ccRaw)}`)
        if (saldoCcExato) {
          const cond = condNormalByConta.get(conta)
          return getSaldoNatureza(saldoCcExato, cond, contaRaw)
        }

        const entries = saldoContaCcEntriesByPeriodo.get(periodo) || []
        let total = 0

        for (const entry of entries) {
          const ocorrenciaDoCC = ocorrenciaByCc.get(normalizeCode(entry.cc))
          if (!contaMatchesMapeamento(entry.conta, conta, classeContaMapeada, contaSuperiorByConta) || !codesMatch(ocorrenciaDoCC, cc)) {
            continue
          }
          const cond =
            condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
            condNormalByConta.get(conta)
          total += getSaldoNatureza(entry.saldo, cond, entry.conta)
        }

        return total
      }

      const saldoContaExato = saldoContaPeriodo.get(`${periodo}|${normalizeCode(contaRaw)}`)
      if (saldoContaExato) {
        const cond = condNormalByConta.get(conta)
        return getSaldoNatureza(saldoContaExato, cond, contaRaw)
      }

      const entries = saldoContaEntriesByPeriodo.get(periodo) || []
      let total = 0

      for (const entry of entries) {
        if (!contaMatchesMapeamento(entry.conta, conta, classeContaMapeada, contaSuperiorByConta)) {
          continue
        }
        const cond =
          condNormalByConta.get(normalizeComparableCode(entry.conta)) ||
          condNormalByConta.get(conta)
        total += getSaldoNatureza(entry.saldo, cond, entry.conta)
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
      const classeContaMapeada = classeByConta.get(conta) || null

      if (!linha) {
        continue
      }

      if (visao === 'mensal') {
        let valorAtualTotal = 0
        for (let i = 0; i < MONTH_KEYS.length; i++) {
          const periodoMes = `${periodoAtual}-${MONTH_KEYS[i]}`
          const valorMes = getValorMapeamento(periodoMes, conta, cc, classeContaMapeada)
          valorAtualTotal += valorMes
          somarNoMapaMensal(acumuladoPorLinhaMensalAtual, linha, i, valorMes)
        }
        somarNoMapa(acumuladoPorLinhaAtual, linha, valorAtualTotal)

        if (periodoComparativo) {
          let valorAnteriorTotal = 0
          for (let i = 0; i < MONTH_KEYS.length; i++) {
            const periodoMesAnterior = `${periodoComparativo}-${MONTH_KEYS[i]}`
            const valorMesAnterior = getValorMapeamento(periodoMesAnterior, conta, cc, classeContaMapeada)
            valorAnteriorTotal += valorMesAnterior
            somarNoMapaMensal(acumuladoPorLinhaMensalAnterior, linha, i, valorMesAnterior)
          }
          somarNoMapa(acumuladoPorLinhaAnterior, linha, valorAnteriorTotal)
        }
      } else {
        let valorAtualTotal = 0
        for (const periodo of periodosConsultaAtual) {
          valorAtualTotal += getValorMapeamento(periodo, conta, cc, classeContaMapeada)
        }
        somarNoMapa(acumuladoPorLinhaAtual, linha, valorAtualTotal)

        if (periodoComparativo) {
          let valorAnteriorTotal = 0
          for (const periodo of periodosConsultaComparativo) {
            valorAnteriorTotal += getValorMapeamento(periodo, conta, cc, classeContaMapeada)
          }
          somarNoMapa(acumuladoPorLinhaAnterior, linha, valorAnteriorTotal)
        }
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
      valoresMensaisAtualBase: acumuladoPorLinhaMensalAtual.get(e.codigo_conta) || Array.from({ length: MONTH_KEYS.length }, () => 0),
      valoresMensaisAnteriorBase: acumuladoPorLinhaMensalAnterior.get(e.codigo_conta) || Array.from({ length: MONTH_KEYS.length }, () => 0),
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
