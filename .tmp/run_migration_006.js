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
  // Extract project ref from URL: https://<ref>.supabase.co
  const match = (e.NEXT_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) { console.error('Could not extract project ref from URL'); process.exit(1); }
  const projectRef = match[1];

  const sql = `ALTER TABLE centros_custo ADD COLUMN IF NOT EXISTS ocorrencia VARCHAR(20) DEFAULT NULL;
COMMENT ON COLUMN centros_custo.ocorrencia IS 'Código de ocorrência/entidade (CV0) associado a este centro de custo. Campo Ocorrencia do arquivo CTT TOTVS.';`;

  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  console.log('Project ref:', projectRef);
  console.log('Running SQL via Management API...');

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + e.SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await resp.text();
  console.log('Status:', resp.status);
  console.log('Response:', text);

  // Verify
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await sb.from('centros_custo').select('ocorrencia').limit(1);
  if (error) {
    console.log('\nVerification: column still missing -', error.message);
  } else {
    console.log('\nVerification: column "ocorrencia" EXISTS.');
    console.log('Sample:', JSON.stringify(data));
  }
})();
