create table public.prediction_email_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  reminder_kind text not null default 'missing_prediction_2h',
  status text not null default 'claimed' check (status in ('claimed', 'sent', 'failed')),
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, match_id, reminder_kind)
);

alter table public.prediction_email_reminders enable row level security;

create or replace function public.claim_missing_prediction_email_reminders(
  p_limit integer default 50,
  p_daily_cap integer default 400
)
returns table (
  reminder_id uuid,
  user_id uuid,
  user_email text,
  display_name text,
  match_id uuid,
  kickoff_at timestamptz,
  home_team text,
  away_team text
)
language sql
security definer
set search_path = public, auth
as $$
  with remaining_cap as (
    select greatest(
      0,
      p_daily_cap - count(*) filter (
        where status = 'sent'
          and sent_at >= now() - interval '24 hours'
      )
    )::integer as value
    from public.prediction_email_reminders
  ),
  candidates as (
    select
      p.id as user_id,
      u.email as user_email,
      p.display_name,
      m.id as match_id,
      m.kickoff_at,
      home_team.name as home_team,
      away_team.name as away_team
    from public.matches m
    join public.teams home_team on home_team.id = m.home_team_id
    join public.teams away_team on away_team.id = m.away_team_id
    cross join public.profiles p
    join auth.users u on u.id = p.id
    left join public.predictions pr
      on pr.user_id = p.id
     and pr.match_id = m.id
    where m.status = 'SCHEDULED'
      and m.kickoff_at > now()
      and m.kickoff_at <= now() + interval '2 hours'
      and pr.id is null
      and u.email is not null
    order by m.kickoff_at asc, p.created_at asc
    limit least(p_limit, (select value from remaining_cap))
  ),
  inserted as (
    insert into public.prediction_email_reminders (user_id, match_id)
    select user_id, match_id
    from candidates
    on conflict (user_id, match_id, reminder_kind) do nothing
    returning id, user_id, match_id
  )
  select
    i.id as reminder_id,
    c.user_id,
    c.user_email,
    c.display_name,
    c.match_id,
    c.kickoff_at,
    c.home_team,
    c.away_team
  from inserted i
  join candidates c
    on c.user_id = i.user_id
   and c.match_id = i.match_id;
$$;

revoke all on function public.claim_missing_prediction_email_reminders(integer, integer) from public;
grant execute on function public.claim_missing_prediction_email_reminders(integer, integer) to service_role;

notify pgrst, 'reload schema';
