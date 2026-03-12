# Checklist de Carga de Dados - Prototipo V1

## 1. Arquivos obrigatorios
- [ ] CT1 - Plano de contas
- [ ] CT2 - Lancamentos
- [ ] CTT - Centros de Custo
- [ ] CV0 - Entidade 05
- [ ] DRE - Estrutura
- [ ] DRE - De_Para

## 2. Padrao de arquivo
- [ ] Delimitador `;`
- [ ] Preambulo de 2 linhas removido/ignorado na ingestao
- [ ] Encoding padronizado e registrado (UTF-8 ou Latin-1)
- [ ] Cabecalhos preservados com nomes originais

## 3. Regras de qualidade minima
- [ ] `Data Lcto` valida (`dd/MM/yyyy`)
- [ ] `Tipo Lcto = Partida Dobrada` filtrado para fatos contabeis
- [ ] `Cta Debito` e `Cta Credito` preenchidas para fatos
- [ ] `Valor` numerico valido
- [ ] Chaves de centro de custo mapeaveis no CTT
- [ ] Contas do CT2 existentes no CT1

## 4. Controles de governanca
- [ ] Snapshot da carga com data/hora e usuario
- [ ] Versionamento de fechamento contabil
- [ ] Trilha de auditoria de ajustes de mapeamento
- [ ] Registro da politica de cambio BRL/USD aplicada na versao

## 5. Pendencias para fechar V1
- [ ] Definicao dos componentes OCI (DRA)
- [ ] Regra de materialidade (percentual e valor minimo)
- [ ] Aprovacao do template de texto contabil para IA
