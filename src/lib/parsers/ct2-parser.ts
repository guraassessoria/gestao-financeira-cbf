import { Lancamento } from '../types'

export function parseCT2(content: string): Lancamento[] {
  // Skip first 2 lines: TOTVS export has a metadata row followed by an empty row before the header
  const lines = content.split('\n').slice(2)
  const result: Lancamento[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split(';')
    if (cols.length < 13) continue

    const tipo_lcto = cols[6]?.trim() ?? ''
    // Only accounting facts
    if (tipo_lcto !== 'Partida Dobrada') continue

    const valorStr = cols[9]?.trim() ?? '0'
    const valor = parseFloat(valorStr) || 0

    result.push({
      filial: cols[0]?.trim() ?? '',
      data_lcto: cols[1]?.trim() ?? '',
      numero_lote: cols[2]?.trim() ?? '',
      sub_lote: cols[3]?.trim() ?? '',
      numero_doc: cols[4]?.trim() ?? '',
      tipo_lcto,
      cta_debito: cols[7]?.trim() ?? '',
      cta_credito: cols[8]?.trim() ?? '',
      valor,
      hist_lanc: cols[11]?.trim() ?? '',
      c_custo_deb: cols[12]?.trim() ?? '',
      c_custo_crd: cols[13]?.trim() ?? '',
      origem: cols[21]?.trim() ?? '',
    })
  }

  return result
}
