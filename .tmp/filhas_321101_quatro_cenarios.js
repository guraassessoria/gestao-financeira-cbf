const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
  const e=env();
  const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
  const periodo='2025-01';

  const {data:filhas,error:e1}=await sb
    .from('contas_contabeis')
    .select('cod_conta,descricao')
    .eq('cta_superior','321101')
    .order('cod_conta',{ascending:true});
  if(e1) throw e1;

  const filhasSet=new Set((filhas||[]).map(f=>norm(f.cod_conta)));
  const descBy=new Map((filhas||[]).map(f=>[norm(f.cod_conta), f.descricao||'']));

  const {data:lanc,error:e2}=await sb
    .from('lancamentos_contabeis')
    .select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor')
    .eq('periodo',periodo)
    .limit(500000);
  if(e2) throw e2;

  const scenarios = {
    cv0_strict_01: {
      name: 'CV0 estrito = 01',
      debCheck: (r) => String(r.ocorren_deb || '').trim() === '01',
      credCheck: (r) => String(r.ocorren_crd || '').trim() === '01',
    },
    cv0_normalized_01_or_1: {
      name: 'CV0 normalizado = 01 ou 1',
      debCheck: (r) => norm(r.ocorren_deb) === '1',
      credCheck: (r) => norm(r.ocorren_crd) === '1',
    },
    cc_eq_1: {
      name: 'CC = 1',
      debCheck: (r) => norm(r.c_custo_deb) === '1',
      credCheck: (r) => norm(r.c_custo_crd) === '1',
    },
    cv0_or_cc_eq_1: {
      name: 'CV0(01/1) OU CC=1',
      debCheck: (r) => norm(r.ocorren_deb) === '1' || norm(r.c_custo_deb) === '1',
      credCheck: (r) => norm(r.ocorren_crd) === '1' || norm(r.c_custo_crd) === '1',
    },
  };

  const output = { periodo, grupoSintetico: '321101', filhosEncontradas: (filhas||[]).length, cenarios: {} };

  for (const [key, sc] of Object.entries(scenarios)) {
    const agg = new Map();
    const add=(conta,deb,cred)=>{const a=agg.get(conta)||{deb:0,cred:0}; a.deb+=deb; a.cred+=cred; agg.set(conta,a);};

    for (const r of lanc || []) {
      const v=Number(r.valor||0);
      const d=norm(r.cta_debito);
      const c=norm(r.cta_credito);

      if (filhasSet.has(d) && sc.debCheck(r)) add(d,v,0);
      if (filhasSet.has(c) && sc.credCheck(r)) add(c,0,v);
    }

    const rows=[...agg.entries()].map(([conta,s])=>(
      {
        conta,
        descricao: descBy.get(conta)||'',
        debito:s.deb,
        credito:s.cred,
        saldoDevedora:s.deb-s.cred,
      }
    )).sort((a,b)=>Math.abs(b.saldoDevedora)-Math.abs(a.saldoDevedora));

    const totalDeb=rows.reduce((a,r)=>a+r.debito,0);
    const totalCred=rows.reduce((a,r)=>a+r.credito,0);

    output.cenarios[key] = {
      nome: sc.name,
      totalFilhasComMovimento: rows.length,
      totalDebito: totalDeb,
      totalCredito: totalCred,
      totalSaldoDevedora: totalDeb-totalCred,
      topFilhas: rows.slice(0,10),
    };
  }

  console.log(JSON.stringify(output,null,2));
})();
