create or replace function public.refresh_group_team_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede recalcular la clasificacion';
  end if;

  delete from public.group_team_stats
  where team_id is not null;

  insert into public.group_team_stats (
    team_id,
    group_letter,
    played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    points,
    team_conduct_score,
    rank,
    updated_at
  )
  with stats as (
    select
      t.id as team_id,
      t.group_letter,
      t.team_conduct_score,
      t.fifa_ranking_order,
      count(m.id)::integer as played,
      coalesce(sum(
        case
          when m.home_team_id = t.id and m.home_score > m.away_score then 1
          when m.away_team_id = t.id and m.away_score > m.home_score then 1
          else 0
        end
      ), 0)::integer as wins,
      coalesce(sum(case when m.home_score = m.away_score then 1 else 0 end), 0)::integer as draws,
      coalesce(sum(
        case
          when m.home_team_id = t.id and m.home_score < m.away_score then 1
          when m.away_team_id = t.id and m.away_score < m.home_score then 1
          else 0
        end
      ), 0)::integer as losses,
      coalesce(sum(
        case
          when m.home_team_id = t.id then m.home_score
          when m.away_team_id = t.id then m.away_score
          else 0
        end
      ), 0)::integer as goals_for,
      coalesce(sum(
        case
          when m.home_team_id = t.id then m.away_score
          when m.away_team_id = t.id then m.home_score
          else 0
        end
      ), 0)::integer as goals_against,
      coalesce(sum(
        case
          when m.home_team_id = t.id then m.home_score - m.away_score
          when m.away_team_id = t.id then m.away_score - m.home_score
          else 0
        end
      ), 0)::integer as goal_difference,
      coalesce(sum(
        case
          when m.home_team_id = t.id and m.home_score > m.away_score then 3
          when m.away_team_id = t.id and m.away_score > m.home_score then 3
          when m.home_score = m.away_score then 1
          else 0
        end
      ), 0)::integer as points
    from public.teams t
    left join public.matches m
      on m.stage = 'GROUP'
      and m.status = 'FINAL'
      and (m.home_team_id = t.id or m.away_team_id = t.id)
    group by t.id, t.group_letter, t.team_conduct_score, t.fifa_ranking_order
  ),
  ranked as (
    select
      stats.*,
      row_number() over (
        partition by group_letter
        order by points desc, goal_difference desc, goals_for desc, team_conduct_score desc, fifa_ranking_order asc
      )::integer as rank
    from stats
  )
  select
    team_id,
    group_letter,
    played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    points,
    team_conduct_score,
    rank,
    now()
  from ranked;
end;
$$;

grant execute on function public.refresh_group_team_stats() to authenticated;

notify pgrst, 'reload schema';
