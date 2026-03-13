-- Migration 009: Adiciona coluna ocorrencia em centros_custo
-- A coluna "Ocorrencia" do arquivo CTT do TOTVS mapeia cada CC ao grupo de entidade (CV0)
-- Usada pelo engine DRE para filtrar lancamentos pelo grupo correto (ex: Selecao Principal = "01")

ALTER TABLE centros_custo
  ADD COLUMN IF NOT EXISTS ocorrencia VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN centros_custo.ocorrencia IS
  'Codigo de ocorrencia/entidade (CV0) associado a este centro de custo. Campo "Ocorrencia" do arquivo CTT TOTVS.';
