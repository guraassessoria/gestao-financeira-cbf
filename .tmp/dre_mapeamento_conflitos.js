const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file,'utf8').split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('='); if (i < 0) continue;
    env[t.slice(0,i).trim()] = t.slice(i+1).trim();
  }
  return env;
}
const norm = (v) => String(v || '').trim().replace(/[^0-9A-Za-z]/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
  const env = {...loadEnv('.env.local'), ...process.env};
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo');
  if (error) throw error;

  const byConta = new Map();
  for (const r of data || []) {
    const conta = norm(r.codigo_conta_contabil);
    const cc = norm(r.codigo_centro_custo);
    if (!byConta.has(conta)) byConta.set(conta, []);
    byConta.get(conta).push({ linha: r.codigo_linha_dre, cc });
  }

  const bothAllAndSpecific = [];
  for (const [conta, arr] of byConta.entries()) {
    const hasAll = arr.some(x => !x.cc);
    const hasSpecific = arr.some(x => !!x.cc);
    if (hasAll && hasSpecific) bothAllAndSpecific.push({ conta, refs: arr.length });
  }

  console.log(JSON.stringify({
    contasComMapeamentoGeralEEspecifico: bothAllAndSpecific.length,
    exemplos: bothAllAndSpecific.slice(0, 15)
  }, null, 2));
})();
