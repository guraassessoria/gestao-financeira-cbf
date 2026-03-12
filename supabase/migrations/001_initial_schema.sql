-- Gestão Financeira CBF — Esquema inicial
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plano de contas (Chart of accounts)
CREATE TABLE IF NOT EXISTS plano_contas (
  cod_conta      TEXT PRIMARY KEY,
  desc_conta     TEXT NOT NULL,
  classe_conta   TEXT,
  cond_normal    TEXT,
  cod_reduzido   TEXT,
  cta_superior   TEXT,
  filial         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Centros de custo (Cost centers)
CREATE TABLE IF NOT EXISTS centros_custo (
  c_custo        TEXT PRIMARY KEY,
  classe         TEXT,
  cond_normal    TEXT,
  desc_cc        TEXT NOT NULL,
  filial         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entidades (CV0)
CREATE TABLE IF NOT EXISTS entidades (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item           TEXT,
  codigo         TEXT,
  descricao      TEXT,
  classe         TEXT,
  cond_normal    TEXT,
  filial         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lançamentos contábeis (Ledger entries)
CREATE TABLE IF NOT EXISTS lancamentos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filial         TEXT,
  data_lcto      DATE,
  numero_lote    TEXT,
  sub_lote       TEXT,
  numero_doc     TEXT,
  tipo_lcto      TEXT,
  cta_debito     TEXT REFERENCES plano_contas(cod_conta),
  cta_credito    TEXT REFERENCES plano_contas(cod_conta),
  valor          NUMERIC(18, 2),
  hist_lanc      TEXT,
  c_custo_deb    TEXT,
  c_custo_crd    TEXT,
  origem         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DRE Estrutura (Income statement tree)
CREATE TABLE IF NOT EXISTS dre_estrutura (
  codigo_conta       TEXT PRIMARY KEY,
  desc_dre           TEXT NOT NULL,
  codigo_cta_superior TEXT,
  nivel              INTEGER,
  nivel_visualizacao INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DRE De-Para (Account mapping to DRE lines)
CREATE TABLE IF NOT EXISTS dre_de_para (
  codigo_de_para        TEXT PRIMARY KEY,
  desc_conta_dre        TEXT,
  codigo_conta_contabil TEXT,
  codigo_centro_custo   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mapeamento BP (Balance sheet mapping)
CREATE TABLE IF NOT EXISTS mapeamento_bp (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demonstracao TEXT,
  secao       TEXT,
  subsecao    TEXT,
  ordem       INTEGER,
  conta_inicio TEXT,
  conta_fim    TEXT,
  sinal        INTEGER DEFAULT 1,
  observacao   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Câmbio histórico (Historical exchange rates)
CREATE TABLE IF NOT EXISTS cambio_historico (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_cambio  DATE NOT NULL,
  taxa_brl_usd NUMERIC(10, 4) NOT NULL,
  fonte        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(data_cambio)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela           TEXT NOT NULL,
  operacao         TEXT NOT NULL,
  usuario          TEXT,
  dados_anteriores JSONB,
  dados_novos      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data_lcto);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_deb ON lancamentos(cta_debito);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_crd ON lancamentos(cta_credito);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo_lcto);
CREATE INDEX IF NOT EXISTS idx_dre_superior ON dre_estrutura(codigo_cta_superior);
CREATE INDEX IF NOT EXISTS idx_de_para_conta ON dre_de_para(codigo_conta_contabil);

-- Row Level Security (basic setup)
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Allow read lancamentos" ON lancamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read plano_contas" ON plano_contas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read centros_custo" ON centros_custo FOR SELECT TO authenticated USING (true);
