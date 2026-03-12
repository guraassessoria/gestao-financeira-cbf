/**
 * Data ingestion script: reads TOTVS Protheus CSV/XLS files from arquivos/
 * and inserts into Supabase tables.
 *
 * Usage: npm run ingest
 * Requires: SUPABASE_SERVICE_ROLE_KEY env var
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const ARQUIVOS_DIR = path.join(__dirname, '..', 'arquivos')

function readFileAsString(filename: string): string {
  const filePath = path.join(ARQUIVOS_DIR, filename)
  // Try UTF-8 first, fallback to latin1
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return fs.readFileSync(filePath, 'latin1')
  }
}

function parseCSVRows(content: string, skipLines = 2): string[][] {
  // skipLines: number of header/metadata lines to skip from TOTVS export files
  // (first line is the table code, second is empty, third is the actual column header)
  return content
    .split('\n')
    .slice(skipLines)
    .filter(line => line.trim())
    .map(line => line.split(';'))
}

function extractTdText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}

function parseHTMLTableRows(html: string): string[][] {
  const rows: string[][] = []
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

async function ingestCT1() {
  console.log('📥 Ingerindo CT1 - Plano de Contas...')
  const content = readFileAsString('CT1 - Plano de contas.csv')
  const rows = parseCSVRows(content)
  const records = rows
    .filter(cols => cols[1]?.trim())
    .map(cols => ({
      cod_conta: cols[1]?.trim(),
      desc_conta: cols[2]?.trim() ?? '',
      classe_conta: cols[3]?.trim() ?? '',
      cond_normal: cols[4]?.trim() ?? '',
      cod_reduzido: cols[5]?.trim() ?? '',
      cta_superior: cols[18]?.trim() ?? '',
      filial: cols[0]?.trim() ?? '',
    }))

  const { error } = await supabase.from('plano_contas').upsert(records, { onConflict: 'cod_conta' })
  if (error) console.error('Erro CT1:', error.message)
  else console.log(`  ✅ ${records.length} contas inseridas`)
}

async function ingestCTT() {
  console.log('📥 Ingerindo CTT - Centros de Custo...')
  const content = readFileAsString('CTT - Centros de Custo.csv')
  const rows = parseCSVRows(content)
  const records = rows
    .filter(cols => cols[1]?.trim())
    .map(cols => ({
      c_custo: cols[1]?.trim(),
      classe: cols[2]?.trim() ?? '',
      cond_normal: cols[3]?.trim() ?? '',
      desc_cc: cols[4]?.trim() ?? '',
      filial: cols[0]?.trim() ?? '',
    }))

  const { error } = await supabase.from('centros_custo').upsert(records, { onConflict: 'c_custo' })
  if (error) console.error('Erro CTT:', error.message)
  else console.log(`  ✅ ${records.length} centros de custo inseridos`)
}

async function ingestCT2() {
  console.log('📥 Ingerindo CT2 - Lançamentos...')
  const content = readFileAsString('CT2 - Lançamentos.csv')
  const rows = parseCSVRows(content)
  const records = rows
    .filter(cols => cols[6]?.trim() === 'Partida Dobrada')
    .map(cols => ({
      filial: cols[0]?.trim() ?? '',
      data_lcto: cols[1]?.trim() ? formatDate(cols[1].trim()) : null,
      numero_lote: cols[2]?.trim() ?? '',
      sub_lote: cols[3]?.trim() ?? '',
      numero_doc: cols[4]?.trim() ?? '',
      tipo_lcto: cols[6]?.trim() ?? '',
      cta_debito: cols[7]?.trim() || null,
      cta_credito: cols[8]?.trim() || null,
      valor: parseFloat(cols[9]?.trim() ?? '0') || 0,
      hist_lanc: cols[11]?.trim() ?? '',
      c_custo_deb: cols[12]?.trim() ?? '',
      c_custo_crd: cols[13]?.trim() ?? '',
      origem: cols[21]?.trim() ?? '',
    }))

  // Insert in batches of 500
  let inserted = 0
  for (let i = 0; i < records.length; i += 500) {
    const batch = records.slice(i, i + 500)
    const { error } = await supabase.from('lancamentos').insert(batch)
    if (error) {
      console.error(`  Erro no batch ${i / 500 + 1}:`, error.message)
    } else {
      inserted += batch.length
    }
  }
  console.log(`  ✅ ${inserted} lançamentos inseridos`)
}

function formatDate(dateStr: string): string | null {
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const parts = dateStr.split('/')
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return null
}

async function ingestDREEstrutura() {
  console.log('📥 Ingerindo DRE Estrutura...')
  const content = readFileAsString('DRE - Estrutura.xls')
  const rows = parseHTMLTableRows(content)
  const records = rows
    .filter(cols => cols[0]?.match(/^\d+$/))
    .map(cols => ({
      codigo_conta: cols[0]?.trim(),
      desc_dre: cols[1]?.trim() ?? '',
      codigo_cta_superior: cols[2]?.trim() ?? '',
      nivel: parseInt(cols[4]?.trim() ?? '0') || 0,
      nivel_visualizacao: parseInt(cols[5]?.trim() ?? '0') || 0,
    }))

  const { error } = await supabase.from('dre_estrutura').upsert(records, { onConflict: 'codigo_conta' })
  if (error) console.error('Erro DRE Estrutura:', error.message)
  else console.log(`  ✅ ${records.length} linhas DRE inseridas`)
}

async function ingestDREDePara() {
  console.log('📥 Ingerindo DRE De-Para...')
  const content = readFileAsString('DRE - De_Para.xls')
  const rows = parseHTMLTableRows(content)
  const records = rows
    .filter(cols => cols[0]?.match(/^\d+$/))
    .map(cols => ({
      codigo_de_para: cols[0]?.trim(),
      desc_conta_dre: cols[1]?.trim() ?? '',
      codigo_conta_contabil: cols[2]?.trim() ?? '',
      codigo_centro_custo: cols[3]?.trim() ?? '',
    }))

  const { error } = await supabase.from('dre_de_para').upsert(records, { onConflict: 'codigo_de_para' })
  if (error) console.error('Erro DRE De-Para:', error.message)
  else console.log(`  ✅ ${records.length} mapeamentos De-Para inseridos`)
}

async function main() {
  console.log('🚀 Iniciando ingestão de dados CBF...\n')
  await ingestCT1()
  await ingestCTT()
  await ingestDREEstrutura()
  await ingestDREDePara()
  await ingestCT2() // Last because it references plano_contas
  console.log('\n✅ Ingestão concluída!')
}

main().catch(console.error)
