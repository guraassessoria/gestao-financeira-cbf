# Gestão Financeira CBF

Painel executivo financeiro para a CBF, integrado ao TOTVS Protheus via arquivos CSV.

## Stack
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Row Level Security)
- **Deploy**: Vercel
- **Charts**: Recharts
- **CSV Parsing**: PapaParse

## Demonstrações Financeiras
- **DRE** – Demonstração do Resultado do Exercício
- **BP** – Balanço Patrimonial
- **DFC** – Demonstração do Fluxo de Caixa (Método Indireto)
- **DRA** – Demonstração do Resultado Abrangente

## Início rápido

### 1. Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 2. Banco de dados
Execute no SQL Editor do Supabase:
```
supabase/migrations/001_initial_schema.sql
```

### 3. Instalar dependências e rodar
```bash
npm install
npm run dev
```

### 4. Importar dados
Acesse http://localhost:3000/upload e importe os arquivos do Protheus:
- `CT1 - Plano de contas.csv`
- `CT2 - Lançamentos.csv`
- `CTT - Centros de Custo.csv`

## Indicadores V1 (empresa de serviços)
Margem EBITDA · Margem Líquida · ROE · ROA · Liquidez Corrente · Endividamento Geral · Composição CP/LP · Cobertura de Juros · Conversão de Caixa Operacional

## Perfis de Acesso
| Perfil | Permissões |
|--------|-----------|
| contador | Carga, configuração, emissão |
| auditor | Leitura + trilha de auditoria |
| presidente | Leitura + aprovação |
| diretor | Leitura dos painéis |

## Deploy no Vercel
Conecte o repositório no [Vercel](https://vercel.com) e configure as variáveis de ambiente. O arquivo `vercel.json` já configura a região `gru1` (São Paulo).
