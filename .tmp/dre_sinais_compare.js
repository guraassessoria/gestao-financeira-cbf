const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
function loadEnv(file){const e={}; if(!fs.existsSync(file)) return e; for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const t=line.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i<0) continue; e[t.slice(0,i).trim()]=t.slice(i+1).trim();} return e;}
const env={...loadEnv('.env.local'), ...process.env};
const supabase=createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const norm=(v)=>String(v||'').trim().replace(/[^0-9A-Za-z]/g,'').replace(/^0+(?=\d)/,'');
const same=(a,b)=>norm(a)===norm(b)&&norm(a)!=='';
(async()=>{
  const ano='2025';
  const periodos=Array.from({length:12},(_,i)=>`${ano}-${String(i+1).padStart(2,'0')}`);
  const [{data:estr},{data:dp},{data:contas},{data:lanc}] = await Promise.all([
    supabase.from('estrutura_dre').select('codigo_conta,descricao_conta'),
    supabase.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo'),
    supabase.from('contas_contabeis').select('cod_conta,cond_normal'),
    supabase.from('lancamentos_contabeis').select('periodo,cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor').in('periodo',periodos).limit(500000)
  ]);
  const cond=new Map((contas||[]).map(c=>[norm(c.cod_conta), c.cond_normal||'']));
  const byLineA=new Map();
  const byLineB=new Map();

  const add=(m,k,v)=>m.set(k,(m.get(k)||0)+v);

  for(const m of (dp||[])){
    const conta=norm(m.codigo_conta_contabil); const cc=norm(m.codigo_centro_custo); const linha=m.codigo_linha_dre;
    for(const l of (lanc||[])){
      const v=Number(l.valor||0);
      let deb=0, cred=0;
      if (same(l.cta_debito,conta) && (!cc || same(l.c_custo_deb,cc))) deb += v;
      if (same(l.cta_credito,conta) && (!cc || same(l.c_custo_crd,cc))) cred += v;
      if (deb===0 && cred===0) continue;
      const c = (cond.get(conta)||'').toLowerCase();
      const valA = c.startsWith('dev') ? (deb-cred) : (cred-deb);
      const valB = cred - deb; // regra DRE
      add(byLineA, linha, valA);
      add(byLineB, linha, valB);
    }
  }

  const desc = new Map((estr||[]).map(e=>[e.codigo_conta, e.descricao_conta]));
  const rows=[];
  for(const [linha,vA] of byLineA.entries()){
    const vB=byLineB.get(linha)||0;
    rows.push({linha, desc: desc.get(linha)||'', natureza: vA, dre: vB});
  }
  rows.sort((a,b)=>Math.abs(b.natureza)-Math.abs(a.natureza));
  console.log(JSON.stringify(rows.slice(0,20),null,2));
})();
