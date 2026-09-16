-- Applied to the Futbol Laboratuvari Supabase project on 2026-09-16.
-- Server-only webhook idempotency storage. Do not grant browser roles access.

create table if not exists public.whatsapp_webhook_events (
  message_id text primary key check (char_length(message_id) between 1 and 255),
  created_at timestamptz not null default now()
);

alter table public.whatsapp_webhook_events enable row level security;

revoke all on table public.whatsapp_webhook_events from anon, authenticated;
grant select, insert, delete on table public.whatsapp_webhook_events to service_role;

create index if not exists whatsapp_webhook_events_created_at_idx
  on public.whatsapp_webhook_events (created_at);
