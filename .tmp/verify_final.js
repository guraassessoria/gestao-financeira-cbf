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
const codesMatch = (a, b) => { const na = comp(a), nb = comp(b); return !!(na && nb && na === nb); };
const contaMatch = (lancConta, mapConta, classeMap, supMap) => {
  const l = comp(lancConta), m = comp(mapConta);
  if (!l || !m) return false; if (l === m) return true;
  if (!String(classeMap || '').toLowerCase().startsWith('sint')) return false;
  const vis = new Set(); let cur = l;
  while (cur && !vis.has(cur)) { vis.add(cur); const s = supMap.get(cur); if (!s) break; if (s === m) return true; cur = s; }
  return false;
};

async function fetchAll(sb, table, cols) {
  const PAGE = 1000;
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
  const all = [];
  for (let page = 0; page * PAGE < count; page++) {
    const { data } = await sb.from(table).select(cols).order('id', { ascending: true }).range(page * PAGE, (page + 1) * PAGE - 1);
    if (data) all.push(...data);
  }
  return all;
}

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const periodo = '2025-01';

  console.log('Loading all reference data with pagination...');
  const [contas, ccs, dePara, lanc] = await Promise.all([
    fetchAll(sb, 'contas_contabeis', 'cod_conta,classe,cta_superior,cond_normal'),
    fetchAll(sb, 'centros_custo', 'cod_cc,ocorrencia'),
    sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo')
      .in('codigo_linha_dre', ['1710','1713','1715','1724','1725']).order('codigo_linha_dre').limit(100).then(r => r.data || []),
    fetchAll(sb, 'lancamentos_contabeis', 'cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor')
      .catch(() => {
        // fallback: period filter
        return sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor').eq('periodo', periodo).limit(100000).then(r => r.data || []);
      }),
  ]);

  // For lancamentos, filter by period
  const lancPeriod = lanc.length > 0 && lanc[0].periodo === undefined
    ? lanc // already filtered
    : (await (async () => {
        const PAGE = 1000;
        const { count } = await sb.from('lancamentos_contabeis').select('*', { count: 'exact', head: true }).eq('periodo', periodo);
        const all = [];
        for (let page = 0; page * PAGE < count; page++) {
          const { data } = await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor').eq('periodo', periodo).order('id', { ascending: true }).range(page * PAGE, (page + 1) * PAGE - 1);
          if (data) all.push(...data);
        }
        return all;
      })());

  console.log('contas:', contas.length, '| ccs:', ccs.length, '| lancamentos:', lancPeriod.length);

  const classeBy = new Map(contas.map(c => [comp(c.cod_conta), c.classe || '']));
  const supBy = new Map(contas.filter(c => c.cta_superior).map(c => [comp(c.cod_conta), comp(c.cta_superior)]));
  const ocorrByCC = new Map(ccs.filter(c => c.ocorrencia).map(c => [norm(c.cod_cc), comp(c.ocorrencia)]));

  // Build saldoCC
  const saldoCC = new Map();
  for (const l of lancPeriod) {
    const v = Number(l.valor || 0);
    if (l.cta_debito && l.c_custo_deb) {
      const k = `${norm(l.cta_debito)}|${norm(l.c_custo_deb)}`;
      const s = saldoCC.get(k) || { deb: 0, cred: 0 }; s.deb += v; saldoCC.set(k, s);
    }
    if (l.cta_credito && l.c_custo_crd) {
      const k = `${norm(l.cta_credito)}|${norm(l.c_custo_crd)}`;
      const s = saldoCC.get(k) || { deb: 0, cred: 0 }; s.cred += v; saldoCC.set(k, s);
    }
  }
  const entries = [...saldoCC.entries()].map(([k, s]) => { const [conta, cc] = k.split('|'); return { conta, cc, s }; });

  console.log('\n=== DRE Seleção Principal (ocorrencia=01) — Janeiro 2025 ===\n');
  for (const m of dePara) {
    const mapConta = comp(m.codigo_conta_contabil);
    const mapOcorren = comp(m.codigo_centro_custo);
    const classeMap = classeBy.get(mapConta);
    let total = 0; let matched = 0;
    for (const { conta, cc, s } of entries) {
      const ocorrDoCC = ocorrByCC.get(cc);
      if (!contaMatch(conta, mapConta, classeMap, supBy)) continue;
      if (!codesMatch(ocorrDoCC, mapOcorren)) continue;
      matched++;
      const isCredora = comp(conta).startsWith('31') || comp(conta).startsWith('2');
      total += isCredora ? s.cred - s.deb : s.deb - s.cred;
    }
    const formatted = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log(`Linha ${m.codigo_linha_dre} (conta ${m.codigo_conta_contabil}): ${formatted}  [${matched} entradas matched]`);
  }
})();
