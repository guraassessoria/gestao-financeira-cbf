-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plano de Contas (Chart of Accounts) from CT1
CREATE TABLE IF NOT EXISTS plano_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filial VARCHAR(10),
  cod_conta VARCHAR(20) NOT NULL,
  desc_conta TEXT NOT NULL,
  classe_conta VARCHAR(20),
  cond_normal VARCHAR(20),
  cta_superior VARCHAR(20),
  grupo VARCHAR(50),
  nat_conta VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(filial, cod_conta)
);

-- Centros de Custo (Cost Centers) from CTT
CREATE TABLE IF NOT EXISTS centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filial VARCHAR(10),
  c_custo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  classe VARCHAR(20),
  cond_normal VARCHAR(20),
  cc_superior VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(filial, c_custo)
);

-- Entidades CV0 (Entity 05)
CREATE TABLE IF NOT EXISTS entidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filial VARCHAR(10),
  plano_contab VARCHAR(10),
  item VARCHAR(20),
  codigo VARCHAR(20),
  descricao TEXT,
  classe VARCHAR(20),
  cond_normal VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lancamentos Contabeis (Journal Entries) from CT2
CREATE TABLE IF NOT EXISTS lancamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filial VARCHAR(10),
  data_lcto DATE NOT NULL,
  numero_lote VARCHAR(20),
  sub_lote VARCHAR(10),
  numero_doc VARCHAR(20),
  moeda_lancto VARCHAR(10),
  tipo_lcto VARCHAR(30),
  cta_debito VARCHAR(20),
  cta_credito VARCHAR(20),
  valor NUMERIC(18,2),
  hist_lanc TEXT,
  c_custo_deb VARCHAR(20),
  c_custo_crd VARCHAR(20),
  origem TEXT,
  valor_moeda1 NUMERIC(18,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data_lcto);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_debito ON lancamentos(cta_debito);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cta_credito ON lancamentos(cta_credito);

-- Mapeamento Contabil (Account Mapping for BP, DRE, DFC, DRA)
CREATE TABLE IF NOT EXISTS mapeamento_contabil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demonstracao VARCHAR(10) NOT NULL,
  secao VARCHAR(50) NOT NULL,
  subsecao VARCHAR(100),
  ordem INTEGER,
  conta_inicio VARCHAR(20),
  conta_fim VARCHAR(20),
  conta_lista TEXT,
  classe_conta VARCHAR(20),
  cond_normal VARCHAR(20),
  sinal_apresentacao VARCHAR(10) DEFAULT 'positivo',
  regra_soma VARCHAR(20),
  usa_ccusto BOOLEAN DEFAULT false,
  usa_entidade05 BOOLEAN DEFAULT false,
  usa_de_para_dre BOOLEAN DEFAULT false,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRE De_Para (DRE Account Mapping)
CREATE TABLE IF NOT EXISTS dre_de_para (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cod_conta VARCHAR(20),
  desc_conta TEXT,
  linha_dre VARCHAR(100),
  secao_dre VARCHAR(50),
  sinal INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fechamentos Contabeis (Accounting Periods / Closings)
CREATE TABLE IF NOT EXISTS fechamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'aberto',
  data_fechamento TIMESTAMPTZ,
  usuario_fechamento TEXT,
  observacao TEXT,
  taxa_cambio_usd NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ano, mes)
);

-- Taxas de Cambio (Exchange Rates)
CREATE TABLE IF NOT EXISTS taxas_cambio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_referencia DATE NOT NULL,
  moeda_origem VARCHAR(10) DEFAULT 'BRL',
  moeda_destino VARCHAR(10) DEFAULT 'USD',
  taxa NUMERIC(10,4) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'fechamento',
  fonte TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_referencia, moeda_origem, moeda_destino, tipo)
);

-- Trilha de Auditoria (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela VARCHAR(50),
  operacao VARCHAR(20),
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cargas de Dados (Data Load Snapshots)
CREATE TABLE IF NOT EXISTS cargas_dados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arquivo VARCHAR(100),
  tipo VARCHAR(20),
  registros_total INTEGER,
  registros_importados INTEGER,
  registros_erro INTEGER,
  status VARCHAR(20) DEFAULT 'em_processamento',
  usuario TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default mapping data
INSERT INTO mapeamento_contabil (demonstracao, secao, subsecao, ordem, sinal_apresentacao, regra_soma, usa_ccusto, usa_entidade05, usa_de_para_dre, observacao, status)
VALUES
  ('BP', 'ATIVO', 'Circulante', 10, 'positivo', 'faixa', true, false, false, NULL, 'pendente'),
  ('BP', 'ATIVO', 'Nao Circulante', 20, 'positivo', 'faixa', true, false, false, NULL, 'pendente'),
  ('BP', 'PASSIVO', 'Circulante', 30, 'positivo', 'faixa', true, false, false, NULL, 'pendente'),
  ('BP', 'PASSIVO', 'Nao Circulante', 40, 'positivo', 'faixa', true, false, false, NULL, 'pendente'),
  ('BP', 'PATRIMONIO LIQUIDO', 'Capital e Reservas', 50, 'positivo', 'faixa', false, false, false, NULL, 'pendente'),
  ('DFC', 'OPERACIONAL', 'Lucro Liquido e Ajustes', 60, 'positivo', 'regra', true, false, false, 'metodo indireto', 'pendente'),
  ('DFC', 'OPERACIONAL', 'Variacao de Ativos e Passivos Operacionais', 70, 'positivo', 'regra', true, false, false, 'metodo indireto', 'pendente'),
  ('DFC', 'INVESTIMENTO', 'Entradas e Saidas', 80, 'positivo', 'regra', true, false, false, NULL, 'pendente'),
  ('DFC', 'FINANCIAMENTO', 'Entradas e Saidas', 90, 'positivo', 'regra', true, false, false, NULL, 'pendente'),
  ('DRA', 'OCI', 'Componentes a Definir', 100, 'positivo', 'regra', false, false, false, 'pendente definicao OCI', 'pendente'),
  ('DRE', 'RECEITAS', 'Conforme de_para', 110, 'positivo', 'de_para', true, true, true, 'usar DRE - De_Para.xls', 'aprovado')
ON CONFLICT DO NOTHING;

-- Insert sample exchange rates
INSERT INTO taxas_cambio (data_referencia, moeda_origem, moeda_destino, taxa, tipo, fonte)
VALUES
  ('2025-01-31', 'BRL', 'USD', 0.1667, 'fechamento', 'Banco Central'),
  ('2025-02-28', 'BRL', 'USD', 0.1695, 'fechamento', 'Banco Central'),
  ('2024-12-31', 'BRL', 'USD', 0.1639, 'fechamento', 'Banco Central'),
  ('2024-11-30', 'BRL', 'USD', 0.1742, 'fechamento', 'Banco Central'),
  ('2024-10-31', 'BRL', 'USD', 0.1803, 'fechamento', 'Banco Central'),
  ('2024-09-30', 'BRL', 'USD', 0.1928, 'fechamento', 'Banco Central')
ON CONFLICT DO NOTHING;
