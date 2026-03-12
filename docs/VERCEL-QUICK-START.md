# 🚀 Guia Rápido - Configuração Vercel

## 📋 Pré-requisitos

- [x] Projeto Next.js pronto
- [x] Repositório GitHub criado
- [x] Supabase configurado
- [x] Vercel CLI instalado localmente

## ⚡ Configuração Rápida (5 minutos)

### Opção 1: Automática (Recomendado)

```bash
npm run vercel:setup
```

Este comando fará:
1. ✓ Login no Vercel
2. ✓ Linkar projeto
3. ✓ Salvar IDs do projeto

### Opção 2: Manual

```bash
# 1. Fazer login
npm run vercel:login

# 2. Linkar projeto
npm run vercel:link
```

## 🔐 Configurar Variáveis de Ambiente

Após linkar, configure no **Vercel Dashboard**:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Vá para **Settings** → **Environment Variables**
4. Adicione as variáveis abaixo:

### Variáveis Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://ifsyeqzodimustnxgwyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-valor-aqui
SUPABASE_SERVICE_ROLE_KEY=seu-valor-aqui
NEXTAUTH_SECRET=seu-valor-aqui
NEXTAUTH_URL=https://seu-app.vercel.app
```

### Onde Obter Cada Valor

#### Supabase URL e Chaves
1. Acesse: https://app.supabase.com
2. Vá para seu projeto
3. Settings → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

#### NEXTAUTH_SECRET
Gere um valor aleatório seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### NEXTAUTH_URL
Use o URL do Vercel (obtido na dashboard):
```
https://seu-projeto-name.vercel.app
```

## 📝 Definir Variáveis no Vercel Dashboard

### Passo 1: Acesse o Dashboard

https://vercel.com/dashboard/projects/gestao-financeira-cbf

### Passo 2: Vá para Settings

Clique na aba **Settings** no topo

### Passo 3: Environment Variables

No menu esquerdo, procure por **Environment Variables**

### Passo 4: Adicione Variáveis

Clique em **"Add New"** e preencha:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ifsyeqzodimustnxgwyt.supabase.co
Environments: Production, Preview, Development
```

Repita para cada variável.

## ✅ Verificar Configuração

### Verificar Conexão Local

```bash
# Testar build
npm run build

# Testar início da aplicação
npm run start
```

### Verificar no Vercel

1. Acesse seu projeto no Vercel
2. Vá para **Deployments**
3. Verifique se o último deploy foi bem-sucedido

## 🔄 Deploy Automático

Após linkar e configurar variáveis:

1. Faça um commit:
```bash
git add .
git commit -m "vercel: project configuration"
```

2. Faça push:
```bash
git push origin main
```

3. O Vercel detectará a mudança e fará deploy automaticamente

## 📊 Ambientes

Você pode ter variáveis diferentes por ambiente:

| Ambiente | Branch | URL |
|----------|--------|-----|
| Production | main | https://seu-app.vercel.app |
| Preview | PR/develop | https://seu-app-preview.vercel.app |
| Development | Local | http://localhost:3000 |

### Configurar por Ambiente

No Vercel Dashboard, ao adicionar variável, selecione:
- [x] Production
- [x] Preview  
- [x] Development

## 🆘 Troubleshooting

### Erro: "Project not found"
- Verifique se o repositório está correto
- Confirme permissões no GitHub

### Erro: "Build failed"
- Verifique os logs: **Deployments** → click no deployment
- Confirme se variáveis de ambiente estão configuradas
- Teste localmente: `npm run build`

### Erro: "Cannot connect to Supabase"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Confirme que a chave `NEXT_PUBLIC_SUPABASE_ANON_KEY` é válida

### Erro: "NextAuth não conecta"
- Regenere `NEXTAUTH_SECRET`
- Confirme que `NEXTAUTH_URL` é a URL correta do Vercel
- Limpe cookies do navegador

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Docs - Deployments](https://vercel.com/docs/deployments/overview)
- [Vercel Docs - Preview Deployments](https://vercel.com/docs/deployments/preview)

## 📈 Próximos Passos

1. ✓ Linkar projeto
2. ✓ Configurar variáveis
3. [ ] Configurar domínio customizado (opcional)
4. [ ] Ativar SSL/HTTPS (automático)
5. [ ] Configurar redirects (opcional)
6. [ ] Configurar rate limiting (opcional)

## 🎯 Checklist Final

- [ ] Projeto linkado ao Vercel
- [ ] NEXT_PUBLIC_SUPABASE_URL configurada
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] NEXTAUTH_SECRET configurada
- [ ] NEXTAUTH_URL configurada
- [ ] Primeiro deploy foi bem-sucedido
- [ ] Aplicação está online e funcional

## ⚡ Comandos Rápidos

```bash
# Verificar status de deployment
npm run vercel:status

# Fazer deploy de produção
npm run vercel:deploy --prod

# Visualizar logs
npm run vercel:logs
```

---

**Tempo Estimado**: ⏱️ 5-10 minutos
**Dificuldade**: 🟢 Fácil

Depois de configurar, sua aplicação estará online em poucos segundos!
