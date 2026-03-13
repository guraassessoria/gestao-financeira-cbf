const fs=require('fs');
const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const {data,error}=await sb.from('contas_contabeis').select('cod_conta,descricao,classe,cta_superior').or('cod_conta.eq.321101,cta_superior.eq.321101,cod_conta.like.3211%').order('cod_conta',{ascending:true}).limit(5000);
 if(error) throw error;
 console.log(JSON.stringify(data,null,2));
})();
