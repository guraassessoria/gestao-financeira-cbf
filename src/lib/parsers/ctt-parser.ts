import { CentroCusto } from '../types'

export function parseCTT(content: string): CentroCusto[] {
  // Skip first 2 lines: TOTVS export has a metadata row followed by an empty row before the header
  const lines = content.split('\n').slice(2)
  const result: CentroCusto[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split(';')
    if (cols.length < 5) continue
    const c_custo = cols[1]?.trim()
    if (!c_custo) continue

    result.push({
      filial: cols[0]?.trim() ?? '',
      c_custo,
      classe: cols[2]?.trim() ?? '',
      cond_normal: cols[3]?.trim() ?? '',
      desc_cc: cols[4]?.trim() ?? '',
    })
  }

  return result
}
