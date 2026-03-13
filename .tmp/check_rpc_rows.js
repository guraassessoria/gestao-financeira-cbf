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
  const periodos = ['2025-01'];

  // Test with no limit
  const { data: d1 } = await sb.rpc('get_saldos_dre', { periodos });
  console.log('sem limit:', d1?.length, '| amostra:', JSON.stringify(d1?.slice(0,2)));

  // Test with limit 200000
  const { data: d2 } = await sb.rpc('get_saldos_dre', { periodos }).limit(200000);
  console.log('limit(200000):', d2?.length);

  // Test range 0-999
  const { data: d3 } = await sb.rpc('get_saldos_dre', { periodos }).range(0, 999);
  console.log('range(0,999):', d3?.length);

  // Test range 1000-1999
  const { data: d4 } = await sb.rpc('get_saldos_dre', { periodos }).range(1000, 1999);
  console.log('range(1000,1999):', d4?.length, '(more data beyond 1000?)');
})();
