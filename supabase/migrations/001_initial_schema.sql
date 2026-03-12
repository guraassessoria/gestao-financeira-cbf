-- =============================================================================
-- Gestão Financeira CBF - Schema v1
-- =============================================================================

-- Enable Row Level Security on all tables
-- Run this script in your Supabase SQL editor

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('auditor', 'contador', 'presidente', 'diretor');
CREATE TYPE moeda_tipo AS ENUM ('BRL', 'USD');
CREATE TYPE status_aprovacao AS ENUM ('rascunho', 'revisao', 'aprovado', 'emitido');
CREATE TYPE tipo_relatorio AS ENUM ('DRE', 'BP', 'DFC', 'DRA');
CREATE TYPE periodo_tipo AS ENUM ('mensal', 'trimestral', 'anual');

-- ─── User Profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nome        TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'diretor',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor')
    )
  );

-- ─── Chart of Accounts (CT1) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plano_contas (
  id              BIGSERIAL PRIMARY KEY,
  filial          TEXT NOT NULL DEFAULT '01',
  cod_conta       TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  classe_conta    TEXT NOT NULL CHECK (classe_conta IN ('Sintetica', 'Analitica')),
  cond_normal     TEXT NOT NULL CHECK (cond_normal IN ('Devedora', 'Credora')),
  cta_superior    TEXT,
  nat_conta       TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  snapshot_id     BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (filial, cod_conta, snapshot_id)
);

ALTER TABLE plano_contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read plano_contas"
  ON plano_contas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contador/Auditor can insert plano_contas"
  ON plano_contas FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor'))
  );

-- ─── Journal Entries (CT2) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lancamentos (
  id              BIGSERIAL PRIMARY KEY,
  filial          TEXT NOT NULL DEFAULT '01',
  data_lcto       DATE NOT NULL,
  ano             INT NOT NULL GENERATED ALWAYS AS (EXTRACT(YEAR FROM data_lcto)::INT) STORED,
  mes             INT NOT NULL GENERATED ALWAYS AS (EXTRACT(MONTH FROM data_lcto)::INT) STORED,
  trimestre       INT NOT NULL GENERATED ALWAYS AS (CEIL(EXTRACT(MONTH FROM data_lcto) / 3.0)::INT) STORED,
  numero_lote     TEXT,
  sub_lote        TEXT,
  numero_doc      TEXT,
  moeda_lancto    TEXT DEFAULT '01',
  tipo_lcto       TEXT NOT NULL,
  cta_debito      TEXT NOT NULL,
  cta_credito     TEXT NOT NULL,
  valor           NUMERIC(18, 2) NOT NULL DEFAULT 0,
  hist_lanc       TEXT,
  c_custo_deb     TEXT,
  c_custo_crd     TEXT,
  snapshot_id     BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lancamentos_data ON lancamentos (data_lcto);
CREATE INDEX idx_lancamentos_ano_mes ON lancamentos (ano, mes);
CREATE INDEX idx_lancamentos_cta_debito ON lancamentos (cta_debito);
CREATE INDEX idx_lancamentos_cta_credito ON lancamentos (cta_credito);

ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read lancamentos"
  ON lancamentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contador/Auditor can insert lancamentos"
  ON lancamentos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor'))
  );

-- ─── Cost Centers (CTT) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS centros_custo (
  id          BIGSERIAL PRIMARY KEY,
  filial      TEXT NOT NULL DEFAULT '01',
  cod_cc      TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  snapshot_id BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (filial, cod_cc, snapshot_id)
);

ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read centros_custo"
  ON centros_custo FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contador/Auditor can insert centros_custo"
  ON centros_custo FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor'))
  );

-- ─── DRE Mapping ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dre_mapeamento (
  id              BIGSERIAL PRIMARY KEY,
  cod_conta       TEXT NOT NULL,
  descricao_conta TEXT,
  linhas_dre      TEXT NOT NULL,
  grupo_dre       TEXT,
  sinal           INT NOT NULL DEFAULT 1 CHECK (sinal IN (1, -1)),
  ordem           INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dre_mapeamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read dre_mapeamento"
  ON dre_mapeamento FOR SELECT USING (auth.role() = 'authenticated');

-- ─── Taxa de Câmbio ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxas_cambio (
  id          BIGSERIAL PRIMARY KEY,
  data_ref    DATE NOT NULL,
  ano         INT NOT NULL GENERATED ALWAYS AS (EXTRACT(YEAR FROM data_ref)::INT) STORED,
  mes         INT NOT NULL GENERATED ALWAYS AS (EXTRACT(MONTH FROM data_ref)::INT) STORED,
  taxa_brl    NUMERIC(10, 4) NOT NULL, -- BRL per 1 USD
  fonte       TEXT,
  criado_por  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (data_ref)
);

ALTER TABLE taxas_cambio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read taxas_cambio"
  ON taxas_cambio FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contador can manage taxas_cambio"
  ON taxas_cambio FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador'))
  );

-- ─── Upload Snapshots (Audit Trail) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snapshots_carga (
  id            BIGSERIAL PRIMARY KEY,
  data_hora     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id    UUID REFERENCES auth.users(id),
  usuario_email TEXT,
  arquivo       TEXT NOT NULL,
  tipo_arquivo  TEXT NOT NULL,  -- CT1, CT2, CTT, etc.
  total_linhas  INT,
  linhas_validas INT,
  status        TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  detalhes      JSONB
);

ALTER TABLE snapshots_carga ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contador/Auditor can read snapshots"
  ON snapshots_carga FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor'))
  );
CREATE POLICY "Contador can insert snapshots"
  ON snapshots_carga FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador'))
  );

-- ─── Relatorios ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relatorios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              tipo_relatorio NOT NULL,
  periodo_tipo      periodo_tipo NOT NULL,
  ano               INT NOT NULL,
  mes               INT,
  trimestre         INT,
  moeda             moeda_tipo NOT NULL DEFAULT 'BRL',
  status_aprovacao  status_aprovacao NOT NULL DEFAULT 'rascunho',
  narrativa         TEXT,
  criado_por        UUID REFERENCES auth.users(id),
  revisado_por      UUID REFERENCES auth.users(id),
  data_emissao      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read relatorios"
  ON relatorios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contador can manage relatorios"
  ON relatorios FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('contador', 'auditor', 'presidente'))
  );

-- ─── Audit Log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  tabela      TEXT NOT NULL,
  operacao    TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id TEXT,
  usuario_id  UUID REFERENCES auth.users(id),
  dados_antes JSONB,
  dados_depois JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auditor can read audit_log"
  ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'auditor')
  );

-- ─── Functions ────────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER relatorios_updated_at
  BEFORE UPDATE ON relatorios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- On auth user created, create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'diretor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Views ────────────────────────────────────────────────────────────────────

-- Aggregated balances per account per year/month
CREATE OR REPLACE VIEW saldos_mensais AS
SELECT
  cta_debito AS cod_conta,
  'debito' AS tipo,
  ano,
  mes,
  trimestre,
  SUM(valor) AS total
FROM lancamentos
WHERE tipo_lcto = 'Partida Dobrada'
GROUP BY cta_debito, ano, mes, trimestre

UNION ALL

SELECT
  cta_credito AS cod_conta,
  'credito' AS tipo,
  ano,
  mes,
  trimestre,
  SUM(valor) AS total
FROM lancamentos
WHERE tipo_lcto = 'Partida Dobrada'
GROUP BY cta_credito, ano, mes, trimestre;

COMMENT ON VIEW saldos_mensais IS 'Aggregated debit/credit movements per account per period';
