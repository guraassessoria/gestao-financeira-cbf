const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(){const o={...process.env}; if(fs.existsSync(".env.local")) for(const l of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm = v => String(v||"").trim().replace(/\D/g,"").replace(/^0+(?=\d)/,"");
(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  
  const filhas = ["321101001","321101002","321101003","321101004","321101005","321101006","321101007","321101008","321101009"];
  
  // Get ALL lancamentos for these accounts in Jan 2025
  const {data:lanc} = await sb.from("lancamentos_contabeis")
    .select("cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor")
    .eq("periodo","2025-01")
    .or(filhas.map(f=>`cta_debito.eq.${f}`).concat(filhas.map(f=>`cta_credito.eq.${f}`)).join(","))
    .limit(5000);
  
  // Separate by CV0 group
  const byCV0 = {};
  for (const r of lanc||[]) {
    const v = Number(r.valor||0);
    if (filhas.includes(r.cta_debito)) {
      const cv0 = String(r.ocorren_deb||"none");
      const cc = String(r.c_custo_deb||"none");
      if (!byCV0[cv0]) byCV0[cv0] = {total: 0, ccs: {}};
      byCV0[cv0].total += v;
      byCV0[cv0].ccs[cc] = (byCV0[cv0].ccs[cc]||0) + v;
    }
  }
  
  console.log("=== Movement by CV0 (ocorren_deb) for 321101 children in Jan 2025 ===");
  for (const [cv0, d] of Object.entries(byCV0).sort((a,b)=>b[1].total-a[1].total)) {
    console.log(`CV0=${cv0}: ${d.total.toFixed(2)}`);
    const topCC = Object.entries(d.ccs).sort((a,b)=>b[1]-a[1]).slice(0,5);
    for (const [cc,v] of topCC) console.log(`  CC=${cc}: ${v.toFixed(2)}`);
  }
  
  // Also check by CC prefix 11
  let total_cc11 = 0;
  for (const r of lanc||[]) {
    const v = Number(r.valor||0);
    if (filhas.includes(r.cta_debito) && String(r.c_custo_deb||"").startsWith("11")) total_cc11 += v;
    if (filhas.includes(r.cta_credito) && String(r.c_custo_crd||"").startsWith("11")) total_cc11 -= v;
  }
  console.log(`\nTotal with CC prefix "11": ${total_cc11.toFixed(2)}`);
  
  // And by CC prefix 110
  let total_cc110 = 0;
  for (const r of lanc||[]) {
    const v = Number(r.valor||0);
    if (filhas.includes(r.cta_debito) && String(r.c_custo_deb||"").startsWith("110")) total_cc110 += v;
    if (filhas.includes(r.cta_credito) && String(r.c_custo_crd||"").startsWith("110")) total_cc110 -= v;
  }
  console.log(`Total with CC prefix "110": ${total_cc110.toFixed(2)}`);
  
  // By specific CC groups - check first 3 chars as CC parent
  const byCC3 = {};
  for (const r of lanc||[]) {
    const v = Number(r.valor||0);
    if (filhas.includes(r.cta_debito)) {
      const cc = String(r.c_custo_deb||"");
      const p = cc.substring(0,5);
      if (p) byCC3[p] = (byCC3[p]||0) + v;
    }
  }
  console.log("\n=== Totals by first 5 chars of CC ===");
  for (const [p,t] of Object.entries(byCC3).sort((a,b)=>b[1]-a[1]).slice(0,20)) {
    console.log(`${p}: ${t.toFixed(2)}`);
  }
})();
