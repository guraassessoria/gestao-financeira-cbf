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

(async () => {
  const env = { ...loadEnv('.env.local'), ...process.env };
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: linhas, error: e1 } = await supabase
    .from('estrutura_dre')
    .select('codigo_conta,descricao_conta,codigo_cta_superior,nivel')
    .or('descricao_conta.ilike.%salario%,descricao_conta.ilike.%honorario%,descricao_conta.ilike.%honorários%')
    .order('codigo_conta', { ascending: true });
  if (e1) throw e1;

  console.log('LINHAS CANDIDATAS (estrutura_dre):');
  console.log(JSON.stringify(linhas || [], null, 2));

  if (!linhas || linhas.length === 0) return;

  for (const l of linhas) {
    const { data: maps, error: e2 } = await supabase
      .from('de_para_dre')
      .select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo,observacao')
      .eq('codigo_linha_dre', l.codigo_conta)
      .order('codigo_conta_contabil', { ascending: true });
    if (e2) throw e2;

    console.log(`\nDE-PARA da linha ${l.codigo_conta} - ${l.descricao_conta}:`);
    console.log(JSON.stringify(maps || [], null, 2));
  }

  const { data: entidades, error: e3 } = await supabase
    .from('entidades_dre')
    .select('codigo,descricao')
    .eq('codigo', '01');
  if (e3) throw e3;

  console.log('\nENTIDADE CV0=01:');
  console.log(JSON.stringify(entidades || [], null, 2));
})();
