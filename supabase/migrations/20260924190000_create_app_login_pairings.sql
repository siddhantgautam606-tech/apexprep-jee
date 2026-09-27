create table if not exists public.app_login_pairings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists app_login_pairings_active_idx
  on public.app_login_pairings (code_hash, expires_at)
  where consumed_at is null;

alter table public.app_login_pairings enable row level security;
