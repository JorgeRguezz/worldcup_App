create or replace function public.visible_special_predictions()
returns table (
  user_id uuid,
  display_name text,
  champion_team_id text,
  best_player_name text,
  top_scorer_player_name text,
  top_assist_player_name text,
  champion_points_awarded integer,
  best_player_points_awarded integer,
  top_scorer_points_awarded integer,
  top_assist_points_awarded integer,
  points_awarded integer,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sp.user_id,
    p.display_name,
    sp.champion_team_id,
    sp.best_player_name,
    sp.top_scorer_player_name,
    sp.top_assist_player_name,
    sp.champion_points_awarded,
    sp.best_player_points_awarded,
    sp.top_scorer_points_awarded,
    sp.top_assist_points_awarded,
    sp.points_awarded,
    sp.updated_at
  from public.special_predictions sp
  join public.profiles p on p.id = sp.user_id
  where now() >= public.special_prediction_deadline()
  order by p.display_name asc;
$$;

grant execute on function public.visible_special_predictions() to authenticated;

notify pgrst, 'reload schema';
