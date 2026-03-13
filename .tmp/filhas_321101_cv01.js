const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const periodo='2025-01';

 const {data:filhas,error:e1}=await sb
   .from('contas_contabeis')
   .select('cod_conta,descricao,classe,cta_superior')
   .eq('cta_superior','321101')
   .order('cod_conta',{ascending:true});
 if(e1) throw e1;

 const filhasSet=new Set((filhas||[]).map(f=>n(f.cod_conta)));
 const descBy=new Map((filhas||[]).map(f=>[n(f.cod_conta), f.descricao||'']));

 const {data:lanc,error:e2}=await sb
   .from('lancamentos_contabeis')
   .select('cta_debito,cta_credito,ocorren_deb,ocorren_crd,valor,periodo')
   .eq('periodo',periodo)
   .limit(500000);
 if(e2) throw e2;

 const agg=new Map();
 const add=(conta,deb,cred)=>{
   const a=agg.get(conta)||{deb:0,cred:0};
   a.deb+=deb; a.cred+=cred;
   agg.set(conta,a);
 };

 for(const r of lanc||[]){
   const v=Number(r.valor||0);
   const debConta=n(r.cta_debito);
   const credConta=n(r.cta_credito);
   const entDeb=n(r.ocorren_deb);
   const entCred=n(r.ocorren_crd);

   if(filhasSet.has(debConta) && entDeb==='1') add(debConta,v,0);
   if(filhasSet.has(credConta) && entCred==='1') add(credConta,0,v);
 }

 const rows=[...agg.entries()].map(([conta,s])=>({
   conta,
   descricao: descBy.get(conta)||'',
   debito: s.deb,
   credito: s.cred,
   saldoDevedora: s.deb - s.cred,
   saldoCredora: s.cred - s.deb
 })).sort((a,b)=>Math.abs(b.saldoDevedora)-Math.abs(a.saldoDevedora));

 const totalDeb=rows.reduce((acc,r)=>acc+r.debito,0);
 const totalCred=rows.reduce((acc,r)=>acc+r.credito,0);

 console.log(JSON.stringify({
   periodo,
   filtroCV0:'01 ou 1 (normalizado para 1)',
   grupoSintetico:'321101',
   totalFilhasComMovimento: rows.length,
   totalDebito: totalDeb,
   totalCredito: totalCred,
   totalSaldoDevedora: totalDeb-totalCred,
   totalSaldoCredora: totalCred-totalDeb,
   filhas: rows
 },null,2));
})();
