create or replace function public.ranking_prediction_counts()
returns table (
  user_id uuid,
  prediction_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    count(pr.id)::integer as prediction_count
  from public.profiles p
  left join public.predictions pr on pr.user_id = p.id
  group by p.id;
$$;

grant execute on function public.ranking_prediction_counts() to authenticated;

notify pgrst, 'reload schema';
