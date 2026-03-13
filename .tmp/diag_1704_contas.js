const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(){const o={...process.env}; if(fs.existsSync(".env.local")) for(const l of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm = v => String(v||"").trim().replace(/\D/g,"").replace(/^0+(?=\d)/,"");
(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  
  // Step 1: Get de_para for line 1704
  const {data:dp} = await sb.from("de_para_dre").select("*").eq("codigo_linha_dre","1704");
  console.log("de_para_dre for 1704:", JSON.stringify(dp));
  
  // Step 2: Get all contas under 321101 (direct children and descendants)
  // First check cta_superior = 321101
  const {data:filhas1} = await sb.from("contas_contabeis").select("cod_conta,descricao,cta_superior,classe")
    .eq("cta_superior","321101").order("cod_conta");
  console.log("\nFilhos diretos de 321101 (cta_superior=321101):", JSON.stringify(filhas1?.map(f=>f.cod_conta)));
  
  // Also check if any use norm version
  const {data:filhas2} = await sb.from("contas_contabeis").select("cod_conta,descricao,cta_superior,classe")
    .like("cod_conta","321101%").order("cod_conta");
  console.log("\nContas com cod_conta LIKE 321101%:", JSON.stringify(filhas2?.map(f=>({cod:f.cod_conta,sup:f.cta_superior}))));
  
  // Step 3: Look at range of accounts starting 3211
  const {data:filhas3} = await sb.from("contas_contabeis").select("cod_conta,descricao,cta_superior,classe")
    .like("cod_conta","3211%").order("cod_conta");
  console.log("\nContas LIKE 3211%:", JSON.stringify(filhas3?.map(f=>({cod:f.cod_conta,desc:f.descricao?.substring(0,30),sup:f.cta_superior}))));
  
})();
