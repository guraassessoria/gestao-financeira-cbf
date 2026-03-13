const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function env() {
  const o = { ...process.env };
  if (fs.existsSync('.env.local')) {
    for (const l of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const t = l.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i > 0) o[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return o;
}

function parseCTT(filePath) {
  const content = fs.readFileSync(filePath, 'latin1');
  const lines = content.split(/\r?\n/);
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Filial;')) { headerIdx = i; break; }
  }
  if (headerIdx < 0) throw new Error('Header not found');

  const headers = lines[headerIdx].split(';');
  const colIdx = (name) => headers.findIndex(h => h.trim() === name);

  const iFilial   = colIdx('Filial');
  const iCCusto   = colIdx('C Custo');
  const iClasse   = colIdx('Classe');
  const iCond     = colIdx('Cond Normal');
  const iDesc     = colIdx('Desc Moeda 1');
  const iBloq     = colIdx('CC Bloq');
  const iSup      = colIdx('CC Superior');
  const iOcorren  = colIdx('Ocorrencia');

  console.log('Ocorrencia col index:', iOcorren);

  const records = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const cod = (cols[iCCusto] || '').trim();
    if (!cod) continue;
    const classe = (cols[iClasse] || '').trim().toLowerCase();
    const classeNorm = classe.includes('sint') ? 'Sintético' : 'Analítico';
    const cond = (cols[iCond] || '').trim();
    const condNorm = cond === 'Receita' ? 'Receita' : 'Despesa';
    const ocorrencia = iOcorren >= 0 ? (cols[iOcorren] || '').trim() || null : null;
    records.push({
      filial:      (cols[iFilial] || '01').trim(),
      cod_cc:      cod,
      descricao:   (cols[iDesc] || '').trim(),
      classe:      classeNorm,
      cond_normal: condNorm,
      cc_superior: (cols[iSup] || '').trim() || null,
      ocorrencia:  ocorrencia,
      bloqueado:   ['s','sim','bloqueado','1'].includes((cols[iBloq]||'').trim().toLowerCase()),
    });
  }
  return records;
}

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

  const cttPath = path.resolve('arquivos/CTT - Centros de Custo.csv');
  console.log('Parsing:', cttPath);
  const records = parseCTT(cttPath);
  console.log('Total CCs parsed:', records.length);

  const withOcorren = records.filter(r => r.ocorrencia);
  console.log('CCs with ocorrencia:', withOcorren.length);
  const dist = [...new Set(withOcorren.map(r => r.ocorrencia))].sort();
  console.log('Distinct ocorrencias:', dist.join(', '));

  // Upsert in batches of 500
  const BATCH = 500;
  let total = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await sb.from('centros_custo').upsert(batch, { onConflict: 'filial,cod_cc' });
    if (error) { console.error('Upsert error at batch', i, ':', error.message); process.exit(1); }
    total += batch.length;
    process.stdout.write(`\rUpserted ${total}/${records.length}...`);
  }
  console.log('\nDone!');

  // Verify
  const { data } = await sb.from('centros_custo').select('cod_cc,ocorrencia').not('ocorrencia','is',null).limit(5);
  console.log('Sample rows with ocorrencia:', JSON.stringify(data));
})();
