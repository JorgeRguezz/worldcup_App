create or replace function public.match_exact_points(target_stage public.match_stage)
returns integer
language sql
immutable
as $$
  select case target_stage
    when 'R32' then 6
    when 'R16' then 9
    when 'QF' then 12
    when 'SF' then 15
    when 'THIRD_PLACE' then 12
    when 'FINAL' then 24
    else 3
  end;
$$;

create or replace function public.match_winner_points(target_stage public.match_stage)
returns integer
language sql
immutable
as $$
  select case target_stage
    when 'R32' then 2
    when 'R16' then 3
    when 'QF' then 4
    when 'SF' then 5
    when 'THIRD_PLACE' then 4
    when 'FINAL' then 8
    else 1
  end;
$$;

alter table public.special_predictions
  drop constraint if exists distinct_special_teams;

alter table public.special_predictions
  drop column if exists runner_up_team_id;

alter table public.special_predictions
  add column if not exists best_player_name text not null default '',
  add column if not exists top_assist_player_name text not null default '',
  add column if not exists champion_points_awarded integer not null default 0,
  add column if not exists best_player_points_awarded integer not null default 0,
  add column if not exists top_scorer_points_awarded integer not null default 0,
  add column if not exists top_assist_points_awarded integer not null default 0;

alter table public.official_awards
  drop column if exists runner_up_team_id;

alter table public.official_awards
  add column if not exists best_player_name text,
  add column if not exists top_assist_player_name text;

create or replace function public.special_prediction_deadline()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select max(kickoff_at) + interval '2 hours' from public.matches where stage = 'GROUP'),
    '2026-06-28 04:00:00+00'::timestamptz
  );
$$;

create or replace function public.validate_special_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and now() >= public.special_prediction_deadline() then
    raise exception 'La prediccion especial esta bloqueada';
  end if;

  if length(trim(new.best_player_name)) = 0 then
    raise exception 'El mejor jugador es obligatorio';
  end if;

  if length(trim(new.top_scorer_player_name)) = 0 then
    raise exception 'El maximo goleador es obligatorio';
  end if;

  if length(trim(new.top_assist_player_name)) = 0 then
    raise exception 'El maximo asistente es obligatorio';
  end if;

  new.points_awarded =
    coalesce(new.champion_points_awarded, 0)
    + coalesce(new.best_player_points_awarded, 0)
    + coalesce(new.top_scorer_points_awarded, 0)
    + coalesce(new.top_assist_points_awarded, 0);
  new.updated_at = now();

  return new;
end;
$$;

drop trigger if exists special_predictions_validate_write on public.special_predictions;
create trigger special_predictions_validate_write
before insert or update on public.special_predictions
for each row execute function public.validate_special_prediction_write();

create or replace function public.validate_special_prediction_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and now() >= public.special_prediction_deadline() then
    raise exception 'La prediccion especial esta bloqueada';
  end if;

  return old;
end;
$$;

drop trigger if exists special_predictions_validate_delete on public.special_predictions;
create trigger special_predictions_validate_delete
before delete on public.special_predictions
for each row execute function public.validate_special_prediction_delete();

create or replace function public.recalculate_special_prediction_points()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  awards public.official_awards%rowtype;
  updated_count integer;
begin
  select * into awards from public.official_awards where id = true;

  update public.special_predictions sp
  set
    champion_points_awarded = case when awards.champion_team_id is not null and sp.champion_team_id = awards.champion_team_id then 30 else 0 end,
    best_player_points_awarded = case when awards.best_player_name is not null and lower(trim(sp.best_player_name)) = lower(trim(awards.best_player_name)) then 20 else 0 end,
    top_scorer_points_awarded = case when awards.top_scorer_player_name is not null and lower(trim(sp.top_scorer_player_name)) = lower(trim(awards.top_scorer_player_name)) then 12 else 0 end,
    top_assist_points_awarded = case when awards.top_assist_player_name is not null and lower(trim(sp.top_assist_player_name)) = lower(trim(awards.top_assist_player_name)) then 12 else 0 end,
    updated_at = now();

  get diagnostics updated_count = row_count;

  update public.special_predictions
  set points_awarded = champion_points_awarded + best_player_points_awarded + top_scorer_points_awarded + top_assist_points_awarded;

  return updated_count;
end;
$$;

create or replace function public.admin_set_official_awards(
  p_champion_team_id text,
  p_best_player_name text,
  p_top_scorer_player_name text,
  p_top_assist_player_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cargar premios oficiales';
  end if;

  if p_champion_team_id is not null and not exists (select 1 from public.teams where id = p_champion_team_id) then
    raise exception 'Equipo campeon inexistente';
  end if;

  insert into public.official_awards (
    id,
    champion_team_id,
    best_player_name,
    top_scorer_player_name,
    top_assist_player_name,
    updated_at
  )
  values (
    true,
    p_champion_team_id,
    nullif(trim(coalesce(p_best_player_name, '')), ''),
    nullif(trim(coalesce(p_top_scorer_player_name, '')), ''),
    nullif(trim(coalesce(p_top_assist_player_name, '')), ''),
    now()
  )
  on conflict (id) do update
  set
    champion_team_id = excluded.champion_team_id,
    best_player_name = excluded.best_player_name,
    top_scorer_player_name = excluded.top_scorer_player_name,
    top_assist_player_name = excluded.top_assist_player_name,
    updated_at = excluded.updated_at;

  updated_count := public.recalculate_special_prediction_points();

  insert into public.admin_audit_log (admin_user_id, action, payload)
  values (
    auth.uid(),
    'AWARDS_UPSERT',
    jsonb_build_object(
      'champion_team_id', p_champion_team_id,
      'best_player_name', nullif(trim(coalesce(p_best_player_name, '')), ''),
      'top_scorer_player_name', nullif(trim(coalesce(p_top_scorer_player_name, '')), ''),
      'top_assist_player_name', nullif(trim(coalesce(p_top_assist_player_name, '')), ''),
      'updated_special_predictions', updated_count
    )
  );
end;
$$;

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
  where now() >= public.special_prediction_deadline() or public.is_admin()
  order by p.display_name asc;
$$;

grant execute on function public.special_prediction_deadline() to authenticated;
grant execute on function public.admin_set_official_awards(text, text, text, text) to authenticated;
grant execute on function public.visible_special_predictions() to authenticated;

notify pgrst, 'reload schema';
