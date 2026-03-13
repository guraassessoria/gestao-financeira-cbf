const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm=v=>String(v||'').trim().replace(/\D/g,'').replace(/^0+(?=\d)/,'');
const natureza=(conta, cond)=>{const c=String(cond||'').toLowerCase(); if(c.startsWith('dev')) return 'dev'; if(c.startsWith('cred')) return 'cred'; const code=norm(conta); if(code.startsWith('31')||code.startsWith('2')) return 'cred'; if(code.startsWith('32')||code.startsWith('33')||code.startsWith('34')||code.startsWith('1')) return 'dev'; return 'cred';};
(async()=>{
 const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
 const periodo='2025-01';
 const [{data:mapRows},{data:contas},{data:lanc}] = await Promise.all([
   sb.from('de_para_dre').select('codigo_linha_dre,codigo_conta_contabil,codigo_centro_custo').eq('codigo_linha_dre','1704'),
   sb.from('contas_contabeis').select('cod_conta,classe,cta_superior,cond_normal').limit(500000),
   sb.from('lancamentos_contabeis').select('cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor').eq('periodo',periodo).limit(500000)
 ]);

 const supBy=new Map(), classeBy=new Map(), condBy=new Map();
 for(const c of contas||[]){const cod=norm(c.cod_conta); classeBy.set(cod,String(c.classe||'')); condBy.set(cod,String(c.cond_normal||'')); if(c.cta_superior) supBy.set(cod,norm(c.cta_superior));}
 const contaMatch=(lanc, mapa)=>{const a=norm(lanc), b=norm(mapa); if(!a||!b) return false; if(a===b) return true; if(!(classeBy.get(b)||'').toLowerCase().startsWith('sint')) return false; const vis=new Set(); let cur=a; while(cur&&!vis.has(cur)){vis.add(cur); const s=supBy.get(cur); if(!s) break; if(s===b) return true; cur=s;} return false;};

 let total=0, deb=0, cred=0, matched=0;
 for(const m of mapRows||[]){
   const conta = m.codigo_conta_contabil;
   const cc = norm(m.codigo_centro_custo);
   const nat = natureza(conta, condBy.get(norm(conta)));

   for(const r of lanc||[]){
     const v=Number(r.valor||0);
     let d=0,c=0;

     if (contaMatch(r.cta_debito, conta)) {
       // prioriza entidade CV0; fallback para centro de custo
       if (norm(r.ocorren_deb)===cc || (!norm(r.ocorren_deb) && norm(r.c_custo_deb)===cc)) d+=v;
     }
     if (contaMatch(r.cta_credito, conta)) {
       if (norm(r.ocorren_crd)===cc || (!norm(r.ocorren_crd) && norm(r.c_custo_crd)===cc)) c+=v;
     }

     if (d||c) {
       matched++;
       deb += d;
       cred += c;
       total += nat==='dev' ? (d-c) : (c-d);
     }
   }
 }

 console.log(JSON.stringify({
   linha:'1704',
   periodo,
   dePara: mapRows,
   matchedRows: matched,
   debitoConsiderado: deb,
   creditoConsiderado: cred,
   valorLinha1704: total
 },null,2));
})();
