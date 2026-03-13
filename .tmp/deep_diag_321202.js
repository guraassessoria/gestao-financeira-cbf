const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function env() {
  const o = { ...process.env };
  if (fs.existsSync('.env.local')) {
    for (const l of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const t = l.trim(); if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('='); if (i > 0) o[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return o;
}

const norm = v => String(v || '').trim().replace(/[^0-9A-Za-z]/g, '');
const comp = v => norm(v).replace(/^0+(?=\d)/, '');

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const periodo = '2025-01';

  // Check hierarchy for 321202
  const { data: contas } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior').like('cod_conta', '321%');
  const supBy = new Map((contas || []).filter(c => c.cta_superior).map(c => [comp(c.cod_conta), comp(c.cta_superior)]));
  const classeBy = new Map((contas || []).map(c => [comp(c.cod_conta), c.classe || '']));

  // Find all children of 321202
  const target = comp('321202');
  const children321202 = (contas || []).filter(c => {
    let cur = comp(c.cod_conta); const vis = new Set();
    while (cur && !vis.has(cur)) { vis.add(cur); const s = supBy.get(cur); if (!s) break; if (s === target) return true; cur = s; }
    return false;
  }).map(c => c.cod_conta);
  console.log('Children of 321202:', children321202.slice(0, 20));

  // Check CCs with ocorrencia=01
  const { data: ccs } = await sb.from('centros_custo').select('cod_cc,ocorrencia').eq('ocorrencia', '01').limit(30);
  console.log('\nCCs with ocorrencia=01:', ccs?.map(c => c.cod_cc).join(', '));

  // Check lancamentos for these accounts and CCs in Jan 2025
  const allContas = ['321202', ...children321202.slice(0, 20)];
  const allCCs = (ccs || []).map(c => c.cod_cc).slice(0, 20);

  console.log('\nQuerying lancamentos for', allContas.length, 'accounts and', allCCs.length, 'CCs...');

  // Build OR query for debito
  const { data: lanc, error } = await sb.from('lancamentos_contabeis')
    .select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor')
    .eq('periodo', periodo)
    .or(allContas.map(c => `cta_debito.eq.${c}`).concat(allContas.map(c => `cta_credito.eq.${c}`)).join(','))
    .limit(5000);

  if (error) { console.error('Query error:', error.message); return; }
  console.log('Total lancamentos found for these accounts:', lanc?.length);

  // Check which ones have CC with ocorrencia=01
  const cc01Set = new Set(allCCs.map(c => norm(c)));
  const matching = (lanc || []).filter(l =>
    (l.c_custo_deb && cc01Set.has(norm(l.c_custo_deb))) ||
    (l.c_custo_crd && cc01Set.has(norm(l.c_custo_crd)))
  );
  console.log('Lancamentos with CC having ocorrencia=01:', matching.length);

  // Show sample
  if (matching.length > 0) {
    let total = 0;
    for (const l of matching) {
      const v = Number(l.valor || 0);
      if (allContas.includes(l.cta_debito)) total += v;
      if (allContas.includes(l.cta_credito)) total -= v;
    }
    console.log('Total value (devedora logic):', total.toFixed(2));
    console.log('Sample:', JSON.stringify(matching.slice(0, 3)));
  }

  // Also check what CCs are actually used in lancamentos for 321202 children
  const usedCCs = new Map();
  for (const l of lanc || []) {
    if (l.c_custo_deb) usedCCs.set(norm(l.c_custo_deb), (usedCCs.get(norm(l.c_custo_deb)) || 0) + Number(l.valor || 0));
  }
  console.log('\nCCs actually used in lancamentos for 321202 children:');
  for (const [cc, v] of [...usedCCs.entries()].sort((a,b) => b[1]-a[1]).slice(0, 10)) {
    console.log(`  CC=${cc}: ${v.toFixed(2)}`);
  }
})();
