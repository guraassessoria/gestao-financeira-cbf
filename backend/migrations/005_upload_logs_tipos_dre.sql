-- ============================================================
-- Migration 005 — Permite novos tipos de upload para DRE
-- ============================================================

ALTER TABLE upload_logs
  DROP CONSTRAINT IF EXISTS valid_tipo_arquivo;

ALTER TABLE upload_logs
  ADD CONSTRAINT valid_tipo_arquivo
  CHECK (tipo_arquivo IN ('CT1', 'CT2', 'CTT', 'CV0', 'EDRE', 'DPDRE'));
