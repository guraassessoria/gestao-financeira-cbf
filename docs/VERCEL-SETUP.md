# 🚀 Guia de Configuração - Vercel + GitHub

## Pré-requisitos

- [x] Conta no [Vercel](https://vercel.com)
- [x] Repositório GitHub conectado
- [x] Variáveis de ambiente configuradas

## Passo 1: Conectar Repositório ao Vercel

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Procure por e selecione o repositório `gestao-financeira-cbf`
5. Clique em **"Import"**

## Passo 2: Configurar as Variáveis de Ambiente

Na página de configuração do projeto no Vercel:

### Variáveis Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=<sua-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anonima>
SUPABASE_SERVICE_ROLE_KEY=<sua-chave-servico>
NEXTAUTH_SECRET=<gerar-um-secret-seguro>
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

### Para Gerar NEXTAUTH_SECRET

Execute no terminal:

```bash
openssl rand -base64 32
```

Ou use:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Passo 3: Obter Variáveis do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Vá para **Settings** → **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Passo 4: Deploy

Após configurar as variáveis:

1. Clique em **"Deploy"**
2. Aguarde a build e deployment
3. Acesse sua URL: `https://seu-projeto.vercel.app`

## Passo 5: Configurar Domínio Customizado (Opcional)

1. Em **Project Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio próprio
4. Configure os records DNS conforme instruções

## 🔄 Deployment Automático

### Branches para Deploy

- **main** → Production
- **develop** → Preview (se configurado)

Toda vez que você fizer `git push`, o Vercel automaticamente:
1. Clona o repositório
2. Instala dependências
3. Executa `npm run build`
4. Faz deploy da aplicação

## 📊 Monitoramento

### Verificar Logs

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Clique no projeto
3. Vá para **Deployments**
4. Clique no deployment para ver logs

### Variáveis de Ambiente - Preview vs Production

Você pode definir variáveis diferentes para:
- **Production** (branch main)
- **Preview** (pull requests)
- **Development** (local)

## 🆘 Troubleshooting

### Build Falha

1. Verifique os logs: `vercel logs`
2. Confirme as variáveis de ambiente
3. Teste localmente: `npm run build && npm run start`

### Erro de Conexão Supabase

- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Confirme se a chave `NEXT_PUBLIC_SUPABASE_ANON_KEY` é válida

### Erro de Autenticação NextAuth

- Regenere `NEXTAUTH_SECRET`
- Confirme que `NEXTAUTH_URL` corresponde à URL do Vercel

## 📦 Estrutura de Build

O arquivo `vercel.json` contém:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## 🔐 Segurança

### Best Practices

- ✅ Nunca commit variáveis de ambiente
- ✅ Use `.vercelignore` para excluir arquivos desnecessários
- ✅ Mantenha `SUPABASE_SERVICE_ROLE_KEY` segura (nunca no frontend)
- ✅ Prefixe chaves públicas com `NEXT_PUBLIC_`

### Estrutura de Permissões

```
NEXT_PUBLIC_*  → Enviado ao navegador (público)
Sem prefixo    → Mantido no servidor (privado)
```

## 🚀 Multi-Instâncias

Para executar múltiplas instâncias:

1. **Preview**: Automático em Pull Requests
2. **Staging**: Deploy de branch `develop`
3. **Production**: Deploy de branch `main`

Configure em **Project Settings** → **Git** o comportamento de cada branch.

## 📝 Próximos Passos

1. Execute `npm run check-unused` para encontrar arquivos desnecessários
2. Execute `npm run organize-unused` para organizá-los
3. Faça push para GitHub
4. Verifique o deployment automático no [Dashboard Vercel](https://vercel.com/dashboard)

## 📞 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
