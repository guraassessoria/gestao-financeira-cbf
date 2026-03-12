-- ============================================================
-- Gestao Financeira CBF - Schema Inicial
-- Onda 1: Dicionario de dados e mapeamento BP/DFC/DRA
-- Onda 2: Ingestao de lancamentos e validacoes contabeis
-- ============================================================

-- Tabela: Plano de Contas (CT1)
CREATE TABLE IF NOT EXISTS ct1_plano_contas (
    id BIGSERIAL PRIMARY KEY,
    filial TEXT NOT NULL,
    cod_conta TEXT NOT NULL,
    desc_conta TEXT NOT NULL,
    classe_conta TEXT NOT NULL CHECK (classe_conta IN ('Analitica', 'Sintetica')),
    cond_normal TEXT NOT NULL CHECK (cond_normal IN ('Devedora', 'Credora')),
    cta_superior TEXT,
    nat_conta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (filial, cod_conta)
);

CREATE INDEX idx_ct1_cod_conta ON ct1_plano_contas (cod_conta);
CREATE INDEX idx_ct1_cta_superior ON ct1_plano_contas (cta_superior);

-- Tabela: Centros de Custo (CTT)
CREATE TABLE IF NOT EXISTS ctt_centros_custo (
    id BIGSERIAL PRIMARY KEY,
    filial TEXT NOT NULL,
    c_custo TEXT NOT NULL,
    desc_cc TEXT NOT NULL,
    classe TEXT NOT NULL CHECK (classe IN ('Analitico', 'Sintetico')),
    cond_normal TEXT NOT NULL CHECK (cond_normal IN ('Receita', 'Despesa')),
    cc_superior TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (filial, c_custo)
);

CREATE INDEX idx_ctt_c_custo ON ctt_centros_custo (c_custo);

-- Tabela: Entidade 05 - Atividades (CV0)
CREATE TABLE IF NOT EXISTS cv0_entidade05 (
    id BIGSERIAL PRIMARY KEY,
    filial TEXT NOT NULL,
    plano_contab TEXT NOT NULL,
    item TEXT,
    codigo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    classe TEXT,
    cond_normal TEXT,
    entid_sup TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (filial, plano_contab, codigo)
);

-- Tabela: Lancamentos Contabeis (CT2)
CREATE TABLE IF NOT EXISTS ct2_lancamentos (
    id BIGSERIAL PRIMARY KEY,
    filial TEXT NOT NULL,
    data_lcto DATE NOT NULL,
    numero_lote TEXT,
    sub_lote TEXT,
    numero_doc TEXT,
    moeda_lancto TEXT,
    tipo_lcto TEXT NOT NULL,
    cta_debito TEXT,
    cta_credito TEXT,
    valor NUMERIC(18, 2) NOT NULL DEFAULT 0,
    valor_moeda1 NUMERIC(18, 2),
    hist_lanc TEXT,
    c_custo_deb TEXT,
    c_custo_crd TEXT,
    atividade_deb TEXT,
    atividade_crd TEXT,
    origem TEXT,
    usuario_conf TEXT,
    data_conf DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    carga_id BIGINT
);

CREATE INDEX idx_ct2_data_lcto ON ct2_lancamentos (data_lcto);
CREATE INDEX idx_ct2_cta_debito ON ct2_lancamentos (cta_debito);
CREATE INDEX idx_ct2_cta_credito ON ct2_lancamentos (cta_credito);
CREATE INDEX idx_ct2_tipo_lcto ON ct2_lancamentos (tipo_lcto);
CREATE INDEX idx_ct2_ano_mes ON ct2_lancamentos (EXTRACT(YEAR FROM data_lcto), EXTRACT(MONTH FROM data_lcto));

-- Tabela: Mapeamento de Contas (BP/DFC/DRA/DRE)
CREATE TABLE IF NOT EXISTS mapeamento_contas (
    id BIGSERIAL PRIMARY KEY,
    demonstracao TEXT NOT NULL CHECK (demonstracao IN ('BP', 'DRE', 'DFC', 'DRA')),
    secao TEXT NOT NULL,
    subsecao TEXT NOT NULL,
    linha TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    conta_protheus_inicio TEXT,
    conta_protheus_fim TEXT,
    conta_protheus_lista TEXT[],
    classe_conta TEXT,
    cond_normal TEXT,
    sinal_apresentacao TEXT NOT NULL DEFAULT 'positivo' CHECK (sinal_apresentacao IN ('positivo', 'negativo')),
    regra_soma TEXT NOT NULL DEFAULT 'faixa' CHECK (regra_soma IN ('faixa', 'lista', 'regra', 'de_para')),
    usa_ccusto BOOLEAN DEFAULT FALSE,
    usa_entidade05 BOOLEAN DEFAULT FALSE,
    usa_de_para_dre BOOLEAN DEFAULT FALSE,
    observacao TEXT,
    owner_validacao TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'revisao')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mapeamento_demonstracao ON mapeamento_contas (demonstracao);
CREATE INDEX idx_mapeamento_ordem ON mapeamento_contas (demonstracao, ordem);

-- Tabela: De-Para DRE (estrutura Protheus -> linhas DRE)
CREATE TABLE IF NOT EXISTS dre_de_para (
    id BIGSERIAL PRIMARY KEY,
    cod_conta TEXT NOT NULL,
    desc_conta TEXT,
    linha_dre TEXT NOT NULL,
    secao_dre TEXT NOT NULL,
    subsecao_dre TEXT,
    sinal INTEGER NOT NULL DEFAULT 1 CHECK (sinal IN (-1, 1)),
    usa_entidade05 BOOLEAN DEFAULT FALSE,
    observacao TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'revisao')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (cod_conta)
);

CREATE INDEX idx_dre_de_para_cod_conta ON dre_de_para (cod_conta);
CREATE INDEX idx_dre_de_para_linha ON dre_de_para (linha_dre);

-- Tabela: Fechamentos Contabeis (controle de versoes de periodo)
CREATE TABLE IF NOT EXISTS fechamentos (
    id BIGSERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado', 'revisao')),
    data_fechamento TIMESTAMPTZ,
    usuario_fechamento TEXT,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (ano, mes)
);

-- Tabela: Politica de Cambio
CREATE TABLE IF NOT EXISTS politica_cambio (
    id BIGSERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    moeda_origem TEXT NOT NULL DEFAULT 'BRL',
    moeda_destino TEXT NOT NULL DEFAULT 'USD',
    taxa_media NUMERIC(12, 6),
    taxa_fechamento NUMERIC(12, 6),
    fonte TEXT,
    data_referencia DATE,
    criado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (ano, mes, moeda_origem, moeda_destino)
);

-- Tabela: Trilha de Auditoria
CREATE TABLE IF NOT EXISTS audit_trail (
    id BIGSERIAL PRIMARY KEY,
    tabela TEXT NOT NULL,
    operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id BIGINT,
    dados_antes JSONB,
    dados_depois JSONB,
    usuario TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tabela ON audit_trail (tabela);
CREATE INDEX idx_audit_created_at ON audit_trail (created_at DESC);

-- Tabela: Snapshots de Carga
CREATE TABLE IF NOT EXISTS cargas_snapshot (
    id BIGSERIAL PRIMARY KEY,
    tipo_arquivo TEXT NOT NULL CHECK (tipo_arquivo IN ('CT1', 'CT2', 'CTT', 'CV0', 'DRE_ESTRUTURA', 'DRE_DE_PARA')),
    nome_arquivo TEXT NOT NULL,
    encoding TEXT NOT NULL DEFAULT 'UTF-8',
    total_linhas INTEGER,
    linhas_importadas INTEGER,
    linhas_erro INTEGER,
    erros JSONB,
    usuario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Relatorios Gerados
CREATE TABLE IF NOT EXISTS relatorios (
    id BIGSERIAL PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('DRE', 'BP', 'DFC', 'DRA', 'INDICADORES', 'EXECUTIVO')),
    titulo TEXT NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    ano_comparativo INTEGER,
    visao TEXT NOT NULL DEFAULT 'anual' CHECK (visao IN ('mensal', 'trimestral', 'anual')),
    moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (moeda IN ('BRL', 'USD')),
    dados JSONB,
    narrativa TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'aprovado', 'emitido')),
    aprovado_por TEXT,
    data_aprovacao TIMESTAMPTZ,
    criado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Views Materializadas para Performance
-- ============================================================

-- View: Saldos por conta e periodo
CREATE OR REPLACE VIEW vw_saldos_mensais AS
SELECT
    l.filial,
    EXTRACT(YEAR FROM l.data_lcto)::INTEGER AS ano,
    EXTRACT(MONTH FROM l.data_lcto)::INTEGER AS mes,
    l.cta_debito AS cod_conta,
    SUM(l.valor) AS total_debito,
    0::NUMERIC AS total_credito
FROM ct2_lancamentos l
WHERE l.tipo_lcto = 'Partida Dobrada'
  AND l.cta_debito IS NOT NULL
  AND l.cta_debito <> ''
GROUP BY l.filial, EXTRACT(YEAR FROM l.data_lcto), EXTRACT(MONTH FROM l.data_lcto), l.cta_debito

UNION ALL

SELECT
    l.filial,
    EXTRACT(YEAR FROM l.data_lcto)::INTEGER AS ano,
    EXTRACT(MONTH FROM l.data_lcto)::INTEGER AS mes,
    l.cta_credito AS cod_conta,
    0::NUMERIC AS total_debito,
    SUM(l.valor) AS total_credito
FROM ct2_lancamentos l
WHERE l.tipo_lcto = 'Partida Dobrada'
  AND l.cta_credito IS NOT NULL
  AND l.cta_credito <> ''
GROUP BY l.filial, EXTRACT(YEAR FROM l.data_lcto), EXTRACT(MONTH FROM l.data_lcto), l.cta_credito;

-- View: Saldo liquido por conta e periodo
CREATE OR REPLACE VIEW vw_saldo_liquido_mensal AS
SELECT
    filial,
    ano,
    mes,
    cod_conta,
    SUM(total_debito) AS total_debito,
    SUM(total_credito) AS total_credito,
    SUM(total_debito) - SUM(total_credito) AS saldo_liquido
FROM vw_saldos_mensais
GROUP BY filial, ano, mes, cod_conta;

-- ============================================================
-- Funcao: Registrar auditoria automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_trail (tabela, operacao, registro_id, dados_antes, dados_depois, usuario)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END,
        current_user
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers de auditoria
CREATE TRIGGER trg_audit_mapeamento
    AFTER INSERT OR UPDATE OR DELETE ON mapeamento_contas
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_dre_de_para
    AFTER INSERT OR UPDATE OR DELETE ON dre_de_para
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_fechamentos
    AFTER INSERT OR UPDATE OR DELETE ON fechamentos
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================
-- RLS (Row Level Security) - base para controle de acesso
-- ============================================================
ALTER TABLE ct1_plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct2_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ctt_centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv0_entidade05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamento_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_de_para ENABLE ROW LEVEL SECURITY;
ALTER TABLE fechamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Politicas de acesso: leitura publica autenticada
CREATE POLICY "Leitura autenticada" ON ct1_plano_contas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON ct2_lancamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON ctt_centros_custo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON cv0_entidade05 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON mapeamento_contas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON dre_de_para FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON fechamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura autenticada" ON relatorios FOR SELECT TO authenticated USING (true);

-- Politicas de escrita: apenas roles autorizados
CREATE POLICY "Escrita service role" ON ct1_plano_contas FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON ct2_lancamentos FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON ctt_centros_custo FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON cv0_entidade05 FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON mapeamento_contas FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON dre_de_para FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON fechamentos FOR ALL TO service_role USING (true);
CREATE POLICY "Escrita service role" ON relatorios FOR ALL TO service_role USING (true);
CREATE POLICY "Leitura service role" ON audit_trail FOR ALL TO service_role USING (true);
