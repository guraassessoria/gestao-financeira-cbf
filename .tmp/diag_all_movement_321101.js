const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(){const o={...process.env}; if(fs.existsSync(".env.local")) for(const l of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}
const norm = v => String(v||"").trim().replace(/\D/g,"").replace(/^0+(?=\d)/,"");
(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  
  const filhas = ["321101001","321101002","321101003","321101004","321101005","321101006","321101007","321101008","321101009"];
  
  // Get ALL lancamentos for these accounts in Jan 2025 - no filter
  const {data:lanc, error} = await sb.from("lancamentos_contabeis")
    .select("cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor")
    .eq("periodo","2025-01")
    .or(filhas.map(f=>`cta_debito.eq.${f}`).concat(filhas.map(f=>`cta_credito.eq.${f}`)).join(","))
    .limit(5000);
  
  if (error) { console.error("Error:", error); return; }
  
  console.log(`Total lancamentos for 321101 children in 2025-01 (all): ${lanc?.length}`);
  
  // Aggregate
  const agg = {};
  for (const r of lanc||[]) {
    const v = Number(r.valor||0);
    const d = r.cta_debito;
    const c = r.cta_credito;
    
    if (filhas.includes(d)) {
      if (!agg[d]) agg[d] = {deb:0,cred:0,cv0_deb_vals:new Set(),cc_deb_vals:new Set()};
      agg[d].deb += v;
      agg[d].cv0_deb_vals.add(String(r.ocorren_deb||""));
      agg[d].cc_deb_vals.add(String(r.c_custo_deb||""));
    }
    if (filhas.includes(c)) {
      if (!agg[c]) agg[c] = {deb:0,cred:0,cv0_cred_vals:new Set(),cc_cred_vals:new Set()};
      agg[c].cred += v;
      if (!agg[c].cv0_cred_vals) agg[c].cv0_cred_vals = new Set();
      if (!agg[c].cc_cred_vals) agg[c].cc_cred_vals = new Set();
      agg[c].cv0_cred_vals.add(String(r.ocorren_crd||""));
      agg[c].cc_cred_vals.add(String(r.c_custo_crd||""));
    }
  }
  
  let totalDeb = 0, totalCred = 0;
  for (const [conta, s] of Object.entries(agg)) {
    totalDeb += s.deb;
    totalCred += s.cred;
    console.log(`${conta}: deb=${s.deb.toFixed(2)} cred=${s.cred.toFixed(2)} saldo=${(s.deb-s.cred).toFixed(2)}`);
    if (s.cv0_deb_vals?.size) console.log(`  CV0 deb values: ${[...s.cv0_deb_vals].join(",")}`);
    if (s.cc_deb_vals?.size) console.log(`  CC deb values: ${[...s.cc_deb_vals].join(",")}`);
    if (s.cv0_cred_vals?.size) console.log(`  CV0 cred values: ${[...s.cv0_cred_vals].join(",")}`);
    if (s.cc_cred_vals?.size) console.log(`  CC cred values: ${[...s.cc_cred_vals].join(",")}`);
  }
  
  console.log(`\nTotal Debito: ${totalDeb.toFixed(2)}`);
  console.log(`Total Credito: ${totalCred.toFixed(2)}`);
  console.log(`Saldo Devedora (deb-cred): ${(totalDeb-totalCred).toFixed(2)}`);
  
  // What unique CV0 values exist?
  const {data:cv0samples} = await sb.from("lancamentos_contabeis")
    .select("ocorren_deb,ocorren_crd,c_custo_deb,c_custo_crd")
    .eq("periodo","2025-01")
    .or(filhas.map(f=>`cta_debito.eq.${f}`).join(","))
    .limit(100);
  const cv0_uniq = new Set((cv0samples||[]).map(r=>r.ocorren_deb));
  const cc_uniq = new Set((cv0samples||[]).map(r=>r.c_custo_deb));
  console.log("\nUnique ocorren_deb (CV0) for 321101 children as debito:", [...cv0_uniq].sort());
  console.log("Unique c_custo_deb (CC) for 321101 children as debito:", [...cc_uniq].sort());
})();
