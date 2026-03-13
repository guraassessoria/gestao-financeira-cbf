-- Migration 011: Função RPC para listar períodos distintos em lancamentos_contabeis
-- Substitui a varredura paginada de toda a tabela apenas para obter períodos únicos.

CREATE OR REPLACE FUNCTION get_periodos_disponiveis()
RETURNS TABLE(periodo text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT periodo
  FROM lancamentos_contabeis
  WHERE periodo IS NOT NULL
  ORDER BY periodo DESC
$$;
