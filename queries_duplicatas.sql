-- Query 1: Verificar duplicatas em lancamentos_contabeis (CT2)
-- Agrupado por: filial, numero_lote, sub_lote, tipo_lcto, contas
SELECT 
  filial,
  numero_lote,
  sub_lote,
  tipo_lcto,
  cta_debito,
  cta_credito,
  COUNT(*) as total_duplicados,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM lancamentos_contabeis
WHERE numero_lote IS NOT NULL
GROUP BY filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC;

-- Query 2: Verificar duplicatas em de_para_dre by (conta, centro_custo)
SELECT
  codigo_conta_contabil,
  codigo_centro_custo,
  COUNT(*) as total,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM de_para_dre
GROUP BY codigo_conta_contabil, codigo_centro_custo
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- Query 3: Verificar duplicatas em estrutura_dre by codigo_conta
SELECT
  codigo_conta,
  COUNT(*) as total,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids
FROM estrutura_dre
GROUP BY codigo_conta
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- Query 4: Contar total de registros por tabela
SELECT 
  'lancamentos_contabeis' as tabela,
  COUNT(*) as total
FROM lancamentos_contabeis
UNION ALL
SELECT 'de_para_dre', COUNT(*) FROM de_para_dre
UNION ALL
SELECT 'estrutura_dre', COUNT(*) FROM estrutura_dre
UNION ALL
SELECT 'contas_contabeis', COUNT(*) FROM contas_contabeis;
