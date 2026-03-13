const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const out={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) out[t.slice(0,i).trim()]=t.slice(i+1).trim();} return out;}
const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
const n=v=>String(v||'').trim().replace(/[^0-9A-Za-z]/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const {data:dp}=await sb.from('de_para_dre').select('codigo_conta_contabil');
 const {data:c}=await sb.from('contas_contabeis').select('cod_conta,cond_normal');
 const condBy=new Map((c||[]).map(x=>[n(x.cod_conta), String(x.cond_normal||'')]));
 const contas=[...new Set((dp||[]).map(x=>n(x.codigo_conta_contabil)).filter(Boolean))];
 let dev=0,cred=0,miss=0,other=0;
 for(const ct of contas){const cd=(condBy.get(ct)||'').toLowerCase(); if(!cd) miss++; else if(cd.startsWith('dev')) dev++; else if(cd.startsWith('cred')) cred++; else other++;}
 console.log({mappedAccounts:contas.length,devedora:dev,credora:cred,missing:miss,other});
})();
