select cron.schedule(
  'fl-live-analysis-10s',
  '10 seconds',
  $cron$
  select net.http_post(
    url := 'https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-live-match-analysis',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'fl_live_publishable_key'
        limit 1
      )
    ),
    body := jsonb_build_object('source','supabase_cron','requested_at',now()),
    timeout_milliseconds := 8000
  );
  $cron$
);

