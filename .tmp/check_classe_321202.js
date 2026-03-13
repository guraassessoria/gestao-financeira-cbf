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

const comp = v => String(v || '').trim().replace(/[^0-9A-Za-z]/g, '').replace(/^0+(?=\d)/, '');

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

  // Check the accounts from de_para lines 1710-1725
  const targets = ['321202', '321301', '321401', '321501', '321502'];
  const { data: contas } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior,cond_normal').in('cod_conta', targets);
  console.log('Mapped accounts classe:');
  for (const c of contas || []) {
    console.log(`  ${c.cod_conta}: classe="${c.classe}" cond_normal="${c.cond_normal}" cta_superior="${c.cta_superior}"`);
  }

  // Also check if these appear with normalization
  const { data: contasAll } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior').like('cod_conta', '3212%');
  console.log('\nAll 3212* accounts:');
  for (const c of (contasAll || []).slice(0, 20)) {
    console.log(`  ${c.cod_conta}: classe="${c.classe}" sup="${c.cta_superior}"`);
  }

  // Check CC ocorrencia for key CCs used in lancamentos
  const keyCCs = ['110426', '110301', '110412', '110701', '110511', '11041201'];
  const { data: ccData } = await sb.from('centros_custo').select('cod_cc,ocorrencia').in('cod_cc', keyCCs);
  console.log('\nKey CCs ocorrencia:');
  for (const c of ccData || []) {
    console.log(`  CC=${c.cod_cc}: ocorrencia="${c.ocorrencia}"`);
  }
})();
