-- Migration 006: Deduplica e protege lancamentos_contabeis (CT2)
-- Objetivo: Remove 524 registros duplicados mantendo o mais recente
-- Impacto: 487868 → ~487344 registros (remove ~524 duplicatas)

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 1: REMOVER DUPLICATAS - Manter MAX(id) para cada combinação única
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM lancamentos_contabeis lc
WHERE lc.id NOT IN (
  SELECT MAX(id)
  FROM lancamentos_contabeis sub
  WHERE sub.numero_lote IS NOT NULL
  GROUP BY sub.filial, sub.numero_lote, sub.sub_lote, sub.tipo_lcto, 
           sub.cta_debito, sub.cta_credito
)
AND lc.numero_lote IS NOT NULL;

-- Também remover duplicatas para lançamentos sem numero_lote (usando data + doc)
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

-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 2: CRIAR PROTEÇÃO - UNIQUE INDEX com ON CONFLICT DO UPDATE
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice principal: Lançamentos com numero_lote (padrão do TOTVS)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lancamentos_unico_lote
ON lancamentos_contabeis(
  filial, 
  numero_lote, 
  sub_lote, 
  tipo_lcto,
  cta_debito,
  cta_credito
) 
WHERE numero_lote IS NOT NULL;

-- Índice alternativo: Lançamentos sem lote (usar data + documento)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lancamentos_unico_sem_lote
ON lancamentos_contabeis(
  filial,
  data_lcto,
  numero_doc,
  cta_debito,
  cta_credito
)
WHERE numero_lote IS NULL AND numero_doc IS NOT NULL;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO: Confirmar que duplicatas foram removidas
-- ═══════════════════════════════════════════════════════════════════════════
-- Execute após aplicar:
-- SELECT COUNT(DISTINCT (filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito))
-- FROM lancamentos_contabeis WHERE numero_lote IS NOT NULL;
