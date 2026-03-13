const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const {data:lanc,error:e1}=await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,ocorren_deb,ocorren_crd,valor').eq('periodo','2025-01').limit(500000);
 if(e1) throw e1;
 const sums=new Map();
 const add=(conta,v)=>{if(!conta) return; sums.set(conta,(sums.get(conta)||0)+v)};
 for(const r of lanc||[]){
   const v=Number(r.valor||0);
   if(n(r.ocorren_deb)==='1') add(n(r.cta_debito), v);
   if(n(r.ocorren_crd)==='1') add(n(r.cta_credito), -v);
 }
 const top=[...sums.entries()].map(([conta,saldo])=>({conta,saldo,abs:Math.abs(saldo)})).filter(x=>x.conta.startsWith('32')).sort((a,b)=>b.abs-a.abs).slice(0,25);
 const cods=top.map(x=>x.conta);
 const {data:ct1,error:e2}=await sb.from('contas_contabeis').select('cod_conta,descricao,cta_superior,classe').in('cod_conta',cods);
 if(e2) throw e2;
 const descBy=new Map((ct1||[]).map(c=>[n(c.cod_conta),c]));
 const out=top.map(t=>({conta:t.conta,saldo:t.saldo,descricao:descBy.get(t.conta)?.descricao||null,superior:descBy.get(t.conta)?.cta_superior||null,classe:descBy.get(t.conta)?.classe||null}));
 console.log(JSON.stringify(out,null,2));
})();
