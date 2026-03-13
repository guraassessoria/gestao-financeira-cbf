const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

(async () => {
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

  const sql = `ALTER TABLE centros_custo ADD COLUMN IF NOT EXISTS ocorrencia VARCHAR(20) DEFAULT NULL`;

  // Try via Supabase SQL API (requires pg_net or direct postgres)
  const url = e.NEXT_PUBLIC_SUPABASE_URL.replace('.supabase.co', '.supabase.co') + '/rest/v1/';

  // Use the pg REST endpoint
  const pgUrl = e.NEXT_PUBLIC_SUPABASE_URL + '/pg/query';

  try {
    const resp = await fetch(pgUrl, {
      method: 'POST',
      headers: {
        'apikey': e.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + e.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    const text = await resp.text();
    console.log('pg/query status:', resp.status, text);
  } catch (err) {
    console.log('pg/query failed:', err.message);
  }

  // Verify current state
  const { data, error } = await sb.from('centros_custo').select('ocorrencia').limit(1);
  if (error) {
    console.log('Column check error:', error.message);
    if (error.message.includes('ocorrencia')) {
      console.log('=> Column does NOT exist yet.');
    }
  } else {
    console.log('=> Column "ocorrencia" already EXISTS in centros_custo.');
    console.log('Sample row:', JSON.stringify(data));
  }
})();
