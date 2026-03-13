const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
function loadEnv(file){const e={}; if(!fs.existsSync(file)) return e; for(const l of fs.readFileSync(file,'utf8').split(/\r?\n/)){const t=l.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i<0) continue; e[t.slice(0,i).trim()]=t.slice(i+1).trim();} return e;}
(async()=>{
 const env={...loadEnv('.env.local'), ...process.env};
 const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
 const { data, error } = await sb.from('lancamentos_contabeis').select('periodo').limit(500000);
 if(error) throw error;
 const counts=new Map();
 for(const r of data||[]){counts.set(r.periodo,(counts.get(r.periodo)||0)+1)}
 const arr=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
 console.log(JSON.stringify(arr,null,2));
})();
