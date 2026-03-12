"""
Script para aplicar a deduplicação diretamente via SQL
"""

import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Carregar .env.local
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")

if not SUPABASE_URL:
    print("❌ Erro: NEXT_PUBLIC_SUPABASE_URL não encontrado")
    exit(1)

# Extrair info de conexão
# URL format: https://xxxxx.supabase.co
host_part = SUPABASE_URL.replace("https://", "").split(".")[0]
db_host = f"{host_part}.supabase.co"

print(f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║             APLICAR DEDUPLICAÇÃO MANUALMENTE VIA SQL                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

As migrations locais estão pronta:
  ✓ 202603110001 - Init Schema
  ✓ 202603120001 - Entidades De-Para
  ✓ 202603120002 - Drop Valid Tipo Constraint
  ✓ 202603120003 - RLS Hardening
  ✓ 202603120004 - Upload Logs Tipos DRE
  ✓ 202603120005 - Deduplica Lançamentos (PENDENTE)

Para aplicar a deduplicação manualmente:

Opção 1: Via Supabase Dashboard
──────────────────────────────────
1. Acesse: https://app.supabase.com/project
2. SQL Editor → New Query
3. Cole o SQL abaixo e clique "Run"

Opção 2: Via psql (linha de comando)
──────────────────────────────────
psql postgresql://postgres:PASSWORD@{db_host}:5432/postgres

Então execute o SQL abaixo.

════════════════════════════════════════════════════════════════════════════════
SQL A EXECUTAR:
════════════════════════════════════════════════════════════════════════════════

BEGIN;

-- REMOVER DUPLICATAS: Manter MAX(id) para cada combinação única
DELETE FROM lancamentos_contabeis lc
WHERE lc.id NOT IN (
  SELECT MAX(id)
  FROM lancamentos_contabeis sub
  WHERE sub.numero_lote IS NOT NULL
  GROUP BY sub.filial, sub.numero_lote, sub.sub_lote, sub.tipo_lcto, 
           sub.cta_debito, sub.cta_credito
)
AND lc.numero_lote IS NOT NULL;

-- Remover duplicatas SEM numero_lote (usando data + doc)
DELETE FROM lancamentos_contabeis lc
WHERE lc.id NOT IN (
  SELECT MAX(id)
  FROM lancamentos_contabeis sub
  WHERE sub.numero_lote IS NULL AND sub.numero_doc IS NOT NULL
  GROUP BY sub.filial, sub.data_lcto, sub.numero_doc, 
           sub.cta_debito, sub.cta_credito
)
AND lc.numero_lote IS NULL
AND lc.numero_doc IS NOT NULL;

-- CRIAR PROTEÇÃO: UNIQUE INDEX para lançamentos com lote
CREATE UNIQUE INDEX IF NOT EXISTS idx_lancamentos_unico_lote
ON lancamentos_contabeis(
  filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito
) 
WHERE numero_lote IS NOT NULL;

-- CRIAR PROTEÇÃO: UNIQUE INDEX para lançamentos sem lote
CREATE UNIQUE INDEX IF NOT EXISTS idx_lancamentos_unico_sem_lote
ON lancamentos_contabeis(
  filial, data_lcto, numero_doc, cta_debito, cta_credito
)
WHERE numero_lote IS NULL AND numero_doc IS NOT NULL;

COMMIT;

════════════════════════════════════════════════════════════════════════════════
VERIFICAÇÃO (após executar o SQL):
════════════════════════════════════════════════════════════════════════════════

SELECT COUNT(*) as total_lancamentos FROM lancamentos_contabeis;
-- Esperado: ~487344 (era 487868, removidos ~524)

SELECT 
  COUNT(DISTINCT (filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito))
FROM lancamentos_contabeis
WHERE numero_lote IS NOT NULL;
-- Deve ser igual ao total acima (sem duplicatas)

════════════════════════════════════════════════════════════════════════════════
PRÓXIMA AÇÃO:
════════════════════════════════════════════════════════════════════════════════

Após confirmar que o SQL executou com sucesso:
1. Faça upload dos lançamentos CT2 novamente
2. O sistema agora vai usar UPSERT (ON CONFLICT) automaticamente
3. Lançamentos duplicados serão sobrescritos (não duplicarão)
""")
