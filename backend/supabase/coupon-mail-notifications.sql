-- Kupon mail teslimat kimlikleri yalnız backend service_role ile yönetilir.
-- Bu tablo kupon/veri üretimini değiştirmez; yalnız duplicate gönderimi engeller.

create table if not exists public.coupon_mail_deliveries (
  coupon_id text primary key,
  payload_hash text not null,
  coupon_type text not null,
  generated_at timestamptz not null,
  status text not null default 'sending'
    check (status in ('sending', 'sent', 'failed')),
  claim_token uuid not null default gen_random_uuid(),
  lease_expires_at timestamptz,
  attempt_count integer not null default 1
    check (attempt_count > 0),
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupon_mail_deliveries_id_format
    check (coupon_id ~ '^FL-COUPON:[a-f0-9]{64}$'),
  constraint coupon_mail_deliveries_hash_format
    check (payload_hash ~ '^[a-f0-9]{64}$')
);

create index if not exists coupon_mail_deliveries_status_idx
  on public.coupon_mail_deliveries (status, updated_at desc);

alter table public.coupon_mail_deliveries enable row level security;

revoke all on table public.coupon_mail_deliveries from public, anon, authenticated;
grant select, insert, update on table public.coupon_mail_deliveries to service_role;

comment on table public.coupon_mail_deliveries is
  'Server-only durable idempotency ledger for automated coupon email notifications.';
