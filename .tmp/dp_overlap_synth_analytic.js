const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const n=v=>String(v||'').trim().replace(/[^0-9A-Za-z]/g,'').replace(/^0+(?=\d)/,'');
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
const {data:dp}=await sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo');
const {data:contas}=await sb.from('contas_contabeis').select('cod_conta,classe,cta_superior');
const classeBy=new Map((contas||[]).map(c=>[n(c.cod_conta), String(c.classe||'')]));
const supBy=new Map((contas||[]).filter(c=>c.cta_superior).map(c=>[n(c.cod_conta), n(c.cta_superior)]));
const mappings=(dp||[]).map(m=>({linha:String(m.codigo_linha_dre||''),conta:n(m.codigo_conta_contabil),cc:n(m.codigo_centro_custo),classe:classeBy.get(n(m.codigo_conta_contabil))||''})).filter(m=>m.conta);
const analyticSet=new Set(mappings.filter(m=>String(m.classe).toLowerCase().startsWith('anal')).map(m=>`${m.conta}|${m.cc||''}`));

function hasAnalyticDesc(mapped){
  const ccKey = mapped.cc||'';
  for(const key of analyticSet){
    const [ac,acc]=key.split('|');
    if(acc!==ccKey) continue;
    let cur=ac; const vis=new Set();
    while(cur && !vis.has(cur)){
      vis.add(cur);
      const sup=supBy.get(cur);
      if(!sup) break;
      if(sup===mapped.conta) return true;
      cur=sup;
    }
  }
  return false;
}

const synthWithAnalyticDesc = mappings.filter(m=>String(m.classe).toLowerCase().startsWith('sint') && hasAnalyticDesc(m));
console.log('Synthetic mappings that have analytic descendants mapped with same CC:', synthWithAnalyticDesc.length);
console.log(JSON.stringify(synthWithAnalyticDesc.slice(0,80),null,2));
})();
