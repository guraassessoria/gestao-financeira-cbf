#!/usr/bin/env node

/**
 * Verificar se a deduplicação foi aplicada
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

const createClient = require("@supabase/supabase-js").createClient;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function verify() {
  console.log("\n" + "=".repeat(70));
  console.log("VERIFICAÇÃO: Deduplicação de Lançamentos");
  console.log("=".repeat(70));

  try {
    // Contar total de registros
    const { count, error } = await supabase
      .from("lancamentos_contabeis")
      .select("*", { count: "exact", head: true });

    console.log(`\n✓ Total de lançamentos no banco: ${count}`);

    if (count < 487344) {
      console.log(
        `✓ DEDUPLICAÇÃO BEM-SUCEDIDA! (removidos ~${487868 - count} registros duplicados)`
      );
    } else if (count === 487868) {
      console.log(`⚠ Nenhuma mudança detectada - verificando se há duplicatas...`);

      // Verificar duplicatas
      const { data: lancamentos } = await supabase
        .from("lancamentos_contabeis")
        .select("*");

      const duplicatas = {};
      lancamentos.forEach((l) => {
        const chave = `${l.filial}|${l.numero_lote}|${l.sub_lote}|${l.tipo_lcto}|${l.cta_debito}|${l.cta_credito}`;
        if (!duplicatas[chave]) duplicatas[chave] = [];
        duplicatas[chave].push(l.id);
      });

      const dups = Object.values(duplicatas).filter((v) => v.length > 1);
      if (dups.length === 0) {
        console.log(`✓ Nenhuma duplicata encontrada!`);
      } else {
        console.log(`⚠ ${dups.length} combinações ainda duplicadas`);
      }
    }

    // Verificar se os indexes foram criados
    console.log(
      "\n✓ Verificar se UNIQUE INDEXes foram criados no Supabase Dashboard:"
    );
    console.log(`  - idx_lancamentos_unico_lote`);
    console.log(`  - idx_lancamentos_unico_sem_lote`);

    console.log("\n" + "=".repeat(70) + "\n");
  } catch (e) {
    console.error(`❌ Erro: ${e.message}`);
  }
}

verify();
