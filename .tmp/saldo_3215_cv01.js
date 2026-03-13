const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const [{data:ct1},{data:lanc}] = await Promise.all([
   sb.from('contas_contabeis').select('cod_conta,cta_superior,classe').or('cod_conta.like.3215%,cta_superior.like.3215%').limit(10000),
   sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,ocorren_deb,ocorren_crd,valor').eq('periodo','2025-01').limit(500000)
 ]);
 const supBy=new Map(), classeBy=new Map();
 for(const c of ct1||[]){const cod=n(c.cod_conta); classeBy.set(cod,String(c.classe||'')); if(c.cta_superior) supBy.set(cod,n(c.cta_superior));}
 const match=(lanc,mapa)=>{const a=n(lanc),b=n(mapa); if(!a||!b) return false; if(a===b) return true; if(!(classeBy.get(b)||'').toLowerCase().startsWith('sint')) return false; const vis=new Set(); let cur=a; while(cur&&!vis.has(cur)){vis.add(cur); const s=supBy.get(cur); if(!s) break; if(s===b) return true; cur=s;} return false;}
 const calc=(mapa)=>{let deb=0,cred=0; for(const r of lanc||[]){const v=Number(r.valor||0); if(match(r.cta_debito,mapa)&&n(r.ocorren_deb)==='1') deb+=v; if(match(r.cta_credito,mapa)&&n(r.ocorren_crd)==='1') cred+=v;} return deb-cred;};
 console.log(JSON.stringify({
   saldo_321501_cv01: calc('321501'),
   saldo_321502_cv01: calc('321502'),
   saldo_3215_cv01: calc('3215')
 },null,2));
})();
