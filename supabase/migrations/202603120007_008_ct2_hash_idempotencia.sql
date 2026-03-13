-- Migration 008 — CT2 idempotente por hash de arquivo
-- Objetivo:
-- 1) Permitir múltiplas linhas iguais em CT2 (não deduplicar conteúdo do arquivo)
-- 2) Evitar duplicidade apenas quando o MESMO arquivo for reenviado

-- Remove índices únicos agressivos de lançamentos (causavam perda/inconsistência)
DROP INDEX IF EXISTS idx_lancamentos_unico_lote;
DROP INDEX IF EXISTS idx_lancamentos_unico_sem_lote;

-- Hash do arquivo no log de upload para idempotência por reenvio
ALTER TABLE upload_logs
  ADD COLUMN IF NOT EXISTS arquivo_hash VARCHAR(64);

-- Garante que um mesmo hash CT2 com status OK não seja processado novamente
CREATE UNIQUE INDEX IF NOT EXISTS idx_upload_logs_ct2_hash_ok
  ON upload_logs (tipo_arquivo, arquivo_hash)
  WHERE tipo_arquivo = 'CT2'
    AND status = 'ok'
    AND arquivo_hash IS NOT NULL;
