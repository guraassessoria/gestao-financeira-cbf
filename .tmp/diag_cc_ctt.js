const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(){const o={...process.env}; if(fs.existsSync(".env.local")) for(const l of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check what centros_custo table looks like 
  const {data:ctt} = await sb.from("centros_custo").select("*").limit(50);
  console.log("centros_custo sample (first 50):", JSON.stringify(ctt?.slice(0,10)));
  
  // Also check any tables related to centros
  const {data:dp1704} = await sb.from("de_para_dre").select("*").like("codigo_linha_dre","17%").order("codigo_linha_dre").limit(30);
  console.log("\nde_para lines 17xx:", JSON.stringify(dp1704));
})();
