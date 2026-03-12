-- Migration 001: Initial schema

-- Profiles (linked to auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  name         text not null default '',
  role         text not null default 'auditor'
                 check (role in ('auditor', 'contador', 'presidente', 'diretor')),
  created_at   timestamptz not null default now()
);

-- Plano de contas
create table public.plano_contas (
  codigo       text primary key,
  descricao    text not null,
  tipo         text not null default '',
  nivel        int  not null default 1,
  grupo        text not null default '',
  created_at   timestamptz not null default now()
);

-- Centros de custo
create table public.centros_custo (
  codigo       text primary key,
  descricao    text not null,
  created_at   timestamptz not null default now()
);

-- Lotes de carga (import batches)
create table public.lotes_carga (
  id                  uuid primary key default gen_random_uuid(),
  nome_arquivo        text not null,
  tipo                text not null,
  linhas_processadas  int  not null default 0,
  linhas_erro         int  not null default 0,
  usuario_id          uuid references auth.users(id),
  created_at          timestamptz not null default now()
);

-- Lançamentos contábeis
create table public.lancamentos (
  id              uuid primary key default gen_random_uuid(),
  data            date not null,
  conta_debito    text not null references public.plano_contas(codigo),
  conta_credito   text not null references public.plano_contas(codigo),
  valor           numeric(18, 2) not null,
  historico       text not null default '',
  centro_custo    text references public.centros_custo(codigo),
  entidade        text,
  periodo         text not null,   -- YYYY-MM
  ano             int  not null,
  mes             int  not null,
  lote_carga_id   uuid references public.lotes_carga(id),
  created_at      timestamptz not null default now()
);

-- Estrutura das demonstrações financeiras
create table public.linhas_financeiras (
  id           uuid primary key default gen_random_uuid(),
  demonstracao text not null check (demonstracao in ('BP', 'DRE', 'DFC', 'DRA')),
  secao        text not null,
  subsecao     text not null default '',
  ordem        int  not null,
  descricao    text not null,
  contas       jsonb not null default '[]',
  sinal        int  not null default 1 check (sinal in (1, -1)),
  nivel        int  not null default 1,
  is_subtotal  boolean not null default false,
  is_total     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Audit log
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id),
  action      text not null,
  resource    text not null,
  details     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Indexes
create index on public.lancamentos (periodo);
create index on public.lancamentos (ano, mes);
create index on public.lancamentos (conta_debito);
create index on public.lancamentos (conta_credito);
create index on public.linhas_financeiras (demonstracao, ordem);
create index on public.audit_logs (user_id);
create index on public.audit_logs (created_at desc);

-- Enable Row Level Security
alter table public.profiles         enable row level security;
alter table public.plano_contas      enable row level security;
alter table public.centros_custo     enable row level security;
alter table public.lotes_carga       enable row level security;
alter table public.lancamentos       enable row level security;
alter table public.linhas_financeiras enable row level security;
alter table public.audit_logs        enable row level security;

-- RLS Policies: authenticated users can read everything
create policy "authenticated_read_profiles"
  on public.profiles for select
  to authenticated using (true);

create policy "authenticated_read_plano_contas"
  on public.plano_contas for select
  to authenticated using (true);

create policy "authenticated_read_centros_custo"
  on public.centros_custo for select
  to authenticated using (true);

create policy "authenticated_read_lotes_carga"
  on public.lotes_carga for select
  to authenticated using (true);

create policy "authenticated_read_lancamentos"
  on public.lancamentos for select
  to authenticated using (true);

create policy "authenticated_read_linhas_financeiras"
  on public.linhas_financeiras for select
  to authenticated using (true);

create policy "authenticated_read_audit_logs"
  on public.audit_logs for select
  to authenticated using (true);

-- RLS Policies: only the user can see their own profile for writes
create policy "users_update_own_profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- Trigger: auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'auditor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
