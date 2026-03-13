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

const normalizeCode = v => String(v || '').trim().replace(/[^0-9A-Za-z]/g, '');
const normalizeComp = v => normalizeCode(v).replace(/^0+(?=\d)/, '');
const codesMatch = (a, b) => { const na = normalizeComp(a), nb = normalizeComp(b); return !!(na && nb && na === nb); };
const contaMatch = (lancConta, mapConta, classeMap, supMap) => {
  const l = normalizeComp(lancConta), m = normalizeComp(mapConta);
  if (!l || !m) return false; if (l === m) return true;
  if (!String(classeMap || '').toLowerCase().startsWith('sint')) return false;
  const vis = new Set(); let cur = l;
  while (cur && !vis.has(cur)) { vis.add(cur); const s = supMap.get(cur); if (!s) break; if (s === m) return true; cur = s; }
  return false;
};

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const periodo = '2025-01';

  const { data: dePara } = await sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo')
    .in('codigo_linha_dre', ['1710', '1713', '1715', '1724', '1725']).order('codigo_linha_dre');
  const { data: contas } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior,cond_normal');
  const { data: ccs } = await sb.from('centros_custo').select('cod_cc,ocorrencia');
  const { data: lanc } = await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor').eq('periodo', periodo).limit(500000);

  const classeBy = new Map((contas || []).map(c => [normalizeComp(c.cod_conta), c.classe || '']));
  const supBy = new Map((contas || []).filter(c => c.cta_superior).map(c => [normalizeComp(c.cod_conta), normalizeComp(c.cta_superior)]));
  const condBy = new Map((contas || []).map(c => [normalizeComp(c.cod_conta), c.cond_normal || 'Credora']));
  const ocorrByCC = new Map((ccs || []).filter(c => c.ocorrencia).map(c => [normalizeCode(c.cod_cc), normalizeComp(c.ocorrencia)]));

  console.log('Ocorrencia map size:', ocorrByCC.size);
  console.log('Sample ocorrByCC (01):', [...ocorrByCC.entries()].filter(([,v]) => v === '1').slice(0, 3));

  // Build saldo by conta + cc
  const saldoCC = new Map();
  for (const l of lanc || []) {
    const v = Number(l.valor || 0);
    if (l.cta_debito && l.c_custo_deb) {
      const k = `${normalizeCode(l.cta_debito)}|${normalizeCode(l.c_custo_deb)}`;
      const s = saldoCC.get(k) || { deb: 0, cred: 0 }; s.deb += v; saldoCC.set(k, s);
    }
    if (l.cta_credito && l.c_custo_crd) {
      const k = `${normalizeCode(l.cta_credito)}|${normalizeCode(l.c_custo_crd)}`;
      const s = saldoCC.get(k) || { deb: 0, cred: 0 }; s.cred += v; saldoCC.set(k, s);
    }
  }

  const entries = [...saldoCC.entries()].map(([k, s]) => { const [conta, cc] = k.split('|'); return { conta, cc, s }; });

  console.log('\nLinha | ContaMapeada | CC_Ocorren | Valor calculado');
  for (const m of dePara || []) {
    const mapConta = normalizeComp(m.codigo_conta_contabil);
    const mapOcorren = normalizeComp(m.codigo_centro_custo); // ocorrencia code
    const classeMap = classeBy.get(mapConta);
    let total = 0;
    for (const { conta, cc, s } of entries) {
      const ocorrDoCC = ocorrByCC.get(cc);
      if (!contaMatch(conta, mapConta, classeMap, supBy)) continue;
      if (!codesMatch(ocorrDoCC, mapOcorren)) continue;
      const codeNorm = conta.replace(/^0+(?=\d)/, '');
      const isCredora = codeNorm.startsWith('31') || codeNorm.startsWith('2');
      total += isCredora ? s.cred - s.deb : s.deb - s.cred;
    }
    const formatted = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log(`${m.codigo_linha_dre} | ${m.codigo_conta_contabil} | ocorren=${mapOcorren} | ${formatted}`);
  }
})();
