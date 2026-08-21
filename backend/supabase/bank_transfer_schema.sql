-- Futbol Laboratuvarı Havale / EFT / FAST ödeme şeması
-- Supabase SQL Editor içinde bir kez çalıştırılır.
-- Müşteri verileri public GitHub dosyalarında tutulmaz.

create extension if not exists pgcrypto;

create table if not exists public.bank_transfer_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  email text not null,
  customer_name text not null,
  phone text not null,
  plan_id text not null,
  plan_name text not null,
  amount_kurus integer not null check (amount_kurus > 0),
  currency text not null default 'TRY',
  status text not null default 'pending' check (status in ('pending','payment_reported','paid','rejected','cancelled','expired')),
  payment_reference text not null unique,
  payment_reported_at timestamptz,
  paid_at timestamptz,
  approved_by text,
  membership_code_cipher text,
  membership_code_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bank_transfer_orders_email_idx on public.bank_transfer_orders(lower(email));
create index if not exists bank_transfer_orders_status_idx on public.bank_transfer_orders(status);
create index if not exists bank_transfer_orders_created_idx on public.bank_transfer_orders(created_at desc);

alter table public.bank_transfer_orders enable row level security;

-- Browser doğrudan tabloya erişmez. Vercel API yalnız SUPABASE_SERVICE_ROLE_KEY ile erişir.
-- Bu nedenle anon/authenticated policy tanımlanmamıştır.

create or replace function public.touch_bank_transfer_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bank_transfer_orders_updated_at on public.bank_transfer_orders;
create trigger trg_bank_transfer_orders_updated_at
before update on public.bank_transfer_orders
for each row execute function public.touch_bank_transfer_order_updated_at();
