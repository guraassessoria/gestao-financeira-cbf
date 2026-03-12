-- ============================================================
-- CBF — Gestão Financeira
-- Schema SQL para Supabase
-- ITG 2002 (R1) — Entidade sem fins lucrativos
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Tabela de Contas Contábeis (CT1)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contas_contabeis (
  id BIGSERIAL PRIMARY KEY,
  filial VARCHAR(2) NOT NULL,
  cod_conta VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  classe VARCHAR(20) NOT NULL, -- 'Sintética' ou 'Analítica'
  cond_normal VARCHAR(20) NOT NULL, -- 'Devedora' ou 'Credora'
  cta_superior VARCHAR(20),
  aceita_cc BOOLEAN DEFAULT FALSE,
  aceita_item BOOLEAN DEFAULT FALSE,
  aceita_clvl BOOLEAN DEFAULT FALSE,
  nivel INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(filial, cod_conta),
  CONSTRAINT valid_classe CHECK (classe IN ('Sintética', 'Analítica')),
  CONSTRAINT valid_cond CHECK (cond_normal IN ('Devedora', 'Credora'))
);

-- ─────────────────────────────────────────────
-- 2. Tabela de Centros de Custo (CTT)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS centros_custo (
  id BIGSERIAL PRIMARY KEY,
  filial VARCHAR(2) NOT NULL,
  cod_cc VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  classe VARCHAR(20) NOT NULL, -- 'Sintético' ou 'Analítico'
  cond_normal VARCHAR(20) NOT NULL, -- 'Receita' ou 'Despesa'
  cc_superior VARCHAR(20),
  bloqueado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(filial, cod_cc),
  CONSTRAINT valid_cc_classe CHECK (classe IN ('Sintético', 'Analítico')),
  CONSTRAINT valid_cc_cond CHECK (cond_normal IN ('Receita', 'Despesa'))
);

-- ─────────────────────────────────────────────
-- 3. Tabela de Lançamentos Contábeis (CT2)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lancamentos_contabeis (
  id BIGSERIAL PRIMARY KEY,
  filial VARCHAR(2) NOT NULL,
  data_lcto DATE NOT NULL,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  numero_lote VARCHAR(20),
  sub_lote VARCHAR(20),
  numero_doc VARCHAR(20),
  moeda VARCHAR(3) DEFAULT '01',
  tipo_lcto VARCHAR(20) NOT NULL, -- 'Partida Dobrada', etc
  cta_debito VARCHAR(20),
  cta_credito VARCHAR(20),
  valor DECIMAL(18, 2) NOT NULL,
  hist_pad VARCHAR(255),
  hist_lanc TEXT,
  c_custo_deb VARCHAR(20),
  c_custo_crd VARCHAR(20),
  ocorren_deb VARCHAR(20),
  ocorren_crd VARCHAR(20),
  valor_moeda1 DECIMAL(18, 2),
  origem VARCHAR(50),
  upload_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_dcredito CHECK (
    (cta_debito IS NOT NULL AND valor > 0) OR (cta_credito IS NOT NULL AND valor > 0)
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_periodo ON lancamentos_contabeis(periodo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_deb ON lancamentos_contabeis(cta_debito);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_cred ON lancamentos_contabeis(cta_credito);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cc_deb ON lancamentos_contabeis(c_custo_deb);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cc_cred ON lancamentos_contabeis(c_custo_crd);

-- ─────────────────────────────────────────────
-- 4. Tabela de Uploads
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS upload_logs (
  id BIGSERIAL PRIMARY KEY,
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL, -- 'CT1', 'CT2', 'CTT', 'CV0'
  periodos VARCHAR(255), -- JSON array de períodos processados
  total_lancamentos INTEGER,
  total_valor DECIMAL(18, 2),
  status VARCHAR(20) NOT NULL, -- 'processando', 'ok', 'erro'
  erros TEXT, -- JSON array de mensagens de erro
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('processando', 'ok', 'erro')),
  CONSTRAINT valid_tipo_arquivo CHECK (tipo_arquivo IN ('CT1', 'CT2', 'CTT', 'CV0', 'EDRE', 'DPDRE'))
);

-- ─────────────────────────────────────────────
-- 5. Tabela de Usuários (Auth sugerida via Supabase Auth)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  permissoes TEXT[], -- Array de permissões
  somente_leitura BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(nome)
);

-- Perfis padrão
INSERT INTO perfis (id, nome, permissoes, somente_leitura) VALUES
  (gen_random_uuid(), 'Admin', ARRAY['admin', 'upload', 'demonstracoes', 'indices', 'competicoes', 'centros_custo', 'dashboard', 'relatorios_ia'], FALSE),
  (gen_random_uuid(), 'Contador', ARRAY['upload', 'demonstracoes', 'indices', 'dashboard'], FALSE),
  (gen_random_uuid(), 'Auditor', ARRAY['demonstracoes', 'indices', 'dashboard'], TRUE),
  (gen_random_uuid(), 'Diretor', ARRAY['demonstracoes', 'indices', 'dashboard'], TRUE)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  perfil_id UUID NOT NULL REFERENCES perfis(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);

-- ─────────────────────────────────────────────
-- 6. Tabela de Logs de Relatórios
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS logs_relatorios (
  id BIGSERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'DRE', 'BP', 'DFC', 'DRA', 'Indice', etc
  periodo VARCHAR(7) NOT NULL,
  gerado_por UUID NOT NULL REFERENCES usuarios(id),
  parametros JSONB,
  upload_ids BIGINT[],
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_tipo_relatorio CHECK (tipo IN ('DRE', 'BP', 'DFC', 'DRA', 'Indice', 'Competicao', 'CC'))
);

-- ─────────────────────────────────────────────
-- 7. Tabela de Estrutura DRE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estrutura_dre (
  id BIGSERIAL PRIMARY KEY,
  codigo_conta VARCHAR(20) NOT NULL,
  descricao_conta TEXT NOT NULL,
  codigo_cta_superior VARCHAR(20),
  descricao_superior TEXT,
  nivel INTEGER NOT NULL,
  nivel_visualizacao INTEGER NOT NULL, -- 1, 2 ou 3
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(codigo_conta),
  CONSTRAINT valid_nivel_viz CHECK (nivel_visualizacao IN (1, 2, 3))
);

-- ─────────────────────────────────────────────
-- 8. Tabela de Entidades DRE (CV0)
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
-- 9. Tabela De-Para DRE (mapeamento conta → linha DRE)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS de_para_dre (
  id BIGSERIAL PRIMARY KEY,
  codigo_conta_contabil VARCHAR(20) NOT NULL,
  codigo_linha_dre VARCHAR(20) NOT NULL REFERENCES estrutura_dre(codigo_conta),
  codigo_centro_custo VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(codigo_conta_contabil, codigo_centro_custo)
);

-- ─────────────────────────────────────────────
-- 10. Políticas Row-Level Security (RLS)
-- ─────────────────────────────────────────────

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_relatorios ENABLE ROW LEVEL SECURITY;

-- Política: Users podem ver apenas seus próprios uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'upload_logs'
      AND policyname = 'usuarios_own_uploads'
  ) THEN
    CREATE POLICY usuarios_own_uploads ON upload_logs
      FOR SELECT
      USING (uploaded_by::text = auth.uid()::text);
  END IF;
END $$;

-- Política: Users podem ver apenas seus próprios logs de relatórios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'logs_relatorios'
      AND policyname = 'usuarios_own_reports'
  ) THEN
    CREATE POLICY usuarios_own_reports ON logs_relatorios
      FOR SELECT
      USING (gerado_por::text = auth.uid()::text);
  END IF;
END $$;
