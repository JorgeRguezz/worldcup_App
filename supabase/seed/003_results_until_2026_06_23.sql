-- Resultados finalizados hasta el 23 de junio de 2026, 12:05 CEST.
-- Pegar completo en el SQL Editor de Supabase.
-- Carga marcadores, recalcula puntos de predicciones y reconstruye la clasificacion de grupos.

begin;

create temp table tmp_group_results (
  fifa_match_number integer primary key,
  home_score integer not null,
  away_score integer not null
) on commit drop;

insert into tmp_group_results (fifa_match_number, home_score, away_score)
values
  (1, 2, 0),
  (2, 2, 1),
  (3, 1, 1),
  (4, 4, 1),
  (5, 1, 1),
  (6, 1, 1),
  (7, 0, 1),
  (8, 2, 0),
  (9, 7, 1),
  (10, 1, 0),
  (11, 2, 2),
  (12, 5, 1),
  (13, 1, 1),
  (14, 2, 2),
  (15, 0, 0),
  (16, 1, 1),
  (17, 3, 1),
  (18, 1, 4),
  (19, 3, 0),
  (20, 3, 1),
  (21, 1, 1),
  (22, 1, 3),
  (23, 4, 2),
  (24, 1, 0),
  (25, 1, 1),
  (26, 1, 0),
  (27, 4, 1),
  (28, 6, 0),
  (29, 0, 1),
  (30, 3, 0),
  (31, 2, 0),
  (32, 0, 1),
  (33, 2, 1),
  (34, 0, 0),
  (35, 5, 1),
  (36, 0, 4),
  (37, 0, 0),
  (38, 1, 3),
  (39, 4, 0),
  (40, 2, 2),
  (41, 3, 0),
  (42, 3, 2),
  (43, 2, 0),
  (44, 1, 2);

update public.matches m
set
  status = 'FINAL',
  home_score = r.home_score,
  away_score = r.away_score,
  penalties_home = null,
  penalties_away = null,
  winner_team_id = case
    when r.home_score > r.away_score then m.home_team_id
    when r.away_score > r.home_score then m.away_team_id
    else null
  end,
  decided_by = 'NORMAL_TIME',
  result_updated_at = now()
from tmp_group_results r
where m.fifa_match_number = r.fifa_match_number
  and m.stage = 'GROUP';

alter table public.predictions disable trigger predictions_validate_write;

update public.predictions pr
set
  points_awarded = case
    when pr.predicted_home_score = m.home_score and pr.predicted_away_score = m.away_score then 3
    when
      (pr.predicted_home_score > pr.predicted_away_score and m.home_score > m.away_score)
      or (pr.predicted_home_score < pr.predicted_away_score and m.home_score < m.away_score)
      or (pr.predicted_home_score = pr.predicted_away_score and m.home_score = m.away_score)
    then 1
    else 0
  end
from public.matches m
join tmp_group_results r on r.fifa_match_number = m.fifa_match_number
where pr.match_id = m.id;

alter table public.predictions enable trigger predictions_validate_write;

delete from public.group_team_stats;

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
    coalesce(sum(
      case when m.home_score = m.away_score then 1 else 0 end
    ), 0)::integer as draws,
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

notify pgrst, 'reload schema';

commit;

select
  (select count(*) from public.matches where stage = 'GROUP' and status = 'FINAL') as partidos_grupo_finalizados,
  (select count(*) from public.group_team_stats) as filas_clasificacion,
  (select coalesce(sum(points_awarded), 0) from public.predictions) as puntos_predicciones;
