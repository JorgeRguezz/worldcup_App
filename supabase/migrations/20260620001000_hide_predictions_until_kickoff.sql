create or replace function public.visible_match_predictions()
returns table (
  match_id uuid,
  user_id uuid,
  display_name text,
  predicted_home_score integer,
  predicted_away_score integer,
  points_awarded integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pr.match_id,
    pr.user_id,
    p.display_name,
    pr.predicted_home_score,
    pr.predicted_away_score,
    pr.points_awarded
  from public.predictions pr
  join public.profiles p on p.id = pr.user_id
  join public.matches m on m.id = pr.match_id
  where m.kickoff_at <= now()
  order by p.display_name asc;
$$;

grant execute on function public.visible_match_predictions() to authenticated;

notify pgrst, 'reload schema';
