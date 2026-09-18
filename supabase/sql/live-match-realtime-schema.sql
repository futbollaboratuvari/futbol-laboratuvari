create table if not exists public.live_match_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  broadcast_delta jsonb not null default '{}'::jsonb,
  source_generated_at timestamptz,
  collector_version text,
  next_collect_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint live_match_state_singleton check (id = 'current')
);

comment on table public.live_match_state is
  'Public read-only current state for Supabase realtime live football analysis. Writes are backend-only.';

alter table public.live_match_state enable row level security;

revoke all on table public.live_match_state from anon, authenticated;
grant select on table public.live_match_state to anon, authenticated;

drop policy if exists "public read live match state" on public.live_match_state;
create policy "public read live match state"
on public.live_match_state
for select
to anon, authenticated
using (id = 'current');

insert into public.live_match_state (
  id, payload, broadcast_delta, collector_version, next_collect_at, updated_at
)
values (
  'current',
  '{"schema_version":2,"status":"initializing","summary":{"sampled_match_count":0,"robot_ready_count":0},"matches":[]}'::jsonb,
  '{}'::jsonb,
  'fl-live-match-analysis-v1',
  now(),
  now()
)
on conflict (id) do nothing;

create or replace function public.claim_live_collect_slot(p_seconds integer default 7)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed boolean := false;
  bounded_seconds integer := greatest(5, least(coalesce(p_seconds, 7), 60));
begin
  update public.live_match_state
     set next_collect_at = now() + make_interval(secs => bounded_seconds)
   where id = 'current'
     and (next_collect_at is null or next_collect_at <= now())
  returning true into claimed;
  return coalesce(claimed, false);
end;
$$;

revoke all on function public.claim_live_collect_slot(integer) from public, anon, authenticated;
grant execute on function public.claim_live_collect_slot(integer) to service_role;

create schema if not exists private;

create or replace function private.broadcast_live_match_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.broadcast_delta is distinct from old.broadcast_delta then
    perform realtime.send(
      new.broadcast_delta,
      'snapshot',
      'live-match-analysis',
      false
    );
  end if;
  return new;
end;
$$;

revoke all on function private.broadcast_live_match_state() from public, anon, authenticated;

drop trigger if exists live_match_state_broadcast on public.live_match_state;
create trigger live_match_state_broadcast
after update of broadcast_delta on public.live_match_state
for each row
execute function private.broadcast_live_match_state();

