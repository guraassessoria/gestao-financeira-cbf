const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(){const o={...process.env}; if(fs.existsSync(".env.local")) for(const l of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith("#")) continue; const i=t.indexOf("="); if(i>0) o[t.slice(0,i).trim()]=t.slice(i+1).trim();} return o;}

// === Replicate DRE route logic ===
const normalizeCode = v => String(v||"").trim().replace(/[^0-9A-Za-z]/g,"");
const normalizeComparableCode = v => normalizeCode(v).replace(/^0+(?=\d)/,"");
const codesMatch = (a,b) => {
  const na = normalizeComparableCode(a), nb = normalizeComparableCode(b);
  return !!(na && nb && na === nb);
};
const contaMatchesMapeamento = (contaLanc, contaMapeada, classeContaMapeada, contaSupBy) => {
  const lanc = normalizeComparableCode(contaLanc);
  const mapa = normalizeComparableCode(contaMapeada);
  if (!lanc || !mapa) return false;
  if (lanc === mapa) return true;
  const classe = (classeContaMapeada||"").toLowerCase();
  if (!classe.startsWith("sint")) return false;
  const visited = new Set();
  let atual = lanc;
  while (atual && !visited.has(atual)) {
    visited.add(atual);
    const sup = contaSupBy.get(atual);
    if (!sup) break;
    if (sup === mapa) return true;
    atual = sup;
  }
  return false;
};

(async()=>{
  const e = env();
  const sb = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
  const PAGE_SIZE = 1000;
  const FETCH_CONCURRENCY = 8;
  const periodo = "2025-01";
  
  // Load contas
  const {data:contas} = await sb.from("contas_contabeis").select("cod_conta,cond_normal,classe,cta_superior");
  const condNormalByConta = new Map();
  const classeByConta = new Map();
  const contaSuperiorByConta = new Map();
  for (const c of contas||[]) {
    const k = normalizeComparableCode(c.cod_conta);
    condNormalByConta.set(k, c.cond_normal||"Credora");
    classeByConta.set(k, c.classe||"");
    if (c.cta_superior) contaSuperiorByConta.set(k, normalizeComparableCode(c.cta_superior));
  }
  console.log(`Loaded ${contas?.length} contas`);
  
  // Check 321101002 hierarchy
  console.log("\n321101002 in classeByConta:", classeByConta.get("321101002"));
  console.log("321101002 superior:", contaSuperiorByConta.get("321101002"));
  console.log("321101 classe:", classeByConta.get("321101"));
  console.log("321101 superior:", contaSuperiorByConta.get("321101"));
  
  // Load lancamentos for 2025-01 with pagination
  const {count} = await sb.from("lancamentos_contabeis").select("*",{count:"exact",head:true}).eq("periodo",periodo);
  console.log(`\nTotal lancamentos for ${periodo}: ${count}`);
  
  const totalPages = Math.ceil((count||0)/PAGE_SIZE);
  const saldoContaEntidade = new Map();
  
  const addSaldo = (map, key, tipo, valor) => {
    const s = map.get(key)||{debito:0,credito:0};
    s[tipo] += Number(valor||0);
    map.set(key,s);
  };
  
  for (let ps=0; ps<totalPages; ps+=FETCH_CONCURRENCY) {
    const pe = Math.min(ps+FETCH_CONCURRENCY, totalPages);
    const pages = [];
    for (let p=ps; p<pe; p++) pages.push(p);
    
    const results = await Promise.all(pages.map(p =>
      sb.from("lancamentos_contabeis")
        .select("cta_debito,cta_credito,c_custo_deb,c_custo_crd,ocorren_deb,ocorren_crd,valor")
        .eq("periodo",periodo)
        .range(p*PAGE_SIZE,(p+1)*PAGE_SIZE-1)
    ));
    
    for (const res of results) {
      for (const l of res.data||[]) {
        const v = Number(l.valor||0);
        if (l.cta_debito && l.ocorren_deb) {
          addSaldo(saldoContaEntidade, `${normalizeCode(l.cta_debito)}|${normalizeCode(l.ocorren_deb)}`, "debito", v);
        }
        if (l.cta_credito && l.ocorren_crd) {
          addSaldo(saldoContaEntidade, `${normalizeCode(l.cta_credito)}|${normalizeCode(l.ocorren_crd)}`, "credito", v);
        }
      }
    }
  }
  
  console.log(`\nLoaded saldoContaEntidade entries: ${saldoContaEntidade.size}`);
  
  // Check what we have for 321101002 + ocorren "01"
  const key321101002_01 = `321101002|01`;
  console.log(`Saldo 321101002|01:`, saldoContaEntidade.get(key321101002_01));
  
  // Now simulate getValorMapeamento(periodo="2025-01", conta="321101", cc="1")
  const conta = "321101";
  const cc = "1";
  const classeContaMapeada = classeByConta.get(normalizeComparableCode(conta)) || null;
  console.log(`\nclasseContaMapeada for 321101: ${classeContaMapeada}`);
  
  // Build entries list
  const entidadeEntries = [];
  for (const [key, saldo] of saldoContaEntidade.entries()) {
    const [c, ent] = key.split("|");
    entidadeEntries.push({conta: c, entidade: ent, saldo});
  }
  
  let total = 0;
  let found = false;
  for (const entry of entidadeEntries) {
    if (!contaMatchesMapeamento(entry.conta, conta, classeContaMapeada, contaSuperiorByConta)) continue;
    if (!codesMatch(entry.entidade, cc)) continue;
    
    // getSaldoNatureza: 321101 children are 32* → Devedora → deb-cred
    const s = entry.saldo.debito - entry.saldo.credito;
    console.log(`  Matched entry: conta=${entry.conta}, ent=${entry.entidade}, deb=${entry.saldo.debito}, cred=${entry.saldo.credito}, saldo=${s}`);
    total += s;
    found = true;
  }
  
  console.log(`\nfound: ${found}`);
  console.log(`Total for linha 1704 Jan 2025: ${total.toFixed(2)}`);
  console.log(`Expected: 2578064.42`);
})();
