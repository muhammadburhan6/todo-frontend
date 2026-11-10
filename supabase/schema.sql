create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todos
  add column if not exists completed boolean not null default false;

alter table public.todos enable row level security;

drop policy if exists todos_own on public.todos;

create policy todos_own on public.todos
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);