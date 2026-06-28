create or replace function public.admin_save_superquota(
  p_match_id uuid,
  p_market_type public.superquota_market_type,
  p_title text,
  p_default_points integer,
  p_options jsonb,
  p_market_id uuid default null,
  p_subject_team_id text default null,
  p_subject_player_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_market_id uuid;
  target_market public.superquota_markets%rowtype;
  kickoff timestamptz;
  option_count integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  if length(trim(p_title)) = 0 then
    raise exception 'La pregunta no puede estar vacia';
  end if;

  if p_default_points < 0 then
    raise exception 'Los puntos no pueden ser negativos';
  end if;

  if jsonb_typeof(p_options) <> 'array' then
    raise exception 'Las opciones deben ser una lista';
  end if;

  option_count := jsonb_array_length(p_options);
  if option_count < 2 then
    raise exception 'La supercuota necesita al menos dos opciones';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_options) option_data
    where length(trim(option_data->>'label')) = 0
      or (option_data ? 'points' and (option_data->>'points')::integer < 0)
  ) then
    raise exception 'Todas las opciones necesitan texto y puntos validos';
  end if;

  if exists (
    select lower(trim(option_data->>'label'))
    from jsonb_array_elements(p_options) option_data
    group by lower(trim(option_data->>'label'))
    having count(*) > 1
  ) then
    raise exception 'Las opciones no pueden estar repetidas';
  end if;

  select kickoff_at into kickoff
  from public.matches
  where id = p_match_id;

  if kickoff is null then
    raise exception 'Partido inexistente';
  end if;

  if now() >= kickoff then
    raise exception 'No se puede crear o editar una supercuota despues del inicio del partido';
  end if;

  if p_market_id is null then
    insert into public.superquota_markets (
      match_id,
      market_type,
      title,
      default_points,
      subject_team_id,
      subject_player_id,
      created_by
    ) values (
      p_match_id,
      p_market_type,
      trim(p_title),
      p_default_points,
      p_subject_team_id,
      p_subject_player_id,
      auth.uid()
    )
    returning id into saved_market_id;
  else
    select * into target_market
    from public.superquota_markets
    where id = p_market_id
    for update;

    if target_market.id is null then
      raise exception 'Supercuota inexistente';
    end if;

    if target_market.status not in ('DRAFT', 'PUBLISHED') then
      raise exception 'Esta supercuota ya no se puede editar';
    end if;

    if exists (
      select 1
      from public.superquota_predictions
      where market_id = p_market_id
    ) then
      raise exception 'No se puede editar una supercuota que ya tiene respuestas';
    end if;

    update public.superquota_markets
    set
      match_id = p_match_id,
      market_type = p_market_type,
      title = trim(p_title),
      default_points = p_default_points,
      subject_team_id = p_subject_team_id,
      subject_player_id = p_subject_player_id
    where id = p_market_id;

    delete from public.superquota_options
    where market_id = p_market_id;

    saved_market_id := p_market_id;
  end if;

  insert into public.superquota_options (
    market_id,
    label,
    points,
    team_id,
    player_id,
    display_order
  )
  select
    saved_market_id,
    trim(option_data->>'label'),
    case
      when option_data ? 'points' and nullif(option_data->>'points', '') is not null
        then (option_data->>'points')::integer
      else null
    end,
    nullif(option_data->>'team_id', ''),
    case
      when option_data ? 'player_id' and nullif(option_data->>'player_id', '') is not null
        then (option_data->>'player_id')::uuid
      else null
    end,
    option_index - 1
  from jsonb_array_elements(p_options) with ordinality as options(option_data, option_index);

  return saved_market_id;
end;
$$;

create or replace function public.admin_superquota_prediction_counts()
returns table (
  market_id uuid,
  prediction_count integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    sqm.id,
    count(sp.id)::integer
  from public.superquota_markets sqm
  left join public.superquota_predictions sp on sp.market_id = sqm.id
  group by sqm.id;
end;
$$;

revoke execute on function public.admin_save_superquota(
  uuid,
  public.superquota_market_type,
  text,
  integer,
  jsonb,
  uuid,
  text,
  uuid
) from public, anon;

revoke execute on function public.admin_superquota_prediction_counts() from public, anon;

grant execute on function public.admin_save_superquota(
  uuid,
  public.superquota_market_type,
  text,
  integer,
  jsonb,
  uuid,
  text,
  uuid
) to authenticated;

grant execute on function public.admin_superquota_prediction_counts() to authenticated;

notify pgrst, 'reload schema';
