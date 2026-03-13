const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm=v=>String(v||'').trim().replace(/[^0-9A-Za-z]/g,'').replace(/^0+(?=\d)/,'');
function matchesHier(lanc,map,classeMap,supMap){const a=norm(lanc),b=norm(map); if(!a||!b) return false; if(a===b) return true; if(!String(classeMap||'').toLowerCase().startsWith('sint')) return false; const vis=new Set(); let cur=a; while(cur&&!vis.has(cur)){vis.add(cur); const sup=supMap.get(cur); if(!sup) break; if(sup===b) return true; cur=sup;} return false;}
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY); const periodo='2025-01';
const {data:dePara}=await sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo').in('codigo_linha_dre',['1710','1713','1715','1724','1725']).order('codigo_linha_dre');
const {data:contas}=await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior');
const {data:ccs}=await sb.from('centros_custo').select('cod_cc,classe,cc_superior');
const {data:lanc}=await sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,valor').eq('periodo',periodo).limit(500000);
const classeContaBy=new Map((contas||[]).map(c=>[norm(c.cod_conta),c.classe||'']));
const contaSupBy=new Map((contas||[]).filter(c=>c.cta_superior).map(c=>[norm(c.cod_conta),norm(c.cta_superior)]));
const classeCcBy=new Map((ccs||[]).map(c=>[norm(c.cod_cc),c.classe||'']));
const ccSupBy=new Map((ccs||[]).filter(c=>c.cc_superior).map(c=>[norm(c.cod_cc),norm(c.cc_superior)]));

function saldoForMap(contaMap,ccMap){const classeConta=classeContaBy.get(norm(contaMap)); const classeCc=classeCcBy.get(norm(ccMap)); let deb=0,cred=0;
for(const l of lanc||[]){const v=Number(l.valor||0); const d=norm(l.cta_debito), c=norm(l.cta_credito), ccd=norm(l.c_custo_deb), ccc=norm(l.c_custo_crd);
 if(matchesHier(d,contaMap,classeConta,contaSupBy) && matchesHier(ccd,ccMap,classeCc,ccSupBy)) deb+=v;
 if(matchesHier(c,contaMap,classeConta,contaSupBy) && matchesHier(ccc,ccMap,classeCc,ccSupBy)) cred+=v;
}
const code=norm(contaMap); const devedora = !(code.startsWith('31')||code.startsWith('2')); return devedora?deb-cred:cred-deb; }

for(const m of dePara||[]){const s=saldoForMap(m.codigo_conta_contabil,m.codigo_centro_custo); console.log(m.codigo_linha_dre,m.codigo_conta_contabil,'cc',m.codigo_centro_custo,'=>',s.toFixed(2));}
})();
