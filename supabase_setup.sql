
-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Criar tabela de Perfis (Profiles)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nome text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Criar tabela de Projetos (Projects)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nome_projeto text not null,
  cidade text not null,
  estado varchar(2) not null,
  orientacao_solar text not null,
  sol_nascente_pos text not null,
  quarto_casal_pos text not null,
  largura_terreno numeric not null,
  comprimento_terreno numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Criar tabela de Pavimentos (Floors)
create table public.pavimentos (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  nome text not null,
  nivel integer not null default 0
);

-- 5. Criar tabela de Ambientes (Rooms)
create table public.ambientes (
  id uuid default uuid_generate_v4() primary key,
  pavimento_id uuid references public.pavimentos(id) on delete cascade not null,
  tipo text not null,
  metragem numeric default 0,
  posicao_solar text not null,
  observacoes text
);

-- 6. Criar tabela de Materiais (Materials)
create table public.materiais (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  categoria text not null, -- Construção, Ferragem, Elétrica, Hidráulica, Acabamento
  nome text not null,
  quantidade numeric default 1,
  unidade text default 'Un'
);

-- 7. Configurar RLS (Row Level Security)

-- Ativar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.pavimentos enable row level security;
alter table public.ambientes enable row level security;
alter table public.materiais enable row level security;

-- Políticas para PROFILES
create policy "Usuários podem ver seu próprio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "Usuários podem atualizar seu próprio perfil" on public.profiles
  for update using (auth.uid() = id);
create policy "Inserção pública no cadastro" on public.profiles
  for insert with check (true);

-- Políticas para PROJECTS
create policy "Arquitetos gerenciam seus próprios projetos" on public.projects
  for all using (auth.uid() = user_id);

-- Políticas para PAVIMENTOS (Acesso via subquery de projeto)
create policy "Arquitetos gerenciam seus próprios pavimentos" on public.pavimentos
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- Políticas para AMBIENTES
create policy "Arquitetos gerenciam seus próprios ambientes" on public.ambientes
  for all using (
    pavimento_id in (
      select p.id from public.pavimentos p
      join public.projects pr on p.project_id = pr.id
      where pr.user_id = auth.uid()
    )
  );

-- Políticas para MATERIAIS
create policy "Arquitetos gerenciam seus próprios materiais" on public.materiais
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- 8. Trigger para criar perfil automaticamente no SignUp (Opcional, mas recomendado)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, new.raw_user_meta_data->>'nome', new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
