create or replace function public.ranking_daily_delta(p_day date default (((now() at time zone 'Europe/Madrid') - interval '7 hours')::date - 1))
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
  with day_points as (
    select
      pr.user_id,
      coalesce(sum(pr.points_awarded), 0)::integer as points_on_day
    from public.predictions pr
    join public.matches m on m.id = pr.match_id
    where
      m.status = 'FINAL'
      and ((m.kickoff_at at time zone 'Europe/Madrid') - interval '7 hours')::date = p_day
    group by pr.user_id
  ),
  scores as (
    select
      p.id as user_id,
      p.display_name,
      coalesce(sum(pr.points_awarded) filter (where pr.id is not null), 0)::integer as match_points,
      coalesce(sp.points_awarded, 0)::integer as special_points,
      coalesce(dp.points_on_day, 0)::integer as points_on_day
    from public.profiles p
    left join public.predictions pr on pr.user_id = p.id
    left join public.special_predictions sp on sp.user_id = p.id
    left join day_points dp on dp.user_id = p.id
    group by p.id, p.display_name, sp.points_awarded, dp.points_on_day
  ),
  totals as (
    select
      *,
      (match_points + special_points)::integer as current_total_points,
      (match_points + special_points - points_on_day)::integer as previous_total_points
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
    p.previous_position::integer,
    (p.previous_position - c.current_position)::integer as position_delta,
    c.points_on_day,
    c.current_total_points
  from current_ranked c
  join previous_ranked p on p.user_id = c.user_id
  order by c.current_position asc, c.display_name asc;
$$;

grant execute on function public.ranking_daily_delta(date) to authenticated;

notify pgrst, 'reload schema';
