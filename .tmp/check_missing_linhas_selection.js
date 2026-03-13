const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const normalizeCode = (v) => String(v||'').trim().replace(/[^0-9A-Za-z]/g,'');
const normalizeComparableCode = (v) => normalizeCode(v).replace(/^0+(?=\d)/,'');
const codesMatch = (a,b) => {
  const na = normalizeComparableCode(a), nb = normalizeComparableCode(b);
  return !!(na && nb && na === nb);
};
const contaMatchesMapeamento = (contaLanc, contaMapeada, classeContaMapeada, contaSuperiorByConta) => {
  const lanc = normalizeComparableCode(contaLanc);
  const mapa = normalizeComparableCode(contaMapeada);
  if (!lanc || !mapa) return false;
  if (lanc === mapa) return true;
  const classe = String(classeContaMapeada||'').toLowerCase();
  if (!classe.startsWith('sint')) return false;
  const visited = new Set();
  let atual = lanc;
  while (atual && !visited.has(atual)) {
    visited.add(atual);
    const sup = contaSuperiorByConta.get(atual);
    if (!sup) break;
    if (sup === mapa) return true;
    atual = sup;
  }
  return false;
};
const getSaldoNatureza = (saldo, contaCode) => {
  const code = String(contaCode||'').replace(/\D/g,'').replace(/^0+(?=\d)/,'');
  if (code.startsWith('31') || code.startsWith('2')) return saldo.credito - saldo.debito;
  return saldo.debito - saldo.credito;
};
(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);

  const periodo='2025-01';
  const {data:dePara} = await sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo').in('codigo_linha_dre',['1710','1713','1715','1724','1725']).order('codigo_linha_dre');
  const {data:contas} = await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior');
  const {data:lanc} = await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor').eq('periodo',periodo).limit(500000);

  const classeByConta = new Map((contas||[]).map(c=>[normalizeComparableCode(c.cod_conta), c.classe||'']));
  const contaSuperiorByConta = new Map((contas||[]).filter(c=>c.cta_superior).map(c=>[normalizeComparableCode(c.cod_conta), normalizeComparableCode(c.cta_superior)]));

  const saldoEnt = new Map();
  const add = (map,key,tipo,valor)=>{const s=map.get(key)||{debito:0,credito:0}; s[tipo]+=Number(valor||0); map.set(key,s);};
  for(const l of lanc||[]){
    const v = Number(l.valor||0);
    if(l.cta_debito && l.ocorren_deb) add(saldoEnt, `${normalizeCode(l.cta_debito)}|${normalizeCode(l.ocorren_deb)}`, 'debito', v);
    if(l.cta_credito && l.ocorren_crd) add(saldoEnt, `${normalizeCode(l.cta_credito)}|${normalizeCode(l.ocorren_crd)}`, 'credito', v);
  }
  const entEntries = [...saldoEnt.entries()].map(([k,s])=>{const [conta,entidade]=k.split('|'); return {conta,entidade,saldo:s};});

  console.log('Line | ContaMapeada | CC | AtualRoute | BrutoCV0_01');
  for(const m of dePara||[]){
    const conta = normalizeComparableCode(m.codigo_conta_contabil);
    const cc = normalizeComparableCode(m.codigo_centro_custo);
    const classeContaMapeada = classeByConta.get(conta) || null;

    // route-like calc (entidade only for cc=1)
    let totalRoute = 0; let found=false;
    for (const entry of entEntries) {
      if(!contaMatchesMapeamento(entry.conta,conta,classeContaMapeada,contaSuperiorByConta)) continue;
      if(!codesMatch(entry.entidade,cc)) continue;
      totalRoute += getSaldoNatureza(entry.saldo, entry.conta);
      found=true;
    }

    // brute CV0=01 for matching account hierarchy
    let totalBruto = 0;
    for (const entry of entEntries) {
      if(!contaMatchesMapeamento(entry.conta,conta,classeContaMapeada,contaSuperiorByConta)) continue;
      if(normalizeComparableCode(entry.entidade)!=='1') continue;
      totalBruto += getSaldoNatureza(entry.saldo, entry.conta);
    }

    console.log(`${m.codigo_linha_dre} | ${m.codigo_conta_contabil} | ${m.codigo_centro_custo} | ${totalRoute.toFixed(2)} | ${totalBruto.toFixed(2)}${found?'':' (no entity match)'}`);
  }
})();
