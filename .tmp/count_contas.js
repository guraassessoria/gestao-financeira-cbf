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
(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const { count: totalContas } = await sb.from('contas_contabeis').select('*', { count: 'exact', head: true });
  const { count: totalCCs } = await sb.from('centros_custo').select('*', { count: 'exact', head: true });
  console.log('Total contas_contabeis:', totalContas);
  console.log('Total centros_custo:', totalCCs);

  // Check if 321301004 is in the DB
  const { data } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior').eq('cod_conta', '321301004');
  console.log('321301004:', JSON.stringify(data));
  const { data: d2 } = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior').eq('cod_conta', '321502003');
  console.log('321502003:', JSON.stringify(d2));
})();
