-- Futbol Laboratuvarı gerçek üyelik backend şeması
-- Bu dosya Supabase SQL Editor içinde çalıştırılacak.

create extension if not exists pgcrypto;

create table if not exists public.membership_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  plan_code text not null default 'premium',
  plan_name text not null default 'Premium Üye',
  max_activations integer not null default 1,
  used_activations integer not null default 0,
  max_analysis_count integer not null default 20,
  expires_at timestamptz,
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_activations (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.membership_codes(id) on delete cascade,
  client_id text not null,
  remaining_analysis_count integer not null default 20,
  first_activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(code_id, client_id)
);

create table if not exists public.membership_events (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references public.membership_codes(id) on delete set null,
  client_id text,
  event_type text not null,
  event_note text,
  created_at timestamptz not null default now()
);

create index if not exists membership_codes_hash_idx on public.membership_codes(code_hash);
create index if not exists membership_activations_client_idx on public.membership_activations(client_id);
create index if not exists membership_events_created_idx on public.membership_events(created_at desc);

alter table public.membership_codes enable row level security;
alter table public.membership_activations enable row level security;
alter table public.membership_events enable row level security;

-- Tablolar frontend'e doğrudan açılmayacak. Kontrol Edge Function üzerinden yapılacak.
-- Bu yüzden public SELECT/INSERT policy eklenmedi.
