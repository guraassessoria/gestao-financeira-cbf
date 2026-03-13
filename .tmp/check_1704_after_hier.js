const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const [{data:maps},{data:contas},{data:lanc}] = await Promise.all([
   sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo').eq('codigo_linha_dre','1704'),
   sb.from('contas_contabeis').select('cod_conta,classe,cta_superior,cond_normal').or('cod_conta.like.3211%,cta_superior.like.3211%').limit(10000),
   sb.from('lancamentos_contabeis').select('periodo,cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor').eq('periodo','2025-01').limit(500000)
 ]);

 const supBy=new Map(); const classeBy=new Map(); const condBy=new Map();
 for(const c of contas||[]){const cod=n(c.cod_conta); classeBy.set(cod,String(c.classe||'')); condBy.set(cod,String(c.cond_normal||'')); if(c.cta_superior) supBy.set(cod,n(c.cta_superior));}
 const match=(lanc,mapa)=>{const a=n(lanc), b=n(mapa); if(!a||!b) return false; if(a===b) return true; if(!(classeBy.get(b)||'').toLowerCase().startsWith('sint')) return false; const vis=new Set(); let cur=a; while(cur && !vis.has(cur)){vis.add(cur); const s=supBy.get(cur); if(!s) break; if(s===b) return true; cur=s;} return false;}
 const natureza=(conta)=>{const c=(condBy.get(n(conta))||'').toLowerCase(); if(c.startsWith('dev')) return 'dev'; if(c.startsWith('cred')) return 'cred'; const code=n(conta); if(code.startsWith('31')||code.startsWith('2')) return 'cred'; return 'dev';}

 let total=0; const m=(maps||[])[0];
 for(const r of lanc||[]){
   const v=Number(r.valor||0);
   let deb=0, cred=0;
   if(match(r.cta_debito,m.codigo_conta_contabil) && n(r.c_custo_deb)===n(m.codigo_centro_custo)) deb+=v;
   if(match(r.cta_credito,m.codigo_conta_contabil) && n(r.c_custo_crd)===n(m.codigo_centro_custo)) cred+=v;
   if(!deb&&!cred) continue;
   total += natureza(m.codigo_conta_contabil)==='dev' ? (deb-cred) : (cred-deb);
 }
 console.log(JSON.stringify({linha:'1704',contaMapeada:m.codigo_conta_contabil,cc:m.codigo_centro_custo,valorJaneiro:total},null,2));
})();
