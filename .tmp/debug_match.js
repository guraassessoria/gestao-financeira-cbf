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

  const { data: ccs } = await sb.from('centros_custo').select('cod_cc,ocorrencia');
  const ocorrByCC = new Map((ccs || []).filter(c => c.ocorrencia).map(c => [norm(c.cod_cc), comp(c.ocorrencia)]));

  // Check total CCs loaded
  console.log('Total CCs in DB:', (ccs || []).length);
  console.log('CCs with ocorrencia:', ocorrByCC.size);

  // Check specific CCs
  const testCCs = ['11041201', '110412', '11833', '11822'];
  for (const cc of testCCs) {
    console.log(`  ocorrByCC.get("${cc}") =`, ocorrByCC.get(cc));
  }

  // Fetch lancamentos directly for 321202001
  const { data: lanc321 } = await sb.from('lancamentos_contabeis')
    .select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor')
    .eq('periodo', periodo)
    .or('cta_debito.eq.321202001,cta_credito.eq.321202001')
    .limit(10);
  console.log('\nSample lancamentos for 321202001:', JSON.stringify(lanc321?.slice(0, 3)));

  // Check what the saldoCC entries look like for conta 321202001
  // (manual from above sample)
  if (lanc321 && lanc321.length > 0) {
    const l = lanc321[0];
    console.log('\nFirst lancamento:');
    console.log('  cta_debito:', l.cta_debito, '-> norm:', norm(l.cta_debito));
    console.log('  c_custo_deb:', l.c_custo_deb, '-> norm:', norm(l.c_custo_deb));
    const ocorr = ocorrByCC.get(norm(l.c_custo_deb));
    console.log('  ocorr from map:', ocorr);
    console.log('  codesMatch("' + ocorr + '", "1"):', ocorr === '1');
  }

  // Check all saldoCC entries whose CC maps to ocorrencia=1
  const { data: lancAll } = await sb.from('lancamentos_contabeis')
    .select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor')
    .eq('periodo', periodo)
    .order('id', { ascending: true })
    .range(0, 999);

  const saldoCC = new Map();
  for (const l of lancAll || []) {
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

  // Find entries where CC has ocorrencia=1 AND conta starts with 321
  const entries = [...saldoCC.entries()].map(([k, s]) => { const [conta, cc] = k.split('|'); return { conta, cc, s }; });
  const interessantes = entries.filter(({ conta, cc }) => {
    const ocorr = ocorrByCC.get(cc);
    return ocorr === '1' && conta.startsWith('321');
  });
  console.log('\nEntries with conta=321* AND CC.ocorrencia=1 (first 1000 lancamentos):');
  for (const { conta, cc, s } of interessantes.slice(0, 10)) {
    console.log(`  conta=${conta} cc=${cc} ocorr=${ocorrByCC.get(cc)} deb=${s.deb.toFixed(2)} cred=${s.cred.toFixed(2)}`);
  }
  if (interessantes.length === 0) {
    // Check what 321* entries exist at all
    const t321 = entries.filter(({ conta }) => conta.startsWith('321'));
    console.log('Total 321* entries:', t321.length);
    console.log('Sample 321* CCs:', t321.slice(0, 5).map(x => ({ conta: x.conta, cc: x.cc, ocorr: ocorrByCC.get(x.cc) })));
  }
})();
