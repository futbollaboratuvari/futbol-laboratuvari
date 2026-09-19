create table if not exists public.live_learning_observations (
  id uuid primary key default gen_random_uuid(),
  observation_key text not null unique,
  fixture_id text not null,
  match_date date,
  league text not null default '',
  home text not null default '',
  away text not null default '',
  observed_at timestamptz not null,
  observed_minute integer not null check (observed_minute between 0 and 130),
  minute_bucket integer not null check (minute_bucket between 0 and 130),
  score_home integer not null check (score_home >= 0),
  score_away integer not null check (score_away >= 0),
  prediction_type text not null check (prediction_type in ('match_direction', 'next_goal')),
  predicted_code text not null,
  signal_strength numeric(8,3) not null default 0,
  evidence_score numeric(8,3) not null default 0,
  diagnostics jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'void')),
  resolution_code text,
  resolved_at timestamptz,
  resolved_score_home integer,
  resolved_score_away integer,
  model_version text not null default '',
  learning_version text not null default 'live-learning-memory-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.live_learning_observations is
  'Server-only durable measurement ledger for live football robot predictions. No public access.';

alter table public.live_learning_observations enable row level security;

revoke all on table public.live_learning_observations from anon, authenticated;
grant select, insert, update, delete on table public.live_learning_observations to service_role;

create index if not exists live_learning_pending_idx
  on public.live_learning_observations (fixture_id, prediction_type, status);

create index if not exists live_learning_settled_idx
  on public.live_learning_observations (prediction_type, status, observed_at desc);

create table if not exists public.live_learning_profiles (
  prediction_type text primary key check (prediction_type in ('match_direction', 'next_goal')),
  settled_count integer not null default 0,
  won_count integer not null default 0,
  lost_count integer not null default 0,
  void_count integer not null default 0,
  distinct_match_count integer not null default 0,
  distinct_date_count integer not null default 0,
  success_rate numeric(8,5),
  wilson_low numeric(8,5),
  wilson_high numeric(8,5),
  learning_state text not null default 'collecting'
    check (learning_state in ('collecting', 'neutral', 'boost', 'brake')),
  threshold_adjustment integer not null default 0 check (threshold_adjustment between -2 and 4),
  updated_at timestamptz not null default now()
);

comment on table public.live_learning_profiles is
  'Server-only bounded live robot calibration profile derived from settled observations.';

alter table public.live_learning_profiles enable row level security;

revoke all on table public.live_learning_profiles from anon, authenticated;
grant select, insert, update, delete on table public.live_learning_profiles to service_role;

insert into public.live_learning_profiles (prediction_type)
values ('match_direction'), ('next_goal')
on conflict (prediction_type) do nothing;

create or replace function public.refresh_live_learning_profiles()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  with stats as (
    select
      prediction_type,
      count(*) filter (where status in ('won', 'lost'))::integer as settled_count,
      count(*) filter (where status = 'won')::integer as won_count,
      count(*) filter (where status = 'lost')::integer as lost_count,
      count(*) filter (where status = 'void')::integer as void_count,
      count(distinct fixture_id) filter (where status in ('won', 'lost'))::integer as distinct_match_count,
      count(distinct (observed_at at time zone 'Europe/Istanbul')::date)
        filter (where status in ('won', 'lost'))::integer as distinct_date_count
    from public.live_learning_observations
    group by prediction_type
  ),
  rates as (
    select
      *,
      case when settled_count > 0 then won_count::numeric / settled_count else null end as success_rate
    from stats
  ),
  intervals as (
    select
      *,
      case when settled_count > 0 then
        greatest(0::numeric,
          (
            success_rate + (1.645 * 1.645) / (2 * settled_count)
            - 1.645 * sqrt(
              (
                success_rate * (1 - success_rate)
                + (1.645 * 1.645) / (4 * settled_count)
              ) / settled_count
            )
          ) / (1 + (1.645 * 1.645) / settled_count)
        )
      else 0 end as wilson_low,
      case when settled_count > 0 then
        least(1::numeric,
          (
            success_rate + (1.645 * 1.645) / (2 * settled_count)
            + 1.645 * sqrt(
              (
                success_rate * (1 - success_rate)
                + (1.645 * 1.645) / (4 * settled_count)
              ) / settled_count
            )
          ) / (1 + (1.645 * 1.645) / settled_count)
        )
      else 1 end as wilson_high
    from rates
  ),
  evaluated as (
    select
      *,
      case
        when settled_count < 40 or distinct_match_count < 20 or distinct_date_count < 7
          then 'collecting'
        when wilson_low >= 0.60 and success_rate >= 0.62
          then 'boost'
        when wilson_high <= 0.48 or (settled_count >= 80 and success_rate < 0.45)
          then 'brake'
        else 'neutral'
      end as learning_state
    from intervals
  )
  insert into public.live_learning_profiles (
    prediction_type,
    settled_count,
    won_count,
    lost_count,
    void_count,
    distinct_match_count,
    distinct_date_count,
    success_rate,
    wilson_low,
    wilson_high,
    learning_state,
    threshold_adjustment,
    updated_at
  )
  select
    prediction_type,
    settled_count,
    won_count,
    lost_count,
    void_count,
    distinct_match_count,
    distinct_date_count,
    round(success_rate, 5),
    round(wilson_low, 5),
    round(wilson_high, 5),
    learning_state,
    case learning_state
      when 'boost' then -1
      when 'brake' then 2
      else 0
    end,
    now()
  from evaluated
  on conflict (prediction_type) do update set
    settled_count = excluded.settled_count,
    won_count = excluded.won_count,
    lost_count = excluded.lost_count,
    void_count = excluded.void_count,
    distinct_match_count = excluded.distinct_match_count,
    distinct_date_count = excluded.distinct_date_count,
    success_rate = excluded.success_rate,
    wilson_low = excluded.wilson_low,
    wilson_high = excluded.wilson_high,
    learning_state = excluded.learning_state,
    threshold_adjustment = excluded.threshold_adjustment,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.refresh_live_learning_profiles() from public, anon, authenticated;
grant execute on function public.refresh_live_learning_profiles() to service_role;
