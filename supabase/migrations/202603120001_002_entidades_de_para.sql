-- ============================================================
-- Migration 002 — Tabelas novas: entidades_dre e de_para_dre
-- Execute no Supabase: SQL Editor → colar e executar
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Entidades DRE (CV0) — competições / seleções
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS entidades_dre (
  id BIGSERIAL PRIMARY KEY,
  filial VARCHAR(2) NOT NULL,
  plano_contab VARCHAR(20),
  item VARCHAR(20),
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  classe VARCHAR(20) NOT NULL DEFAULT 'Analítica',
  cond_normal VARCHAR(20) NOT NULL DEFAULT 'Devedora',
  bloqueada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(filial, codigo)
);

-- ─────────────────────────────────────────────
-- 2. De-Para DRE — mapeamento conta contábil → linha DRE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS de_para_dre (
  id BIGSERIAL PRIMARY KEY,
  codigo_conta_contabil VARCHAR(20) NOT NULL,
  codigo_linha_dre VARCHAR(20) NOT NULL,
  codigo_centro_custo VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice único que trata NULL em codigo_centro_custo como valor distinto
CREATE UNIQUE INDEX IF NOT EXISTS idx_de_para_dre_unique
  ON de_para_dre (codigo_conta_contabil, COALESCE(codigo_centro_custo, ''));
