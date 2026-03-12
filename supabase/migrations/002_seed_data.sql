-- ============================================================
-- Seed: Mapeamento inicial DRE (De-Para aprovado)
-- Seed: Estrutura de mapeamento BP/DFC/DRA (esqueleto)
-- ============================================================

-- Estrutura DRE baseada nos arquivos DRE - Estrutura.xls e DRE - De_Para.xls
-- (status aprovado conforme especificacao)
INSERT INTO mapeamento_contas (demonstracao, secao, subsecao, linha, ordem, sinal_apresentacao, regra_soma, usa_ccusto, usa_entidade05, usa_de_para_dre, status, owner_validacao) VALUES
-- DRE
('DRE', 'RECEITAS', 'Receita Bruta',           'Receita Bruta de Servicos',           10, 'positivo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'RECEITAS', 'Deducoes',                 'Deducoes da Receita',                 20, 'negativo', 'de_para', true, false, true, 'aprovado', 'Controladoria'),
('DRE', 'RECEITAS', 'Receita Liquida',          'Receita Operacional Liquida',         30, 'positivo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'CUSTOS',   'Custos Servicos',          'Custo dos Servicos Prestados',        40, 'negativo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'RESULTADO','Lucro Bruto',              'Lucro Bruto',                         50, 'positivo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas Administrativas', 'Despesas com Pessoal',                60, 'negativo', 'de_para', true, false, true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas Administrativas', 'Despesas Administrativas Gerais',     70, 'negativo', 'de_para', true, false, true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas com Competicoes', 'Despesas com Selecao Principal',      80, 'negativo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas com Competicoes', 'Despesas com Selecoes de Base',       90, 'negativo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas com Competicoes', 'Despesas com Selecoes Femininas',    100, 'negativo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Despesas com Competicoes', 'Despesas com Campeonato Brasileiro', 110, 'negativo', 'de_para', true, true,  true, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Outras Despesas',          'Outras Despesas Operacionais',        120, 'negativo', 'de_para', true, false, true, 'aprovado', 'Controladoria'),
('DRE', 'RESULTADO','EBITDA',                   'EBITDA',                              130, 'positivo', 'de_para', false, false, false, 'aprovado', 'Controladoria'),
('DRE', 'DESPESAS', 'Depreciacoes',             'Depreciacao e Amortizacao',           140, 'negativo', 'de_para', false, false, true, 'aprovado', 'Controladoria'),
('DRE', 'RESULTADO','EBIT',                     'Resultado Operacional (EBIT)',         150, 'positivo', 'de_para', false, false, false, 'aprovado', 'Controladoria'),
('DRE', 'FINANCEIRO','Resultado Financeiro',    'Receitas Financeiras',                160, 'positivo', 'de_para', false, false, true, 'aprovado', 'Controladoria'),
('DRE', 'FINANCEIRO','Resultado Financeiro',    'Despesas Financeiras',                170, 'negativo', 'de_para', false, false, true, 'aprovado', 'Controladoria'),
('DRE', 'FINANCEIRO','Resultado Financeiro',    'Resultado Financeiro Liquido',        180, 'positivo', 'de_para', false, false, false, 'aprovado', 'Controladoria'),
('DRE', 'RESULTADO','EBT',                      'Resultado Antes do IR/CSLL',          190, 'positivo', 'de_para', false, false, false, 'aprovado', 'Controladoria'),
('DRE', 'IMPOSTOS', 'Tributos sobre Resultado', 'IR e CSLL',                           200, 'negativo', 'de_para', false, false, true, 'aprovado', 'Controladoria'),
('DRE', 'RESULTADO','Lucro Liquido',            'Lucro/Prejuizo Liquido do Exercicio', 210, 'positivo', 'de_para', false, false, false, 'aprovado', 'Controladoria'),

-- BP - Ativo
('BP', 'ATIVO', 'Circulante',        'Caixa e Equivalentes de Caixa',       10, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Circulante',        'Aplicacoes Financeiras de Curto Prazo',20, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Circulante',        'Contas a Receber',                     30, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Circulante',        'Estoques',                             40, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Circulante',        'Outros Ativos Circulantes',            50, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Total Circulante',  'Total Ativo Circulante',               60, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Nao Circulante',    'Investimentos',                        70, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Nao Circulante',    'Imobilizado Liquido',                  80, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Nao Circulante',    'Intangivel Liquido',                   90, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Nao Circulante',    'Outros Ativos Nao Circulantes',       100, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Total Nao Circ.',   'Total Ativo Nao Circulante',          110, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'ATIVO', 'Total',             'TOTAL DO ATIVO',                      120, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),

-- BP - Passivo
('BP', 'PASSIVO', 'Circulante',       'Fornecedores',                        130, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Circulante',       'Emprestimos e Financiamentos CP',     140, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Circulante',       'Obrigacoes Fiscais e Trabalhistas',   150, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Circulante',       'Outras Obrigacoes Circulantes',       160, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Total Circulante', 'Total Passivo Circulante',            170, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Nao Circulante',   'Emprestimos e Financiamentos LP',     180, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Nao Circulante',   'Provisoes LP',                        190, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Nao Circulante',   'Outros Passivos Nao Circulantes',     200, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO', 'Total Nao Circ.',  'Total Passivo Nao Circulante',        210, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),

-- BP - Patrimonio Liquido
('BP', 'PATRIMONIO LIQUIDO', 'Capital', 'Capital Social Integralizado',       220, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PATRIMONIO LIQUIDO', 'Reservas','Reservas de Capital',                230, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PATRIMONIO LIQUIDO', 'Reservas','Reservas de Lucros',                 240, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PATRIMONIO LIQUIDO', 'OCI',     'Outros Resultados Abrangentes',      250, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PATRIMONIO LIQUIDO', 'Total',   'Total Patrimonio Liquido',           260, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('BP', 'PASSIVO',  'Total Geral',      'TOTAL PASSIVO + PL',                 270, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),

-- DFC - Metodo Indireto
('DFC', 'OPERACIONAL', 'Resultado',       'Lucro Liquido do Exercicio',         10, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Ajustes',         'Depreciacao e Amortizacao',          20, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Ajustes',         'Resultado Financeiro Liquido',       30, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Ajustes',         'Provisoes e Outros Ajustes',         40, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Var. Capital',    'Variacao de Contas a Receber',       50, 'negativo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Var. Capital',    'Variacao de Fornecedores',           60, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Var. Capital',    'Variacao de Obrigacoes Fiscais',     70, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Var. Capital',    'Outros Ativos e Passivos Operac.',   80, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'OPERACIONAL', 'Total',           'Caixa Gerado pelas Operacoes',       90, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'INVESTIMENTO','Entradas',        'Recebimento por Venda de Ativos',   100, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'INVESTIMENTO','Saidas',          'Aquisicao de Imobilizado',           110, 'negativo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'INVESTIMENTO','Saidas',          'Aquisicao de Intangivel',            120, 'negativo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'INVESTIMENTO','Total',           'Caixa Atividades de Investimento',  130, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'FINANCIAMENTO','Entradas',       'Captacao de Emprestimos',            140, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'FINANCIAMENTO','Saidas',         'Pagamento de Emprestimos',           150, 'negativo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'FINANCIAMENTO','Saidas',         'Juros Pagos',                        160, 'negativo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'FINANCIAMENTO','Total',          'Caixa Atividades de Financiamento', 170, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'RESULTADO',   'Total',           'Variacao Liquida de Caixa',          180, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'RESULTADO',   'Total',           'Caixa Inicio do Periodo',            190, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DFC', 'RESULTADO',   'Total',           'Caixa Final do Periodo',             200, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),

-- DRA - Resultado Abrangente
('DRA', 'OCI', 'Resultado do Exercicio', 'Lucro Liquido do Exercicio',          10, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade'),
('DRA', 'OCI', 'Outros Resultados',      'Ajuste de Avaliacao Patrimonial',     20, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DRA', 'OCI', 'Outros Resultados',      'Ganhos/Perdas Atuariais',             30, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DRA', 'OCI', 'Outros Resultados',      'Outros Componentes OCI',              40, 'positivo', 'faixa', false, false, false, 'pendente', 'Contabilidade'),
('DRA', 'OCI', 'Total',                  'Resultado Abrangente Total',          50, 'positivo', 'regra', false, false, false, 'pendente', 'Contabilidade');

-- Periodos de fechamento para 2024 e 2025 (base para comparativo)
INSERT INTO fechamentos (ano, mes, status) VALUES
(2024, 1,  'fechado'), (2024, 2,  'fechado'), (2024, 3,  'fechado'),
(2024, 4,  'fechado'), (2024, 5,  'fechado'), (2024, 6,  'fechado'),
(2024, 7,  'fechado'), (2024, 8,  'fechado'), (2024, 9,  'fechado'),
(2024, 10, 'fechado'), (2024, 11, 'fechado'), (2024, 12, 'fechado'),
(2025, 1,  'fechado'), (2025, 2,  'fechado'), (2025, 3,  'aberto'),
(2025, 4,  'aberto'),  (2025, 5,  'aberto'),  (2025, 6,  'aberto'),
(2025, 7,  'aberto'),  (2025, 8,  'aberto'),  (2025, 9,  'aberto'),
(2025, 10, 'aberto'),  (2025, 11, 'aberto'),  (2025, 12, 'aberto')
ON CONFLICT (ano, mes) DO NOTHING;
