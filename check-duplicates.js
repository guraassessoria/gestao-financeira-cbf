#!/usr/bin/env node

/**
 * Script para verificar duplicatas usando Supabase JavaScript client
 */

const fs = require("fs");
const path = require("path");

// Carregar .env.local
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && !key.startsWith("#")) {
    envVars[key.trim()] = rest.join("=").trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Erro: Variáveis Supabase não encontradas em .env.local");
  process.exit(1);
}

console.log("\n✓ Carregando Supabase...");

// Tentar importar supabase
let createClient;
try {
  createClient = require("@supabase/supabase-js").createClient;
} catch (e) {
  console.error("❌ @supabase/supabase-js não instalado");
  console.error(
    "   Execute: npm install @supabase/supabase-js ou yarn add @supabase/supabase-js"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkDuplicates() {
  console.log("\n" + "=".repeat(70));
  console.log("AUDITORIA DE DUPLICATAS - BANCO SUPABASE");
  console.log("=".repeat(70));

  // 1. Lançamentos Contábeis
  console.log("\n[1/4] LANÇAMENTOS CONTÁBEIS (CT2)");
  console.log("-".repeat(70));
  try {
    const { data, error } = await supabase.rpc(
      "check_lancamentos_duplicatas"
    );
    if (error) {
      // RPC não existe, buscar tudo e processar localmente
      const { data: lancamentos, error: err } = await supabase
        .from("lancamentos_contabeis")
        .select("*");

      if (err) throw err;

      const duplicatas = {};
      lancamentos.forEach((l) => {
        const chave = `${l.filial}|${l.numero_lote}|${l.sub_lote}|${l.tipo_lcto}|${l.cta_debito}|${l.cta_credito}`;
        if (!duplicatas[chave]) duplicatas[chave] = [];
        duplicatas[chave].push(l.id);
      });

      const dups = Object.values(duplicatas).filter((v) => v.length > 1);
      if (dups.length === 0) {
        console.log(`✓ Nenhuma duplicata encontrada (${lancamentos.length} registros)`);
      } else {
        console.log(
          `⚠ ${dups.length} combinações duplicadas encontradas`
        );
        dups.slice(0, 3).forEach((ids, i) => {
          console.log(`  [${i + 1}] ${ids.length} registros com IDs: ${ids.join(", ")}`);
        });
      }
    } else {
      console.log("Resultado RPC:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(`❌ Erro: ${e.message}`);
  }

  // 2. De-Para DRE
  console.log("\n[2/4] DE-PARA DRE");
  console.log("-".repeat(70));
  try {
    const { data: mappings, error } = await supabase
      .from("de_para_dre")
      .select("*");

    if (error) throw error;

    const duplicatas = {};
    mappings.forEach((m) => {
      const chave = `${m.codigo_conta_contabil}|${m.codigo_centro_custo}`;
      if (!duplicatas[chave]) duplicatas[chave] = [];
      duplicatas[chave].push(m.id);
    });

    const dups = Object.values(duplicatas).filter((v) => v.length > 1);
    if (dups.length === 0) {
      console.log(`✓ Nenhuma duplicata encontrada (${mappings.length} registros)`);
    } else {
      console.log(`⚠ ${dups.length} combinações duplicadas`);
      dups.forEach((ids, i) => {
        console.log(`  [${i + 1}] ${ids.length} registros`);
      });
    }
  } catch (e) {
    console.error(`❌ Erro: ${e.message}`);
  }

  // 3. Estrutura DRE
  console.log("\n[3/4] ESTRUTURA DRE");
  console.log("-".repeat(70));
  try {
    const { data: estruturas, error } = await supabase
      .from("estrutura_dre")
      .select("*");

    if (error) throw error;

    const duplicatas = {};
    estruturas.forEach((e) => {
      if (!duplicatas[e.codigo_conta]) duplicatas[e.codigo_conta] = [];
      duplicatas[e.codigo_conta].push(e.id);
    });

    const dups = Object.values(duplicatas).filter((v) => v.length > 1);
    if (dups.length === 0) {
      console.log(`✓ Nenhuma duplicata encontrada (${estruturas.length} registros)`);
    } else {
      console.log(`⚠ ${dups.length} códigos duplicados`);
      dups.forEach((ids, i) => {
        console.log(`  [${i + 1}] ${ids.length} registros`);
      });
    }
  } catch (e) {
    console.error(`❌ Erro: ${e.message}`);
  }

  // 4. Resumo
  console.log("\n[4/4] RESUMO GERAL");
  console.log("-".repeat(70));
  const tables = [
    "lancamentos_contabeis",
    "de_para_dre",
    "estrutura_dre",
    "contas_contabeis",
    "centros_custo",
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      console.log(`  ${table.padEnd(25)} → ${count} registros`);
    } catch (e) {
      console.log(`  ${table.padEnd(25)} → ❌ Erro`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("FIM DA AUDITORIA");
  console.log("=".repeat(70) + "\n");
}

// Executar
checkDuplicates().catch(console.error);
