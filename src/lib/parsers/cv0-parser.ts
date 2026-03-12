interface Entidade {
  filial: string
  plano_contab: string
  item: string
  codigo: string
  descricao: string
  classe: string
  cond_normal: string
}

export function parseCV0(content: string): Entidade[] {
  // Skip first 2 lines: TOTVS export has a metadata row followed by an empty row before the header
  const lines = content.split('\n').slice(2)
  const result: Entidade[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split(';')
    if (cols.length < 7) continue
    const codigo = cols[3]?.trim()
    if (!codigo) continue

    result.push({
      filial: cols[0]?.trim() ?? '',
      plano_contab: cols[1]?.trim() ?? '',
      item: cols[2]?.trim() ?? '',
      codigo,
      descricao: cols[4]?.trim() ?? '',
      classe: cols[5]?.trim() ?? '',
      cond_normal: cols[6]?.trim() ?? '',
    })
  }

  return result
}
