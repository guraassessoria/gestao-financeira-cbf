import { PlanoConta } from '../types'

export function parseCT1(content: string): PlanoConta[] {
  // Skip first 2 lines: TOTVS export has a metadata row followed by an empty row before the header
  const lines = content.split('\n').slice(2)
  const result: PlanoConta[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split(';')
    if (cols.length < 19) continue
    const cod_conta = cols[1]?.trim()
    if (!cod_conta) continue

    result.push({
      filial: cols[0]?.trim() ?? '',
      cod_conta,
      desc_conta: cols[2]?.trim() ?? '',
      classe_conta: cols[3]?.trim() ?? '',
      cond_normal: cols[4]?.trim() ?? '',
      cod_reduzido: cols[5]?.trim() ?? '',
      cta_superior: cols[18]?.trim() ?? '',
    })
  }

  return result
}
