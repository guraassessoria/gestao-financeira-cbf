const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const normalizeCode=v=>String(v||'').trim().replace(/[^0-9A-Za-z]/g,'');
const norm=v=>normalizeCode(v).replace(/^0+(?=\d)/,'');
const codesMatch=(a,b)=>{const x=norm(a),y=norm(b); return !!(x&&y&&x===y);} ;
function contaMatches(contaLanc,contaMap,classeMap,supBy){const l=norm(contaLanc),m=norm(contaMap); if(!l||!m) return false; if(l===m) return true; if(!String(classeMap||'').toLowerCase().startsWith('sint')) return false; const vis=new Set(); let cur=l; while(cur&&!vis.has(cur)){vis.add(cur); const s=supBy.get(cur); if(!s) break; if(s===m) return true; cur=s;} return false;}
function natureza(conta){const c=String(conta||'').replace(/\D/g,'').replace(/^0+(?=\d)/,''); if(c.startsWith('31')||c.startsWith('2')) return 'cred'; if(c.startsWith('32')||c.startsWith('33')||c.startsWith('34')||c.startsWith('1')) return 'dev'; return 'cred';}
function saldoNat(saldo,conta){return natureza(conta)==='dev' ? saldo.debito-saldo.credito : saldo.credito-saldo.debito;}
async function fetchLanc(sb,periodo){const page=5000; let last=0; const out=[]; while(true){const {data,error}=await sb.from('lancamentos_contabeis').select('id,periodo,cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor').eq('periodo',periodo).gt('id',last).order('id',{ascending:true}).limit(page); if(error) throw error; if(!data||!data.length) break; out.push(...data); last=Number(data[data.length-1].id); if(data.length<page) break;} return out;}
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
const periodo='2025-01';
const [estrR,dpR,contasR]=await Promise.all([
 sb.from('estrutura_dre').select('codigo_conta,descricao_conta,codigo_cta_superior').in('codigo_cta_superior',['1727','1723','1726','1712','1714','1723']).order('codigo_conta'),
 sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo').in('codigo_linha_dre',['1710','1713','1715','1724','1725']),
 sb.from('contas_contabeis').select('cod_conta,classe,cta_superior')
]);
const lanc=await fetchLanc(sb,periodo);
const contas=contasR.data||[]; const dePara=dpR.data||[]; const estr=estrR.data||[];
const classeBy=new Map(contas.map(c=>[norm(c.cod_conta),c.classe||'']));
const supBy=new Map(contas.filter(c=>c.cta_superior).map(c=>[norm(c.cod_conta),norm(c.cta_superior)]));
const saldoEnt=new Map(); const saldoCc=new Map();
const add=(map,key,tipo,v)=>{const s=map.get(key)||{debito:0,credito:0}; s[tipo]+=v; map.set(key,s);};
for(const l of lanc){const v=Number(l.valor||0); if(l.cta_debito){const c=normalizeCode(l.cta_debito); if(l.ocorren_deb) add(saldoEnt,`${c}|${normalizeCode(l.ocorren_deb)}`,'debito',v); if(l.c_custo_deb) add(saldoCc,`${c}|${normalizeCode(l.c_custo_deb)}`,'debito',v);} if(l.cta_credito){const c=normalizeCode(l.cta_credito); if(l.ocorren_crd) add(saldoEnt,`${c}|${normalizeCode(l.ocorren_crd)}`,'credito',v); if(l.c_custo_crd) add(saldoCc,`${c}|${normalizeCode(l.c_custo_crd)}`,'credito',v);} }
const entEntries=[...saldoEnt.entries()].map(([k,s])=>{const [conta,ent]=k.split('|'); return {conta,ent,saldo:s};});
const ccEntries=[...saldoCc.entries()].map(([k,s])=>{const [conta,cc]=k.split('|'); return {conta,cc,saldo:s};});

for(const m of dePara){const conta=norm(m.codigo_conta_contabil); const cc=norm(m.codigo_centro_custo); const classe=classeBy.get(conta)||null;
 let totalEnt=0, foundEnt=false;
 for(const e of entEntries){if(!contaMatches(e.conta,conta,classe,supBy)||!codesMatch(e.ent,cc)) continue; foundEnt=true; totalEnt += saldoNat(e.saldo,e.conta);} 
 let totalCc=0; for(const c of ccEntries){if(!contaMatches(c.conta,conta,classe,supBy)||!codesMatch(c.cc,cc)) continue; totalCc += saldoNat(c.saldo,c.conta);} 
 const routeVal = foundEnt ? totalEnt : totalCc;
 const desc=(estr.find(x=>x.codigo_conta===m.codigo_linha_dre)||{}).descricao_conta||m.codigo_linha_dre;
 console.log(`${m.codigo_linha_dre} ${desc} -> route=${routeVal.toFixed(2)} ent=${totalEnt.toFixed(2)} cc=${totalCc.toFixed(2)} foundEnt=${foundEnt}`);
}
})();
