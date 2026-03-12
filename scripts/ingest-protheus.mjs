#!/usr/bin/env node
/**
 * Script de ingestão dos arquivos Protheus para o Supabase
 *
 * Uso:
 *   node scripts/ingest-protheus.mjs --arquivo CT1 --path ./arquivos/CT1\ -\ Plano\ de\ contas.csv
 *   node scripts/ingest-protheus.mjs --arquivo CT2 --path ./arquivos/CT2\ -\ Lançamentos.csv
 *   node scripts/ingest-protheus.mjs --arquivo CTT --path ./arquivos/CTT\ -\ Centros\ de\ Custo.csv
 *   node scripts/ingest-protheus.mjs --arquivo CV0 --path ./arquivos/CV0\ -\ Entidade\ 05.csv
 *
 * Variáveis de ambiente necessárias:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { createInterface } from 'readline'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'ERRO: Configure SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Parsing de argumentos
const args = process.argv.slice(2)
const getArg = (name) => {
  const idx = args.indexOf(name)
  return idx >= 0 ? args[idx + 1] : null
}

const tipoArquivo = getArg('--arquivo')?.toUpperCase()
const filePath = getArg('--path')

if (!tipoArquivo || !filePath) {
  console.error('Uso: node ingest-protheus.mjs --arquivo [CT1|CT2|CTT|CV0] --path <caminho>')
  process.exit(1)
}

const resolvedPath = path.resolve(filePath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`Arquivo não encontrado: ${resolvedPath}`)
  process.exit(1)
}

/**
 * Lê o CSV Protheus (pula 2 linhas de preâmbulo, delimitador ;)
 */
async function lerCSVProtheus(filePath, encodingHint = 'latin1') {
  const linhas = []
  let cabecalho = null
  let numLinha = 0

  const rl = createInterface({
    input: fs.createReadStream(filePath, { encoding: encodingHint }),
    crlfDelay: Infinity,
  })

  for await (const linha of rl) {
    numLinha++
    if (numLinha <= 2) continue // Pular preâmbulo

    const campos = linha.split(';')

    if (numLinha === 3) {
      // Linha de cabeçalho
      cabecalho = campos.map((c) => c.trim())
      continue
    }

    if (!campos[0] || campos[0].trim() === '') continue

    const obj = {}
    cabecalho.forEach((col, i) => {
      obj[col] = (campos[i] ?? '').trim()
    })
    linhas.push(obj)
  }

  return linhas
}

function parseData(str) {
  const EMPTY_DATE_PATTERNS = ['/  /', '  /  /']
  if (!str || str.trim() === '') return null
  if (EMPTY_DATE_PATTERNS.some((p) => str.includes(p))) return null
  const partes = str.trim().split('/')
  if (partes.length === 3) {
    const [d, m, a] = partes
    if (a.length === 4) return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function parseValor(str) {
  if (!str || str.trim() === '') return 0
  return parseFloat(str.replace(',', '.')) || 0
}

// ============================================================
// Ingestão CT1 — Plano de Contas
// ============================================================
async function ingerirCT1(filePath) {
  console.log('\n📋 Ingerindo CT1 — Plano de Contas...')
  const linhas = await lerCSVProtheus(filePath)
  console.log(`   Lidas ${linhas.length} linhas`)

  const registros = linhas.map((l) => ({
    filial: l['Filial'] || '01',
    cod_conta: l['Cod Conta'],
    desc_conta: l['Desc Moeda 1'] || '',
    classe_conta: l['Classe Conta'] === 'Analitica' ? 'Analitica' : 'Sintetica',
    cond_normal: l['Cond Normal'] === 'Credora' ? 'Credora' : 'Devedora',
    cta_superior: l['Cta Superior'] || null,
    nat_conta: l['Nat. Conta'] || null,
  })).filter((r) => r.cod_conta)

  console.log(`   Processados ${registros.length} registros`)

  const BATCH = 1000
  let inseridos = 0
  let erros = 0

  for (let i = 0; i < registros.length; i += BATCH) {
    const lote = registros.slice(i, i + BATCH)
    const { error } = await supabase
      .from('ct1_plano_contas')
      .upsert(lote, { onConflict: 'filial,cod_conta' })

    if (error) {
      console.error(`   ERRO no lote ${i / BATCH + 1}:`, error.message)
      erros += lote.length
    } else {
      inseridos += lote.length
    }
  }

  console.log(`   ✅ Inseridos: ${inseridos} | Erros: ${erros}`)
  await registrarCarga('CT1', path.basename(filePath), linhas.length, inseridos, erros)
}

// ============================================================
// Ingestão CT2 — Lançamentos
// ============================================================
async function ingerirCT2(filePath) {
  console.log('\n📒 Ingerindo CT2 — Lançamentos...')
  const linhas = await lerCSVProtheus(filePath)
  console.log(`   Lidas ${linhas.length} linhas`)

  // Registrar snapshot de carga
  const { data: carga } = await supabase
    .from('cargas_snapshot')
    .insert({
      tipo_arquivo: 'CT2',
      nome_arquivo: path.basename(filePath),
      encoding: 'latin1',
      total_linhas: linhas.length,
    })
    .select('id')
    .single()

  const cargaId = carga?.id

  const registros = linhas
    .filter((l) => l['Tipo Lcto'] === 'Partida Dobrada')
    .map((l) => ({
      filial: l['Filial'] || '01',
      data_lcto: parseData(l['Data Lcto']),
      numero_lote: l['Numero Lote'] || null,
      sub_lote: l['Sub Lote'] || null,
      numero_doc: l['Numero Doc'] || null,
      moeda_lancto: l['Moeda Lancto'] || null,
      tipo_lcto: l['Tipo Lcto'],
      cta_debito: l['Cta Debito'] || null,
      cta_credito: l['Cta Credito'] || null,
      valor: parseValor(l['Valor']),
      valor_moeda1: parseValor(l['Valor Moeda1']),
      hist_lanc: l['Hist Lanc'] || null,
      c_custo_deb: l['C Custo Deb'] || null,
      c_custo_crd: l['C Custo Crd'] || null,
      atividade_deb: l['Ocorren Deb'] || null,
      atividade_crd: l['Ocorren Crd'] || null,
      origem: l['Origem'] || null,
      carga_id: cargaId,
    }))
    .filter((r) => r.data_lcto && r.valor !== 0)

  console.log(`   Processados ${registros.length} registros (Partida Dobrada com valor)`)

  const BATCH = 500
  let inseridos = 0
  let erros = 0

  for (let i = 0; i < registros.length; i += BATCH) {
    const lote = registros.slice(i, i + BATCH)
    const { error } = await supabase.from('ct2_lancamentos').insert(lote)

    if (error) {
      console.error(`   ERRO no lote ${i / BATCH + 1}:`, error.message)
      erros += lote.length
    } else {
      inseridos += lote.length
    }

    if (i % 5000 === 0 && i > 0) {
      process.stdout.write(`   ... ${i} processados\r`)
    }
  }

  // Atualizar snapshot
  await supabase
    .from('cargas_snapshot')
    .update({ linhas_importadas: inseridos, linhas_erro: erros })
    .eq('id', cargaId)

  console.log(`   ✅ Inseridos: ${inseridos} | Erros: ${erros}`)
}

// ============================================================
// Ingestão CTT — Centros de Custo
// ============================================================
async function ingerirCTT(filePath) {
  console.log('\n🏢 Ingerindo CTT — Centros de Custo...')
  const linhas = await lerCSVProtheus(filePath)
  console.log(`   Lidas ${linhas.length} linhas`)

  const registros = linhas.map((l) => ({
    filial: l['Filial'] || '01',
    c_custo: l['C Custo'],
    desc_cc: l['Desc Moeda 1'] || l['Desc'] || '',
    classe: l['Classe'] === 'Analitico' ? 'Analitico' : 'Sintetico',
    cond_normal: l['Cond Normal'] === 'Receita' ? 'Receita' : 'Despesa',
    cc_superior: l['CC Superior'] || null,
  })).filter((r) => r.c_custo)

  const { error } = await supabase
    .from('ctt_centros_custo')
    .upsert(registros, { onConflict: 'filial,c_custo' })

  if (error) {
    console.error('   ERRO:', error.message)
  } else {
    console.log(`   ✅ Upsert de ${registros.length} registros`)
  }

  await registrarCarga('CTT', path.basename(filePath), linhas.length, registros.length, 0)
}

// ============================================================
// Ingestão CV0 — Entidade 05 (Atividades)
// ============================================================
async function ingerirCV0(filePath) {
  console.log('\n⚽ Ingerindo CV0 — Entidade 05...')
  const linhas = await lerCSVProtheus(filePath)
  console.log(`   Lidas ${linhas.length} linhas`)

  const registros = linhas
    .filter((l) => l['Codigo'] || l['C�digo'])
    .map((l) => ({
      filial: l['Filial'] || '01',
      plano_contab: l['Plano Cont�b'] || l['Plano Contab'] || '05',
      item: l['Item'] || null,
      codigo: l['Codigo'] || l['C�digo'] || '',
      descricao: l['Descri��o'] || l['Descricao'] || '',
      classe: l['Classe'] || null,
      cond_normal: l['Cond.Normal'] || null,
      entid_sup: l['Entid.Sup.'] || null,
    }))
    .filter((r) => r.codigo)

  const { error } = await supabase
    .from('cv0_entidade05')
    .upsert(registros, { onConflict: 'filial,plano_contab,codigo' })

  if (error) {
    console.error('   ERRO:', error.message)
  } else {
    console.log(`   ✅ Upsert de ${registros.length} registros`)
  }

  await registrarCarga('CV0', path.basename(filePath), linhas.length, registros.length, 0)
}

async function registrarCarga(tipo, nomeArquivo, totalLinhas, inseridos, erros) {
  await supabase.from('cargas_snapshot').insert({
    tipo_arquivo: tipo,
    nome_arquivo: nomeArquivo,
    encoding: 'latin1',
    total_linhas: totalLinhas,
    linhas_importadas: inseridos,
    linhas_erro: erros,
  })
}

// ============================================================
// Main
// ============================================================
const handlers = {
  CT1: ingerirCT1,
  CT2: ingerirCT2,
  CTT: ingerirCTT,
  CV0: ingerirCV0,
}

const handler = handlers[tipoArquivo]
if (!handler) {
  console.error(`Tipo de arquivo não suportado: ${tipoArquivo}`)
  console.error('Tipos suportados: CT1, CT2, CTT, CV0')
  process.exit(1)
}

console.log(`\n🚀 Iniciando ingestão: ${tipoArquivo}`)
console.log(`   Arquivo: ${resolvedPath}`)
console.log(`   Supabase: ${SUPABASE_URL}`)

handler(resolvedPath)
  .then(() => {
    console.log('\n✅ Ingestão concluída com sucesso!\n')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Erro na ingestão:', err)
    process.exit(1)
  })
