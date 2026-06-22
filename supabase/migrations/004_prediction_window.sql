create or replace function public.prediction_day(target_at timestamptz)
returns date
language sql
stable
as $$
  select ((target_at at time zone 'Europe/Madrid') - interval '7 hours')::date;
$$;

create or replace function public.validate_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match public.matches%rowtype;
  current_prediction_day date;
  match_prediction_day date;
begin
  select * into target_match from public.matches where id = new.match_id;
  if target_match.id is null then
    raise exception 'Partido inexistente';
  end if;

  if not public.is_admin() and now() >= target_match.kickoff_at then
    raise exception 'La prediccion esta bloqueada';
  end if;

  current_prediction_day := public.prediction_day(now());
  match_prediction_day := public.prediction_day(target_match.kickoff_at);
  if not public.is_admin() and (match_prediction_day < current_prediction_day or match_prediction_day > current_prediction_day + 1) then
    raise exception 'Solo se pueden guardar predicciones de hoy y manana';
  end if;

  if target_match.home_team_id is null or target_match.away_team_id is null then
    raise exception 'No se puede predecir un partido sin participantes resueltos';
  end if;

  if target_match.stage <> 'GROUP' and new.predicted_home_score = new.predicted_away_score then
    if new.predicted_advancing_team_id is null then
      raise exception 'Un empate en eliminatoria requiere equipo que avanza';
    end if;
    if new.predicted_advancing_team_id <> target_match.home_team_id and new.predicted_advancing_team_id <> target_match.away_team_id then
      raise exception 'El equipo que avanza debe participar en el partido';
    end if;
  end if;

  if target_match.stage = 'GROUP' then
    new.predicted_advancing_team_id = null;
  end if;

  return new;
end;
$$;

notify pgrst, 'reload schema';
