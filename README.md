# Gestão Financeira CBF — Painel Executivo

Dashboard financeiro executivo para a **Confederação Brasileira de Futebol**, com:

- **BP** — Balanço Patrimonial
- **DRE** — Demonstração do Resultado do Exercício
- **DFC** — Demonstração do Fluxo de Caixa (Método Indireto)
- **DRA** — Demonstração do Resultado Abrangente

Base normativa: **CPC/IFRS** · Dados: **TOTVS Protheus**

---

## Stack

| Camada        | Tecnologia              |
|---------------|-------------------------|
| Frontend      | Next.js 15 + TypeScript |
| UI            | Tailwind CSS            |
| Gráficos      | Recharts                |
| Backend/BD    | Supabase (PostgreSQL)   |
| Deploy        | Vercel                  |
| Controle      | GitHub                  |

---

## Configuração Inicial

### 1. Variáveis de ambiente

```bash
cd app
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 2. Migrations do banco de dados

Execute no **Supabase SQL Editor** (em ordem):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`

### 3. Instalar dependências e rodar localmente

```bash
cd app
npm install
npm run dev
```

Acesse: http://localhost:3000

### 4. Carregar dados Protheus

```bash
# Configure SUPABASE_URL e SUPABASE_SERVICE_KEY no .env.local
export SUPABASE_URL=https://seu-projeto.supabase.co
export SUPABASE_SERVICE_KEY=eyJ...

# Carregar em ordem
node scripts/ingest-protheus.mjs --arquivo CT1 --path "./arquivos/CT1 - Plano de contas.csv"
node scripts/ingest-protheus.mjs --arquivo CTT --path "./arquivos/CTT - Centros de Custo.csv"
node scripts/ingest-protheus.mjs --arquivo CV0 --path "./arquivos/CV0 - Entidade 05.csv"
node scripts/ingest-protheus.mjs --arquivo CT2 --path "./arquivos/CT2 - Lançamentos.csv"
```

---

## Deploy no Vercel

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. O deploy é automático a cada push na branch principal

---

## Estrutura do Projeto

```
gestao-financeira-cbf/
├── app/                          # Aplicação Next.js
│   ├── src/
│   │   ├── app/                  # App Router (páginas e API routes)
│   │   │   ├── page.tsx          # Painel Geral
│   │   │   ├── dre/page.tsx      # DRE
│   │   │   ├── bp/page.tsx       # Balanço Patrimonial
│   │   │   ├── dfc/page.tsx      # Fluxo de Caixa
│   │   │   ├── dra/page.tsx      # Resultado Abrangente
│   │   │   ├── indicadores/      # Indicadores Financeiros
│   │   │   ├── relatorio/        # Gerador de Relatórios
│   │   │   └── api/              # API Routes (Next.js)
│   │   ├── components/           # Componentes React
│   │   ├── lib/                  # Supabase client
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Cálculos financeiros
│   ├── .env.example              # Exemplo de variáveis de ambiente
│   └── vercel.json               # Configuração Vercel
├── supabase/
│   └── migrations/               # SQL migrations
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
├── scripts/
│   └── ingest-protheus.mjs       # Script de ingestão CSV Protheus
├── arquivos/                     # Arquivos-base Protheus
└── docs/                         # Documentação
```

---

## Ondas de Entrega

| Onda | Entrega | Status |
|------|---------|--------|
| 1 | Dicionário de dados e mapeamento BP/DFC/DRA | ✅ Concluído |
| 2 | Ingestão de lançamentos e validações contábeis | 🔄 Disponível |
| 3 | Modelo comparativo e painel financeiro | 🔨 Em andamento |
| 4 | Indicadores e alertas de materialidade | 🔄 Disponível |
| 5 | Narrativa IA guiada + aprovação | ⏳ Pendente |
| 6 | BRL/USD, tradução e auditoria avançada | ⏳ Pendente |

---

## Indicadores Financeiros (Onda 4)

1. Margem EBITDA
2. Margem Líquida
3. ROE — Retorno sobre Patrimônio Líquido
4. ROA — Retorno sobre Ativo Total
5. Liquidez Corrente
6. Endividamento Geral
7. Composição do Endividamento (CP vs LP)
8. Cobertura de Juros
9. Conversão de Caixa Operacional (CFO/EBITDA)

---

## Segurança e Governança

- **Row Level Security (RLS)** habilitado no Supabase
- **Trilha de auditoria** automática via triggers PostgreSQL
- **Snapshots de carga** para rastreabilidade das importações
- **Workflow de aprovação** para relatórios (Rascunho → Revisão → Aprovado → Emitido)
- Sem reclassificação retroativa automática no histórico
