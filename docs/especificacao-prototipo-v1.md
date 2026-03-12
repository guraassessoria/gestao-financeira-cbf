# Prototipo V1 - Painel de Gestao Financeira

## 1. Contexto
Projeto de painel executivo-financeiro para empresa unica, com visoes mensal, trimestral e anual, com base no TOTVS Protheus.

Demonstracoes no escopo:
- BP (a mapear)
- DRE (estrutura ja definida)
- DFC metodo indireto (a mapear)
- DRA (estrutura preparada, componentes finais pendentes)

## 2. Requisitos Funcionais
1. Comparacao Ano Selecionado x Ano Anterior para BP, DRE, DFC e DRA.
2. Exibicao das variacoes:
- Quantitativa (valor absoluto)
- Percentual
- Qualitativa (texto guiado)
3. Visoes temporais:
- Mensal
- Trimestral
- Anual
4. Relatorios semiautomaticos para reunioes de diretoria e notas explicativas.
5. Conversao BRL para USD com traducao das demonstracoes.
6. Perfil de aprovacao/consumo: auditor, contador, presidente e diretor.
7. Seguranca e trilha de auditoria obrigatorias.

## 3. Regras Contabeis e Governanca
1. Base normativa CPC/IFRS com personalizacoes gerenciais documentadas.
2. Uso de numeros fechados.
3. Sem reclassificacao retroativa automatica no historico.
4. Materialidade para texto qualitativo: linhas com variacao expressiva.
5. Workflow com revisao humana obrigatoria antes da emissao de relatorio.
6. Separacao entre visao societaria e gerencial preparada (ativacao futura).

## 4. Fontes de Dados (arquivos-base atuais)
- `arquivos/CT1 - Plano de contas.csv`
- `arquivos/CT2 - Lancamentos.csv` (arquivo atual no workspace com acento no nome)
- `arquivos/CTT - Centros de Custo.csv`
- `arquivos/CV0 - Entidade 05.csv`
- `arquivos/DRE - Estrutura.xls`
- `arquivos/DRE - De_Para.xls`

Observacoes de leitura:
- CSVs Protheus contem preambulo nas 2 primeiras linhas.
- Delimitador principal: `;`
- Necessario padronizar encoding para ingestao confiavel (UTF-8 ou Latin-1 controlado).

## 5. Entregas do Prototipo
1. Modelo de dados financeiro consolidado para BP/DRE/DFC/DRA.
2. Mapeamento de contas para BP, DFC indireto e estrutura inicial DRA.
3. Painel com comparativos anual/anterior e cortes mensal-trimestral-anual.
4. Indicadores financeiros principais para empresa de servicos.
5. Gerador de narrativa contabil semiautomatica com perguntas guiadas.
6. Exportacao de relatorios para comite executivo.

## 6. Indicadores Financeiros V1 (servicos)
1. Margem EBITDA
2. Margem liquida
3. ROE
4. ROA
5. Liquidez corrente
6. Endividamento geral
7. Composicao do endividamento (CP vs LP)
8. Cobertura de juros
9. Conversao de caixa operacional (CFO/EBITDA)

## 7. Backlog em Ondas
1. Onda 1: Dicionario de dados e mapeamento BP/DFC/DRA.
2. Onda 2: Ingestao de lancamentos e validacoes contabeis basicas.
3. Onda 3: Modelo comparativo e painel financeiro.
4. Onda 4: Indicadores e alertas de materialidade.
5. Onda 5: Narrativa IA guiada + aprovacao.
6. Onda 6: BRL/USD, traducao e endurecimento de auditoria.

## 8. Definicoes Pendentes
1. Componentes finais de DRA (OCI).
2. Politica de cambio BRL/USD (fonte, data de corte, taxa media/fechamento).
3. Regra formal de materialidade (ex.: percentual e valor absoluto minimo).
4. Ferramenta de BI e stack final para narrativa IA.
