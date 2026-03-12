# 🔗 Guia de Conexão - Supabase CLI

## Pré-requisitos

- [x] Supabase CLI instalado (v2.78.1+)
- [x] Conta em https://app.supabase.com
- [x] Projeto Supabase criado (Project Ref: `ifsyeqzodimustnxgwyt`)

## Passo 1: Gerar Token de Acesso

1. Acesse: https://app.supabase.com/account/tokens
2. Clique em **"Create access token"**
3. Nomeie como: `local-development` (ou outro nome)
4. Copie o token gerado

⚠️ **IMPORTANT**: Nunca compartilhe ou commite esse token!

## Passo 2: Configurar Variável de Ambiente

Crie `.env.local` na raiz do projeto com:

```env
SUPABASE_ACCESS_TOKEN=seu_token_aqui
```

Ou exporte antes de executar os comandos:

```bash
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"

# Windows CMD
set SUPABASE_ACCESS_TOKEN=seu_token_aqui

# Linux/Mac
export SUPABASE_ACCESS_TOKEN=seu_token_aqui
```

## Passo 3: Fazer Login

```bash
npx supabase login
```

Você será solicitado a colar seu token de acesso.

## Passo 4: Conectar ao Projeto

```bash
npm run supabase:link
```

Ou manualmente:

```bash
npx supabase link --project-ref ifsyeqzodimustnxgwyt
```

## Passo 5: Verificar Conexão

```bash
# Ver status da conexão
npx supabase status

# Listar migrações
npm run supabase:migrations
```

## Comandos Úteis

### Gerenciar Migrações

```bash
# Listar migrações
npm run supabase:migrations

# Ir para production
npm run supabase:push

# Ver diferenças entre local e remoto
npx supabase db push --dry-run

# Puxar esquema remoto
npx supabase db pull
```

### Gerenciar Banco de Dados Local

```bash
# Iniciar containers locais
npx supabase start

# Parar containers locais
npx supabase stop

# Ver status dos containers
npx supabase status
```

### Gerar Cliente TypeScript

```bash
# Gerar tipos do banco de dados
npx supabase gen types typescript --linked --schema public > src/types/database.ts
```

## Estrutura de Pastas

```
supabase/
├── config.toml              # Configuração do projeto
├── migrations/              # Migrações do banco de dados
│   ├── 202603110001_001_init_schema.sql
│   ├── 202603120001_002_entidades_de_para.sql
│   ├── 202603120002_003_drop_valid_tipo_constraint.sql
│   ├── 202603120003_004_rls_hardening.sql
│   ├── 202603120004_005_upload_logs_tipos_dre.sql
│   └── 202603120006_007_deduplica_lancamentos.sql
└── .branches/              # Preview branches
```

## Workflow Típico

### 1. Desenvolver Localmente

```bash
# Inicie os containers
npx supabase start

# Veja os dados em http://localhost:54323
# API em http://localhost:54321
```

### 2. Criar Migração

```bash
# Faça as mudanças no Studio local
# Depois gere a migração
npx supabase migration new seu_nome_da_migracao
```

### 3. Enviar para Produção

```bash
# Primeiro, faça um teste
npx supabase db push --dry-run

# Se tudo bem, faça o push
npm run supabase:push
```

## Solução de Problemas

### Erro: "Token de acesso inválido"
- Verifique se o token está correto
- Gere um novo token se necessário
- Confirme que não há espaços extras

### Erro: "Project not found"
- Verifique Project Ref: https://app.supabase.com/projects
- Confirme que está usando o projeto correto

### Erro: "Cannot connect to Docker daemon"
- Instale Docker: https://www.docker.com/products/docker-desktop
- Inicie o Docker Desktop
- Execute novamente: `npx supabase start`

### Erro: "Port already in use"
- Verifique portas em uso: `netstat -ano`
- Ou pare containers: `npx supabase stop`

## Autenticação Persistente

Após fazer login uma vez, o token é armazenado em:

**Windows**: `C:\Users\{user}\AppData\Local\supabase\credentials.json`
**Linux/Mac**: `~/.supabase/credentials.json`

Você não precisa fazer login novamente em cada comando.

## Segurança

### ✅ Fazer
- [x] Usar variáveis de ambiente para tokens
- [x] Adicionar `.supabase/` ao `.gitignore`
- [x] Regenerar tokens regularmente
- [x] Usar diferentes tokens por ambiente

### ❌ Não fazer
- ❌ Commitar arquivos com tokens
- ❌ Compartilhar tokens por Slack/Email
- ❌ Usar tokens em logs
- ❌ Reutilizar tokens entre projetos

## Próximas Etapas

1. **Gere um token** em https://app.supabase.com/account/tokens
2. **Execute**: `npx supabase login` e cole seu token
3. **Conecte**: `npm run supabase:link`
4. **Verifique**: `npx supabase status`
5. **Teste**: `npm run dev`

## Referências

- [Supabase CLI Docs](https://supabase.com/docs/guides/local-development)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Database Migrations](https://supabase.com/docs/guides/migrations)
