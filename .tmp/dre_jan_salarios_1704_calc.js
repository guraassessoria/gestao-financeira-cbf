const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const norm = (v) => String(v || '').trim().replace(/\D/g, '').replace(/^0+(?=\d)/, '');

(async () => {
  const env = { ...loadEnv('.env.local'), ...process.env };
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const periodo = '2025-01';
  const conta = '321101';

  const { data: rows, error } = await sb
    .from('lancamentos_contabeis')
    .select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor,periodo')
    .eq('periodo', periodo)
    .or(`cta_debito.eq.${conta},cta_credito.eq.${conta}`)
    .limit(200000);

  if (error) throw error;

  let debAll = 0, credAll = 0;
  let debEnt01 = 0, credEnt01 = 0;
  let debCc1 = 0, credCc1 = 0;
  let debEnt01OrCc1 = 0, credEnt01OrCc1 = 0;

  for (const r of rows || []) {
    const v = Number(r.valor || 0);

    if (norm(r.cta_debito) === norm(conta)) {
      debAll += v;
      const ent = norm(r.ocorren_deb);
      const cc = norm(r.c_custo_deb);
      if (ent === '1') debEnt01 += v;
      if (cc === '1') debCc1 += v;
      if (ent === '1' || cc === '1') debEnt01OrCc1 += v;
    }

    if (norm(r.cta_credito) === norm(conta)) {
      credAll += v;
      const ent = norm(r.ocorren_crd);
      const cc = norm(r.c_custo_crd);
      if (ent === '1') credEnt01 += v;
      if (cc === '1') credCc1 += v;
      if (ent === '1' || cc === '1') credEnt01OrCc1 += v;
    }
  }

  const out = {
    periodo,
    conta,
    totals: {
      all: { deb: debAll, cred: credAll, devedora_saldo: debAll - credAll, credora_saldo: credAll - debAll },
      cv0_01_only: { deb: debEnt01, cred: credEnt01, devedora_saldo: debEnt01 - credEnt01, credora_saldo: credEnt01 - debEnt01 },
      cc_1_only: { deb: debCc1, cred: credCc1, devedora_saldo: debCc1 - credCc1, credora_saldo: credCc1 - debCc1 },
      cv0_01_or_cc_1: { deb: debEnt01OrCc1, cred: credEnt01OrCc1, devedora_saldo: debEnt01OrCc1 - credEnt01OrCc1, credora_saldo: credEnt01OrCc1 - debEnt01OrCc1 }
    }
  };

  console.log(JSON.stringify(out, null, 2));
})();
