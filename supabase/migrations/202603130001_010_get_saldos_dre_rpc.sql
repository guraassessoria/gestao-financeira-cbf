-- Migration 010: Função RPC para agregar saldos DRE no banco
-- Em vez de buscar todos os lançamentos brutos (243k+ linhas) e agregar em JS,
-- o banco faz o GROUP BY e retorna apenas as linhas distintas (conta+CC+entidade).
-- Reduz dados transferidos de ~24MB para ~1MB.

CREATE OR REPLACE FUNCTION get_saldos_dre(periodos text[])
RETURNS TABLE(
  periodo    text,
  conta      text,
  cc         text,
  entidade   text,
  total_deb  numeric,
  total_cred numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    periodo,
    cta_debito                        AS conta,
    COALESCE(c_custo_deb,  '')        AS cc,
    COALESCE(ocorren_deb,  '')        AS entidade,
    SUM(valor)                        AS total_deb,
    0::numeric                        AS total_cred
  FROM lancamentos_contabeis
  WHERE periodo = ANY(periodos)
    AND cta_debito IS NOT NULL
  GROUP BY periodo, cta_debito, c_custo_deb, ocorren_deb

  UNION ALL

  SELECT
    periodo,
    cta_credito                       AS conta,
    COALESCE(c_custo_crd,  '')        AS cc,
    COALESCE(ocorren_crd,  '')        AS entidade,
    0::numeric                        AS total_deb,
    SUM(valor)                        AS total_cred
  FROM lancamentos_contabeis
  WHERE periodo = ANY(periodos)
    AND cta_credito IS NOT NULL
  GROUP BY periodo, cta_credito, c_custo_crd, ocorren_crd
$$;

-- Índice para acelerar o filtro por período (se ainda não existir)
CREATE INDEX IF NOT EXISTS idx_lanc_periodo ON lancamentos_contabeis(periodo);
