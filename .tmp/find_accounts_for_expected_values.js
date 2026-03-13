const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
function nat(conta){const c=norm(conta); if(c.startsWith('31')||c.startsWith('2')) return 'cred'; if(c.startsWith('32')||c.startsWith('33')||c.startsWith('34')||c.startsWith('1')) return 'dev'; return 'cred';}
async function fetchLanc(sb,periodo){const page=5000; let last=0; const out=[]; while(true){const {data,error}=await sb.from('lancamentos_contabeis').select('id,cta_debito,cta_credito,ocorren_deb,ocorren_crd,valor').eq('periodo',periodo).gt('id',last).order('id',{ascending:true}).limit(page); if(error) throw error; if(!data||!data.length) break; out.push(...data); last=Number(data[data.length-1].id); if(data.length<page) break;} return out;}
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
const periodo='2025-01';
const lanc=await fetchLanc(sb,periodo);
const saldos=new Map();
const add=(conta,tipo,v)=>{const c=norm(conta); const s=saldos.get(c)||{deb:0,cred:0}; s[tipo]+=v; saldos.set(c,s);};
for(const l of lanc){const v=Number(l.valor||0); if(norm(l.ocorren_deb)==='1' && l.cta_debito) add(l.cta_debito,'deb',v); if(norm(l.ocorren_crd)==='1' && l.cta_credito) add(l.cta_credito,'cred',v);} 
const rows=[...saldos.entries()].map(([conta,s])=>{const saldo = nat(conta)==='dev' ? s.deb-s.cred : s.cred-s.deb; return {conta,deb:s.deb,cred:s.cred,saldo};}).sort((a,b)=>Math.abs(b.saldo)-Math.abs(a.saldo));
console.log('Top 80 contas por |saldo| com CV0=01 em 2025-01');
for(const r of rows.slice(0,80)) console.log(`${r.conta} saldo=${r.saldo.toFixed(2)} deb=${r.deb.toFixed(2)} cred=${r.cred.toFixed(2)}`);

const targets=[39217.90,68.60,381.92,709324.80,1132300.00,1841624.80];
console.log('\nMatches aproximados (tolerancia 0.05):');
for(const t of targets){const m=rows.filter(r=>Math.abs(Math.abs(r.saldo)-t)<0.05); console.log('target',t,'=>',m.map(x=>`${x.conta}:${x.saldo.toFixed(2)}`).join(' | ')||'none');}
})();
