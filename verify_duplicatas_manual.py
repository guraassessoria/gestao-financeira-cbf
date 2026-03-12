"""
Script simples para verificar duplicatas usando queries SQL diretas
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar .env.local
env_file = Path(".env.local")
if env_file.exists():
    load_dotenv(env_file)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")

if not SUPABASE_URL:
    print("❌ NEXT_PUBLIC_SUPABASE_URL não encontrado em .env.local")
    exit(1)

# Extrair host e banco do URL
# Formato: https://xxxxx.supabase.co
host = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")
db_name = "postgres"

print(f"\nHost Supabase: {host}")
print(f"Arquivo .env.local encontrado")

print("\n" + "="*70)
print("VERIFICAÇÃO DE DUPLICATAS - ANÁLISE SQL")
print("="*70)

print("""
Para conectar e verificar duplicatas, execute _manualmente_ as seguintes queries
no Supabase Dashboard (SQL Editor):

--- QUERY 1: Lançamentos Contábeis (CT2) ---
SELECT 
  filial,
  numero_lote,
  sub_lote,
  tipo_lcto,
  cta_debito,
  cta_credito,
  COUNT(*) as duplicatas,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM lancamentos_contabeis
WHERE numero_lote IS NOT NULL
GROUP BY filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC;

--- QUERY 2: De-Para DRE ---
SELECT
  codigo_conta_contabil,
  codigo_centro_custo,
  COUNT(*) as duplicatas,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM de_para_dre
GROUP BY codigo_conta_contabil, codigo_centro_custo
HAVING COUNT(*) > 1;

--- QUERY 3: Estrutura DRE ---
SELECT
  codigo_conta,
  COUNT(*) as duplicatas,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM estrutura_dre
GROUP BY codigo_conta
HAVING COUNT(*) > 1;

--- QUERY 4: Resumo Total de Registros ---
SELECT 
  'lancamentos_contabeis' as tabela,
  COUNT(*) as total
FROM lancamentos_contabeis
UNION ALL
SELECT 'de_para_dre', COUNT(*) FROM de_para_dre
UNION ALL
SELECT 'estrutura_dre', COUNT(*) FROM estrutura_dre
UNION ALL
SELECT 'contas_contabeis', COUNT(*) FROM contas_contabeis
ORDER BY total DESC;

--- LIMPEZA DE DUPLICATAS (se necessário) ---
-- Manter apenas o registro MAIS RECENTE para cada combinação única:
DELETE FROM lancamentos_contabeis
WHERE id NOT IN (
  SELECT MAX(id)
  FROM lancamentos_contabeis
  WHERE numero_lote IS NOT NULL
  GROUP BY filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito
)
AND numero_lote IS NOT NULL;

DELETE FROM de_para_dre
WHERE id NOT IN (
  SELECT MAX(id)
  FROM de_para_dre
  GROUP BY codigo_conta_contabil, codigo_centro_custo
);

DELETE FROM estrutura_dre
WHERE id NOT IN (
  SELECT MAX(id)
  FROM estrutura_dre
  GROUP BY codigo_conta
);

""")

print("\n" + "="*70)
print("INSTRUÇÕES:")
print("="*70)
print("""
1. Abra o Supabase Dashboard: https://app.supabase.com/project
2. Vá para SQL Editor
3. Cole cada QUERY acima e execute (Ctrl+Shift+Enter)
4. Verifique se há linhas retornadas:
   - Se SIM → há duplicatas nessa tabela
   - Se NÃO → tabela não tem duplicatas

5. Se precisar limpar, execute os comandos DELETE acima
   (CUIDADO: isso apagará registros antigos duplicados)
""")
