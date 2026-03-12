# 🔧 Configuração de Ambiente

## Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico-privada

# NextAuth
NEXTAUTH_SECRET=gere-um-secret-seguro-aqui
NEXTAUTH_URL=http://localhost:3000

# Desenvolvimento
NODE_ENV=development
```

## Como Obter as Variáveis

### Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Vá para **Settings** → **API**
3. Copie os valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### NextAuth Secret

Gere um valor aleatório seguro:

```bash
# Opção 1: usando openssl
openssl rand -base64 32

# Opção 2: usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Variáveis por Ambiente

### Development (Local)
```
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Staging
```
NEXTAUTH_URL=https://staging.seu-dominio.com
NODE_ENV=production
```

### Production
```
NEXTAUTH_URL=https://seu-dominio.com
NODE_ENV=production
```

## GitHub Secrets para CI/CD

Adicione os seguintes secrets no repositório GitHub:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**

### Secrets Necessários

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### NextAuth
- `NEXTAUTH_SECRET` (gere um novo para produção)
- `NEXTAUTH_URL`

#### Vercel
- `VERCEL_TOKEN` - Obtenha em https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Seu ID de organização no Vercel
- `VERCEL_PROJECT_ID` - Seu ID de projeto no Vercel

#### Segurança (Opcional)
- `SNYK_TOKEN` - Para verificação de segurança

### Encontrar IDs do Vercel

```bash
# Instale o CLI do Vercel
npm install -g vercel

# Faça login
vercel login

# Vá para a pasta do projeto
cd gestao-financeira-cbf

# Execute link
vercel link
```

Os IDs estarão disponíveis em `.vercel/project.json`

## Variáveis de Ambiente por Arquivo

### `.env` (Git)
```env
# Base de configurações compartilhadas
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
```

### `.env.local` (Não commitado)
```env
# Chaves privadas - NUNCA commitar
SUPABASE_SERVICE_ROLE_KEY=sk_prod_xxxxx
NEXTAUTH_SECRET=xxxxx
```

### `.env.production` (Git - respeita secrets do Vercel)
```env
# Configurações de produção
NODE_ENV=production
```

## Verificar Configuração

Para verificar se tudo está configurado corretamente:

```bash
# 1. Verificar se .env.local existe
test -f .env.local && echo "✅ .env.local existe" || echo "❌ .env.local não encontrado"

# 2. Tentar fazer uma conexão com Supabase
npm run dev

# 3. Em outro terminal, testar a API
curl http://localhost:3000/api/auth/providers
```

## Segurança

### ✅ Boas Práticas

- [x] Nunca commitar `.env.local`
- [x] Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- [x] Usar `NEXT_PUBLIC_` apenas para variáveis públicas
- [x] Regenerar secrets em produção
- [x] Mudar `NEXTAUTH_SECRET` regularmente

### ❌ Evitar

- ❌ Commitar arquivos `.env`
- ❌ Expor secrets em logs
- ❌ Usar a mesma chave em múltiplos ambientes
- ❌ Compartilhar variáveis via Slack/Email

## Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY não encontrado"
- Verifique se `.env.local` existe
- Confirme que a variável está definida corretamente
- Reinicie o servidor: `npm run dev`

### Erro: "NextAuth session não funciona"
- Regenere `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Confirme que `NEXTAUTH_URL` corresponde ao host atual
- Limpe cookies do navegador

### Erro: "Conexão Supabase recusada"
- Verifique se a URL está correta
- Confirme que não há caracteres especiais não escapados
- Teste a conexão: `curl $NEXT_PUBLIC_SUPABASE_URL/`

## Recursos

- [Documentação Next.js - Variáveis de Ambiente](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase - Setup](https://supabase.io/docs/guides/getting-started)
- [NextAuth.js - Environment Variables](https://next-auth.js.org/configuration/options)
