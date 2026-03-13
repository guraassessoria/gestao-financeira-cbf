const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const {data, error}=await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor').eq('periodo','2025-01').limit(500000);
 if(error) throw error;
 const agg=new Map();
 const add=(k,deb,cred)=>{const a=agg.get(k)||{deb:0,cred:0}; a.deb+=deb; a.cred+=cred; agg.set(k,a)};
 for(const r of data||[]){
   const v=Number(r.valor||0);
   const d=n(r.cta_debito), c=n(r.cta_credito);
   const entD=n(r.ocorren_deb), entC=n(r.ocorren_crd);
   if(d && d.startsWith('32') && entD==='1') add(d,v,0);
   if(c && c.startsWith('32') && entC==='1') add(c,0,v);
 }
 const arr=[...agg.entries()].map(([conta,s])=>({conta, deb:s.deb, cred:s.cred, saldoDevedora:s.deb-s.cred, abs:Math.abs(s.deb-s.cred)})).sort((a,b)=>b.abs-a.abs);
 console.log(JSON.stringify(arr.slice(0,30),null,2));
})();
