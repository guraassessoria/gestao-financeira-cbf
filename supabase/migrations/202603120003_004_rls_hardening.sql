-- ============================================================
-- Migration 004 — Hardening de RLS nas tabelas operacionais
-- ============================================================

-- 1) Ativa RLS nas tabelas de domínio usadas em relatórios
ALTER TABLE contas_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE estrutura_dre ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades_dre ENABLE ROW LEVEL SECURITY;
ALTER TABLE de_para_dre ENABLE ROW LEVEL SECURITY;

-- 2) Permite leitura para usuários autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contas_contabeis' AND policyname = 'contas_read_authenticated'
  ) THEN
    CREATE POLICY contas_read_authenticated ON contas_contabeis
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'centros_custo' AND policyname = 'cc_read_authenticated'
  ) THEN
    CREATE POLICY cc_read_authenticated ON centros_custo
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lancamentos_contabeis' AND policyname = 'lancamentos_read_authenticated'
  ) THEN
    CREATE POLICY lancamentos_read_authenticated ON lancamentos_contabeis
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'estrutura_dre' AND policyname = 'estrutura_dre_read_authenticated'
  ) THEN
    CREATE POLICY estrutura_dre_read_authenticated ON estrutura_dre
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'entidades_dre' AND policyname = 'entidades_dre_read_authenticated'
  ) THEN
    CREATE POLICY entidades_dre_read_authenticated ON entidades_dre
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'de_para_dre' AND policyname = 'de_para_dre_read_authenticated'
  ) THEN
    CREATE POLICY de_para_dre_read_authenticated ON de_para_dre
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 3) Permite escrita total para service_role (uso em rotas server-side)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contas_contabeis' AND policyname = 'contas_service_role_all'
  ) THEN
    CREATE POLICY contas_service_role_all ON contas_contabeis
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'centros_custo' AND policyname = 'cc_service_role_all'
  ) THEN
    CREATE POLICY cc_service_role_all ON centros_custo
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lancamentos_contabeis' AND policyname = 'lancamentos_service_role_all'
  ) THEN
    CREATE POLICY lancamentos_service_role_all ON lancamentos_contabeis
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'estrutura_dre' AND policyname = 'estrutura_dre_service_role_all'
  ) THEN
    CREATE POLICY estrutura_dre_service_role_all ON estrutura_dre
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'entidades_dre' AND policyname = 'entidades_dre_service_role_all'
  ) THEN
    CREATE POLICY entidades_dre_service_role_all ON entidades_dre
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'de_para_dre' AND policyname = 'de_para_dre_service_role_all'
  ) THEN
    CREATE POLICY de_para_dre_service_role_all ON de_para_dre
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
