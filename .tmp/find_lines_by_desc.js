const fs=require('fs'); const {createClient}=require('@supabase/supabase-js');
function env(){const o={...process.env}; if(fs.existsSync('.env.local')) for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
(async()=>{const e=env(); const sb=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.SUPABASE_SERVICE_ROLE_KEY);
const {data:estr}=await sb.from('estrutura_dre').select('codigo_conta,descricao_conta,codigo_cta_superior,nivel').ilike('descricao_conta','%Seleção Principal%').order('id');
console.log('estrutura com Seleção Principal:',JSON.stringify(estr,null,2));
const {data:alugs}=await sb.from('estrutura_dre').select('codigo_conta,descricao_conta,codigo_cta_superior,nivel').in('descricao_conta',['Depreciações E Amortizações','Utilidades E Servicos','Viagens e Representações','Pessoas Físicas','Pessoas Jurídicas','Serviços Contratados','Gerais']).order('id');
console.log('linhas imagem:',JSON.stringify(alugs,null,2));
})();
