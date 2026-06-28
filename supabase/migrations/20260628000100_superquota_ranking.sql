drop view if exists public.ranking;

create view public.ranking as
with match_scores as (
  select
    user_id,
    coalesce(sum(points_awarded) filter (where not is_void), 0)::integer as points
  from public.predictions
  group by user_id
),
superquota_scores as (
  select
    user_id,
    coalesce(sum(points_awarded) filter (where not is_void), 0)::integer as points
  from public.superquota_predictions
  group by user_id
)
select
  p.id as user_id,
  p.display_name,
  coalesce(ms.points, 0)::integer as match_points,
  coalesce(sp.points_awarded, 0)::integer as special_points,
  coalesce(sqs.points, 0)::integer as superquota_points,
  (
    coalesce(ms.points, 0)
    + coalesce(sp.points_awarded, 0)
    + coalesce(sqs.points, 0)
  )::integer as total_points
from public.profiles p
left join match_scores ms on ms.user_id = p.id
left join public.special_predictions sp on sp.user_id = p.id
left join superquota_scores sqs on sqs.user_id = p.id;

grant select on public.ranking to authenticated;

create or replace function public.ranking_daily_delta(
  p_day date default (((now() at time zone 'Europe/Madrid') - interval '7 hours')::date - 1)
)
returns table (
  user_id uuid,
  display_name text,
  current_position integer,
  previous_position integer,
  position_delta integer,
  points_on_day integer,
  current_total_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  with match_scores as (
    select
      pr.user_id,
      coalesce(sum(pr.points_awarded) filter (where not pr.is_void), 0)::integer as points
    from public.predictions pr
    group by pr.user_id
  ),
  superquota_scores as (
    select
      sp.user_id,
      coalesce(sum(sp.points_awarded) filter (where not sp.is_void), 0)::integer as points
    from public.superquota_predictions sp
    group by sp.user_id
  ),
  scored_on_day as (
    select
      pr.user_id,
      pr.points_awarded
    from public.predictions pr
    join public.matches m on m.id = pr.match_id
    where
      m.status = 'FINAL'
      and not pr.is_void
      and ((m.kickoff_at at time zone 'Europe/Madrid') - interval '7 hours')::date = p_day

    union all

    select
      sp.user_id,
      sp.points_awarded
    from public.superquota_predictions sp
    join public.superquota_markets sqm on sqm.id = sp.market_id
    join public.matches m on m.id = sqm.match_id
    where
      sqm.status = 'RESOLVED'
      and not sp.is_void
      and ((m.kickoff_at at time zone 'Europe/Madrid') - interval '7 hours')::date = p_day
  ),
  day_points as (
    select
      user_id,
      coalesce(sum(points_awarded), 0)::integer as points
    from scored_on_day
    group by user_id
  ),
  scores as (
    select
      p.id as user_id,
      p.display_name,
      coalesce(ms.points, 0)::integer as match_points,
      coalesce(sp.points_awarded, 0)::integer as special_points,
      coalesce(sqs.points, 0)::integer as superquota_points,
      coalesce(dp.points, 0)::integer as points_on_day
    from public.profiles p
    left join match_scores ms on ms.user_id = p.id
    left join public.special_predictions sp on sp.user_id = p.id
    left join superquota_scores sqs on sqs.user_id = p.id
    left join day_points dp on dp.user_id = p.id
  ),
  totals as (
    select
      *,
      (match_points + special_points + superquota_points)::integer as current_total_points,
      (match_points + special_points + superquota_points - points_on_day)::integer as previous_total_points
    from scores
  ),
  current_ranked as (
    select
      *,
      rank() over (order by current_total_points desc) as current_position
    from totals
  ),
  previous_ranked as (
    select
      user_id,
      rank() over (order by previous_total_points desc) as previous_position
    from totals
  )
  select
    c.user_id,
    c.display_name,
    c.current_position::integer,
    prev.previous_position::integer,
    (prev.previous_position - c.current_position)::integer as position_delta,
    c.points_on_day,
    c.current_total_points
  from current_ranked c
  join previous_ranked prev on prev.user_id = c.user_id
  order by c.current_position asc, c.display_name asc;
$$;

revoke execute on function public.ranking_daily_delta(date) from public, anon;
grant execute on function public.ranking_daily_delta(date) to authenticated;

create or replace function public.user_superquota_points_on_day(
  p_day date default public.prediction_day(now())
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(sp.points_awarded) filter (where not sp.is_void), 0)::integer
  from public.superquota_predictions sp
  join public.superquota_markets sqm on sqm.id = sp.market_id
  join public.matches m on m.id = sqm.match_id
  where
    sp.user_id = auth.uid()
    and sqm.status = 'RESOLVED'
    and public.prediction_day(m.kickoff_at) = p_day;
$$;

revoke execute on function public.user_superquota_points_on_day(date) from public, anon;
grant execute on function public.user_superquota_points_on_day(date) to authenticated;

notify pgrst, 'reload schema';
