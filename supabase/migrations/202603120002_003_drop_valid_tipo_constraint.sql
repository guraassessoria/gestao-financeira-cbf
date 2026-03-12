-- ============================================================
-- Migration 003 — Remove constraint restritivo de tipo_lcto
-- O parser já garante a lógica de negócio na camada de aplicação
-- Execute no Supabase: SQL Editor → colar e executar
-- ============================================================

ALTER TABLE lancamentos_contabeis DROP CONSTRAINT IF EXISTS valid_tipo;
