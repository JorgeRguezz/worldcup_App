create or replace function public.save_superquota_prediction(
  p_market_id uuid,
  p_option_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_market public.superquota_markets%rowtype;
  kickoff timestamptz;
  saved_prediction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Necesitas iniciar sesion';
  end if;

  select * into target_market
  from public.superquota_markets
  where id = p_market_id
  for share;

  if target_market.id is null then
    raise exception 'Supercuota inexistente';
  end if;

  select kickoff_at into kickoff
  from public.matches
  where id = target_market.match_id;

  if target_market.status <> 'PUBLISHED' then
    raise exception 'La supercuota no esta abierta';
  end if;

  if now() >= kickoff then
    raise exception 'La supercuota esta bloqueada';
  end if;

  if not exists (
    select 1
    from public.superquota_options
    where id = p_option_id and market_id = p_market_id
  ) then
    raise exception 'La opcion no pertenece a esta supercuota';
  end if;

  insert into public.superquota_predictions (
    user_id,
    market_id,
    option_id
  ) values (
    auth.uid(),
    p_market_id,
    p_option_id
  )
  on conflict (user_id, market_id)
  do update set option_id = excluded.option_id
  returning id into saved_prediction_id;

  return saved_prediction_id;
end;
$$;

revoke insert, update, delete on table public.superquota_predictions from authenticated;

revoke execute on function public.save_superquota_prediction(uuid, uuid) from public, anon;
grant execute on function public.save_superquota_prediction(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
