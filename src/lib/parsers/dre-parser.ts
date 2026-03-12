import { DREEstrutura, DREDePara } from '../types'

function extractTdText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function parseHTMLTable(html: string): string[][] {
  const rows: string[][] = []
  // Match <tr> blocks
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch
  while ((trMatch = trPattern.exec(html)) !== null) {
    const rowHtml = trMatch[1]
    const cells: string[] = []
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi
    let tdMatch
    while ((tdMatch = tdPattern.exec(rowHtml)) !== null) {
      cells.push(extractTdText(tdMatch[1]))
    }
    if (cells.length > 0) rows.push(cells)
  }
  return rows
}

export function parseDREEstrutura(html: string): DREEstrutura[] {
  const rows = parseHTMLTable(html)
  const result: DREEstrutura[] = []

  for (const cols of rows) {
    if (cols.length < 5) continue
    const codigo_conta = cols[0]?.trim()
    if (!codigo_conta || !codigo_conta.match(/^\d+$/)) continue

    result.push({
      codigo_conta,
      desc_dre: cols[1]?.trim() ?? '',
      codigo_cta_superior: cols[2]?.trim() ?? '',
      nivel: parseInt(cols[4]?.trim() ?? '0') || 0,
      nivel_visualizacao: parseInt(cols[5]?.trim() ?? '0') || 0,
    })
  }

  return result
}

export function parseDREDePara(html: string): DREDePara[] {
  const rows = parseHTMLTable(html)
  const result: DREDePara[] = []

  for (const cols of rows) {
    if (cols.length < 3) continue
    const codigo_de_para = cols[0]?.trim()
    if (!codigo_de_para || !codigo_de_para.match(/^\d+$/)) continue

    result.push({
      codigo_de_para,
      desc_conta_dre: cols[1]?.trim() ?? '',
      codigo_conta_contabil: cols[2]?.trim() ?? '',
      codigo_centro_custo: cols[3]?.trim() ?? '',
    })
  }

  return result
}
