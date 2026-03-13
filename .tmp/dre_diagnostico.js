const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    env[t.slice(0,i).trim()] = t.slice(i+1).trim();
  }
  return env;
}

(async () => {
  const env = { ...loadEnv('.env.local'), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: dePara, error: e1 } = await supabase
    .from('de_para_dre')
    .select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo');
  if (e1) throw e1;

  const { data: contas, error: e2 } = await supabase
    .from('contas_contabeis')
    .select('cod_conta,cond_normal');
  if (e2) throw e2;

  const norm = (v) => String(v || '').trim().replace(/[^0-9A-Za-z]/g, '').replace(/^0+(?=\d)/, '');

  const condByConta = new Map();
  for (const c of contas || []) condByConta.set(norm(c.cod_conta), c.cond_normal || null);

  const keyCount = new Map();
  const contaToLinhas = new Map();

  for (const m of dePara || []) {
    const conta = norm(m.codigo_conta_contabil);
    const cc = norm(m.codigo_centro_custo);
    const linha = String(m.codigo_linha_dre || '').trim();
    const key = `${conta}::${cc}`;
    keyCount.set(key, (keyCount.get(key) || 0) + 1);

    const set = contaToLinhas.get(conta) || new Set();
    set.add(linha);
    contaToLinhas.set(conta, set);
  }

  const duplicatedSameKey = [...keyCount.entries()].filter(([,n]) => n > 1).length;
  const accountMappedToManyLines = [...contaToLinhas.entries()].filter(([,set]) => set.size > 1).length;

  let missingCond = 0;
  let totalMappedAccounts = 0;
  for (const conta of contaToLinhas.keys()) {
    totalMappedAccounts++;
    if (!condByConta.has(conta)) missingCond++;
  }

  console.log(JSON.stringify({
    deParaRows: (dePara || []).length,
    mappedAccounts: totalMappedAccounts,
    duplicatedSameContaCcRows: duplicatedSameKey,
    accountsMappedToMultipleDreLines: accountMappedToManyLines,
    mappedAccountsWithoutCondNormal: missingCond
  }, null, 2));
})();
