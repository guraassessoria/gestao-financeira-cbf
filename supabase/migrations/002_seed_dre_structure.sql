-- Migration 002: Seed DRE structure lines
-- Based on docs/templates/template-mapeamento-contabil-v1.csv

insert into public.linhas_financeiras
  (demonstracao, secao, subsecao, ordem, descricao, contas, sinal, nivel, is_subtotal, is_total)
values
  -- RECEITAS
  ('DRE', 'RECEITAS', 'Receita Bruta',           10, 'Receita Bruta de Serviços',       '[]', 1, 2, false, false),
  ('DRE', 'RECEITAS', 'Deduções',                20, 'Impostos sobre Serviços',          '[]', -1, 2, false, false),
  ('DRE', 'RECEITAS', 'Deduções',                30, 'Devoluções e Abatimentos',         '[]', -1, 2, false, false),
  ('DRE', 'RECEITAS', 'Subtotal',                40, 'RECEITA LÍQUIDA',                  '[]', 1, 1, true,  false),

  -- CUSTOS
  ('DRE', 'CUSTOS',   'Custos dos Serviços',     50, 'Pessoal e Encargos',               '[]', -1, 2, false, false),
  ('DRE', 'CUSTOS',   'Custos dos Serviços',     60, 'Subcontratados',                   '[]', -1, 2, false, false),
  ('DRE', 'CUSTOS',   'Custos dos Serviços',     70, 'Outros Custos de Serviços',        '[]', -1, 2, false, false),
  ('DRE', 'CUSTOS',   'Subtotal',                80, 'LUCRO BRUTO',                      '[]', 1, 1, true,  false),

  -- DESPESAS OPERACIONAIS
  ('DRE', 'DESPESAS OPERACIONAIS', 'Despesas',   90,  'Vendas e Marketing',              '[]', -1, 2, false, false),
  ('DRE', 'DESPESAS OPERACIONAIS', 'Despesas',   100, 'Gerais e Administrativas',        '[]', -1, 2, false, false),
  ('DRE', 'DESPESAS OPERACIONAIS', 'Despesas',   110, 'Outras Despesas Operacionais',    '[]', -1, 2, false, false),
  ('DRE', 'DESPESAS OPERACIONAIS', 'Subtotal',   120, 'EBITDA',                          '[]', 1, 1, true,  false),

  -- D&A e EBIT
  ('DRE', 'D&A',      'Depreciação',             130, 'Depreciação e Amortização',       '[]', -1, 2, false, false),
  ('DRE', 'D&A',      'Subtotal',                140, 'EBIT',                            '[]', 1, 1, true,  false),

  -- RESULTADO FINANCEIRO
  ('DRE', 'RESULTADO FINANCEIRO', 'Financeiro',  150, 'Receitas Financeiras',            '[]', 1, 2, false, false),
  ('DRE', 'RESULTADO FINANCEIRO', 'Financeiro',  160, 'Despesas Financeiras',            '[]', -1, 2, false, false),
  ('DRE', 'RESULTADO FINANCEIRO', 'Subtotal',    170, 'LAIR',                            '[]', 1, 1, true,  false),

  -- IMPOSTOS E RESULTADO
  ('DRE', 'IMPOSTOS', 'IR/CSLL',                 180, 'Imposto de Renda e CSLL',         '[]', -1, 2, false, false),
  ('DRE', 'RESULTADO','Total',                   190, 'LUCRO LÍQUIDO',                   '[]', 1, 1, false, true);
