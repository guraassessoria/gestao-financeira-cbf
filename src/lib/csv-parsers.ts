import { readFile } from 'fs/promises'

type PythonResult<T> = {
  success: boolean
  data?: T
  error?: string
}

type EstruturaDREParse = {
  linhas: Array<{
    codigo_conta: string
    descricao_conta: string
    codigo_cta_superior: string | null
    descricao_superior: string | null
    nivel: number
    nivel_visualizacao: number
  }>
  total_linhas: number
  erros: string[]
}

type DeParaParse = {
  mappings: Array<{
    codigo_conta_contabil: string
    codigo_linha_dre: string
    codigo_centro_custo: string | null
    observacao: string | null
  }>
  total_mappings: number
  erros: string[]
}

type CT2Parse = {
  lancamentos: Array<Record<string, unknown>>
  periodos: string[]
  total_lancamentos: number
  total_valor: number
  erros: string[]
}

function normalizeKey(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectDelimiter(content: string): string {
  const firstLines = content.split(/\r?\n/).slice(0, 10).join('\n')
  return (firstLines.match(/;/g) || []).length >= (firstLines.match(/,/g) || []).length ? ';' : ','
}

function splitCsvLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((v) => v.trim())
}

function findHeaderRow(rows: string[][], expectedCol: string): number {
  const normalizedExpected = normalizeKey(expectedCol)
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].some((c) => normalizeKey(c).includes(normalizedExpected))) {
      return i
    }
  }
  return 0
}

async function readCsv(path: string): Promise<{ headers: string[]; records: Record<string, string>[] }> {
  const buffer = await readFile(path)
  const utf8Content = buffer.toString('utf8')
  const replacementCount = (utf8Content.match(/\uFFFD/g) || []).length
  const content = replacementCount === 0 ? utf8Content : buffer.toString('latin1')
  const delimiter = detectDelimiter(content)
  const rows = content
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => splitCsvLine(line, delimiter))

  const headerIdx = findHeaderRow(rows, 'Filial')
  const headers = rows[headerIdx]?.map((h) => h.trim()) || []
  const records: Record<string, string>[] = []

  for (const row of rows.slice(headerIdx + 1)) {
    if (!row.some((c) => c.trim())) continue
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = row[index]?.trim() || ''
    })
    records.push(record)
  }

  return { headers, records }
}

function pick(record: Record<string, string>, keys: string[], defaultValue = ''): string {
  const normalizedEntries = Object.entries(record).map(([k, v]) => [normalizeKey(k), v] as const)
  const normalizedMap = new Map(normalizedEntries)

  for (const key of keys) {
    const normalizedKey = normalizeKey(key)
    const exact = normalizedMap.get(normalizedKey)
    if (exact && exact.trim() !== '') return exact.trim()

    for (const [header, value] of normalizedEntries) {
      if (normalizedKey && header.includes(normalizedKey) && value.trim() !== '') return value.trim()
    }

    const tokens = normalizedKey.split(' ').filter(Boolean)
    if (tokens.length > 0) {
      for (const [header, value] of normalizedEntries) {
        const headerTokens = new Set(header.split(' ').filter(Boolean))
        if (tokens.every((token) => headerTokens.has(token)) && value.trim() !== '') {
          return value.trim()
        }
      }
    }
  }

  return defaultValue
}

function toInt(value: string, defaultValue = 0): number {
  const parsed = Number.parseInt(String(value).trim(), 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

function parseValor(value: string): number {
  const normalized = String(value || '').trim().replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isNaN(parsed) ? 0 : parsed
}

function parseDate(value: string): string {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) {
    return new Date().toISOString().slice(0, 10)
  }
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

function periodo(dateStr: string): string {
  return dateStr ? dateStr.slice(0, 7) : new Date().toISOString().slice(0, 7)
}

function nivelConta(cod: string): number {
  const trimmed = cod.trim()
  const thresholds = [1, 2, 3, 4, 6, 9]
  for (let i = 0; i < thresholds.length; i += 1) {
    if (trimmed.length <= thresholds[i]) return i + 1
  }
  return thresholds.length + 1
}

function normalizarClasseConta(val: string): string {
  const v = normalizeKey(val)
  if (['analitica', 'analitico'].includes(v)) return 'Analítica'
  if (['sintetica', 'sintetico'].includes(v)) return 'Sintética'
  return val.trim()
}

function normalizarClasseCC(val: string): string {
  const v = normalizeKey(val)
  if (['analitica', 'analitico'].includes(v)) return 'Analítico'
  if (['sintetica', 'sintetico'].includes(v)) return 'Sintético'
  return val.trim()
}

function normalizarClasseCV0(val: string): string {
  const v = normalizeKey(val)
  if (v === 'analitica') return 'Analítica'
  if (v === 'sintetica') return 'Sintética'
  return val.trim()
}

export async function parseCT1TS(path: string): Promise<PythonResult<Array<Record<string, unknown>>>> {
  try {
    const { records } = await readCsv(path)
    const contas = records
      .map((r) => {
        const cod = pick(r, ['Cod Conta'])
        if (!cod) return null
        return {
          filial: pick(r, ['Filial'], '01'),
          cod_conta: cod,
          descricao: pick(r, ['Desc Moeda 1']),
          classe: normalizarClasseConta(pick(r, ['Classe Conta'], 'Analítica')),
          cond_normal: pick(r, ['Cond Normal'], 'Devedora'),
          cta_superior: pick(r, ['Cta Superior']) || null,
          aceita_cc: pick(r, ['Aceita CC'], 'N').toUpperCase() === 'S',
          aceita_item: pick(r, ['Aceita Item'], 'N').toUpperCase() === 'S',
          aceita_clvl: pick(r, ['Aceita CLVL'], 'N').toUpperCase() === 'S',
          nivel: nivelConta(cod),
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    return { success: true, data: contas }
  } catch (error) {
    return { success: false, error: `Erro ao ler CT1: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

export async function parseCTTTS(path: string): Promise<PythonResult<Array<Record<string, unknown>>>> {
  try {
    const { records } = await readCsv(path)
    const ccs = records
      .map((r) => {
        const cod = pick(r, ['C Custo'])
        if (!cod) return null
        const cond = pick(r, ['Cond Normal'])
        return {
          filial: pick(r, ['Filial'], '01'),
          cod_cc: cod,
          descricao: pick(r, ['Desc Moeda 1']),
          classe: normalizarClasseCC(pick(r, ['Classe'], 'Analítico')),
          cond_normal: cond === 'Receita' || cond === 'Despesa' ? cond : 'Despesa',
          cc_superior: pick(r, ['CC Superior']) || null,
          ocorrencia: pick(r, ['Ocorrencia']) || null,
          bloqueado: ['s', 'sim', 'bloqueado', '1'].includes(normalizeKey(pick(r, ['CC Bloq']))),
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    return { success: true, data: ccs }
  } catch (error) {
    return { success: false, error: `Erro ao ler CTT: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

export async function parseCV0TS(path: string): Promise<PythonResult<Array<Record<string, unknown>>>> {
  try {
    const { records } = await readCsv(path)
    const entidades = records
      .map((r) => {
        const cod = pick(r, ['Codigo'])
        if (!cod) return null
        return {
          filial: pick(r, ['Filial'], '01'),
          plano_contab: pick(r, ['Plano Contáb', 'Plano Contab']),
          item: pick(r, ['Item']),
          codigo: cod,
          descricao: pick(r, ['Descrição', 'Descricao']),
          classe: normalizarClasseCV0(pick(r, ['Classe'], 'Analítica')),
          cond_normal: pick(r, ['Cond Normal'], 'Devedora'),
          bloqueada: ['s', 'sim', '1'].includes(normalizeKey(pick(r, ['Bloqueada']))),
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    return { success: true, data: entidades }
  } catch (error) {
    return { success: false, error: `Erro ao ler CV0: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

export async function parseEstruturaDRETS(path: string): Promise<PythonResult<EstruturaDREParse>> {
  try {
    const { records } = await readCsv(path)
    const linhas: EstruturaDREParse['linhas'] = []
    const erros: string[] = []

    records.forEach((r, index) => {
      const codigo = pick(r, ['codigo_conta', 'codigo conta', 'cod_conta', 'codigo', 'cod'])
      const descricao = pick(r, ['descricao_conta', 'descricao conta dre', 'descricao conta', 'descricao', 'desc_conta', 'conta'])
      if (!codigo || !descricao) {
        erros.push(`Linha ${index + 1}: codigo_conta/descricao_conta obrigatórios`)
        return
      }
      const superior = pick(r, ['codigo_cta_superior', 'codigo cta superior', 'cta_superior', 'conta_superior'])
      const descSuperior = pick(r, ['descricao_superior', 'descricao conta superior', 'descricao cta superior', 'desc_superior'])
      let nivelViz = toInt(pick(r, ['nivel_visualizacao', 'nivel visualizacao', 'nivel de visualizacao', 'nivel_viz'], '1'), 1)
      if (![1, 2, 3].includes(nivelViz)) nivelViz = 1

      linhas.push({
        codigo_conta: codigo,
        descricao_conta: descricao,
        codigo_cta_superior: superior || null,
        descricao_superior: descSuperior || null,
        nivel: toInt(pick(r, ['nivel', 'nível'], '1'), 1),
        nivel_visualizacao: nivelViz,
      })
    })

    return { success: true, data: { linhas, total_linhas: linhas.length, erros } }
  } catch (error) {
    return { success: false, error: `Erro ao ler Estrutura DRE: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

export async function parseDeParaDRETS(path: string): Promise<PythonResult<DeParaParse>> {
  try {
    const { records } = await readCsv(path)
    const mappings: DeParaParse['mappings'] = []
    const erros: string[] = []

    records.forEach((r, index) => {
      const conta = pick(r, ['codigo_conta_contabil', 'codigo conta contabil', 'conta_protheus', 'cod_conta', 'conta'])
      const descricaoContaDre = pick(r, ['descricao conta dre', 'descricao conta'])

      let linhaDre = pick(
        r,
        [
          'codigo_linha_dre',
          'codigo linha dre',
          'codigo_dre',
          'linha_dre',
          'cod_dre',
          'codigo de para',
        ]
      )

      const matchDescricao = descricaoContaDre.match(/^\s*(\d+)\s*-\|-\s*/)
      if (matchDescricao?.[1]) {
        linhaDre = matchDescricao[1]
      }

      if (!conta || !linhaDre) {
        erros.push(`Linha ${index + 1}: codigo_conta_contabil/codigo_linha_dre obrigatórios`)
        return
      }

      mappings.push({
        codigo_conta_contabil: conta,
        codigo_linha_dre: linhaDre,
        codigo_centro_custo: pick(r, ['codigo_centro_custo', 'codigo centro custo', 'cod_cc', 'centro_custo']) || null,
        observacao: pick(r, ['observacao', 'obs', 'descricao']) || null,
      })
    })

    return { success: true, data: { mappings, total_mappings: mappings.length, erros } }
  } catch (error) {
    return { success: false, error: `Erro ao ler De-Para DRE: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

export async function parseCT2TS(path: string): Promise<PythonResult<CT2Parse>> {
  try {
    const { records } = await readCsv(path)
    const lancamentos: Array<Record<string, unknown>> = []
    const erros: string[] = []
    const periodos = new Set<string>()

    records.forEach((r, index) => {
      const tipo = pick(r, ['Tipo Lcto'])
      if (tipo === 'Cont.Hist') return

      const ctaDebito = pick(r, ['Cta Debito']) || null
      const ctaCredito = pick(r, ['Cta Credito']) || null
      if (!ctaDebito && !ctaCredito) return

      const dataLcto = parseDate(pick(r, ['Data Lcto']))
      if (!dataLcto) {
        erros.push(`Linha ${index + 1}: data inválida '${pick(r, ['Data Lcto'])}'`)
        return
      }

      const periodoRef = periodo(dataLcto)
      periodos.add(periodoRef)

      const valor = parseValor(pick(r, ['Valor'], '0'))
      const valorMoeda1 = parseValor(pick(r, ['Valor Moeda1'], String(valor)))

      lancamentos.push({
        filial: pick(r, ['Filial'], '01'),
        data_lcto: dataLcto,
        periodo: periodoRef,
        numero_lote: pick(r, ['Numero Lote']),
        sub_lote: pick(r, ['Sub Lote']),
        numero_doc: pick(r, ['Numero Doc']),
        moeda: pick(r, ['Moeda Lancto'], '01'),
        tipo_lcto: tipo,
        cta_debito: ctaDebito,
        cta_credito: ctaCredito,
        valor,
        hist_pad: pick(r, ['Hist Pad']) || null,
        hist_lanc: pick(r, ['Hist Lanc']) || null,
        c_custo_deb: pick(r, ['C Custo Deb']) || null,
        c_custo_crd: pick(r, ['C Custo Crd']) || null,
        ocorren_deb: pick(r, ['Ocorren Deb']) || null,
        ocorren_crd: pick(r, ['Ocorren Crd']) || null,
        valor_moeda1: valorMoeda1,
        origem: pick(r, ['Origem']) || null,
      })
    })

    return {
      success: true,
      data: {
        lancamentos,
        periodos: [...periodos].sort(),
        total_lancamentos: lancamentos.length,
        total_valor: lancamentos.reduce((sum, item) => sum + Number(item.valor || 0), 0),
        erros,
      },
    }
  } catch (error) {
    return { success: false, error: `Erro ao ler CT2: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}