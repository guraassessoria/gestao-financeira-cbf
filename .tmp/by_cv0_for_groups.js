const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
function dev(conta){const c=norm(conta); return c.startsWith('32')||c.startsWith('33')||c.startsWith('34')||c.startsWith('1');}
async function fetch(sb,p){const page=5000; let last=0; const out=[]; while(true){const {data,error}=await sb.from('lancamentos_contabeis').select('id,cta_debito,cta_credito,ocorren_deb,ocorren_crd,valor').eq('periodo',p).gt('id',last).order('id',{ascending:true}).limit(page); if(error) throw error; if(!data?.length) break; out.push(...data); last=Number(data[data.length-1].id); if(data.length<page) break;} return out;}
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY); const lanc=await fetch(sb,'2025-01');
const targets=['321202','321301','321401','321501','321502'];
for(const pref of targets){
 const byCv0=new Map();
 const add=(cv,tipo,v)=>{const s=byCv0.get(cv)||{deb:0,cred:0}; s[tipo]+=v; byCv0.set(cv,s);};
 for(const l of lanc){const v=Number(l.valor||0); const d=norm(l.cta_debito), c=norm(l.cta_credito); if(d.startsWith(pref) && l.ocorren_deb) add(norm(l.ocorren_deb)||'none','deb',v); if(c.startsWith(pref) && l.ocorren_crd) add(norm(l.ocorren_crd)||'none','cred',v);} 
 const rows=[...byCv0.entries()].map(([cv,s])=>({cv, saldo: (dev(pref)?(s.deb-s.cred):(s.cred-s.deb)), deb:s.deb, cred:s.cred})).sort((a,b)=>Math.abs(b.saldo)-Math.abs(a.saldo));
 console.log('\nConta grupo',pref); for(const r of rows.slice(0,10)) console.log(` CV0=${r.cv} saldo=${r.saldo.toFixed(2)} deb=${r.deb.toFixed(2)} cred=${r.cred.toFixed(2)}`);
}
})();
