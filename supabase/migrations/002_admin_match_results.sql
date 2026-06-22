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
    when 'THIRD_PLACE' then 15
    when 'FINAL' then 30
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
    when 'THIRD_PLACE' then 5
    when 'FINAL' then 10
    else 1
  end;
$$;

create or replace function public.admin_set_match_result(
  p_match_id uuid,
  p_home_score integer,
  p_away_score integer,
  p_decided_by public.decided_by default 'NORMAL_TIME',
  p_winner_team_id text default null,
  p_penalties_home integer default null,
  p_penalties_away integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match public.matches%rowtype;
  resolved_winner text;
  resolved_decided_by public.decided_by;
  prediction_count integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cargar resultados';
  end if;

  if p_home_score is null or p_away_score is null or p_home_score < 0 or p_away_score < 0 then
    raise exception 'El marcador debe tener goles no negativos';
  end if;

  select * into target_match
  from public.matches
  where id = p_match_id
  for update;

  if target_match.id is null then
    raise exception 'Partido inexistente';
  end if;

  if target_match.home_team_id is null or target_match.away_team_id is null then
    raise exception 'No se puede cargar resultado sin participantes resueltos';
  end if;

  if target_match.stage = 'GROUP' then
    resolved_winner := case
      when p_home_score > p_away_score then target_match.home_team_id
      when p_away_score > p_home_score then target_match.away_team_id
      else null
    end;
    resolved_decided_by := 'NORMAL_TIME';
  else
    if p_home_score = p_away_score then
      if p_winner_team_id is null then
        raise exception 'Una eliminatoria empatada requiere equipo ganador por penaltis';
      end if;

      if p_winner_team_id <> target_match.home_team_id and p_winner_team_id <> target_match.away_team_id then
        raise exception 'El ganador debe ser uno de los dos participantes';
      end if;

      resolved_winner := p_winner_team_id;
      resolved_decided_by := 'PENALTIES';
    else
      resolved_winner := case
        when p_home_score > p_away_score then target_match.home_team_id
        else target_match.away_team_id
      end;
      resolved_decided_by := coalesce(nullif(p_decided_by, 'PENALTIES'), 'NORMAL_TIME');
    end if;
  end if;

  update public.matches
  set
    status = 'FINAL',
    home_score = p_home_score,
    away_score = p_away_score,
    penalties_home = case when resolved_decided_by = 'PENALTIES' then p_penalties_home else null end,
    penalties_away = case when resolved_decided_by = 'PENALTIES' then p_penalties_away else null end,
    winner_team_id = resolved_winner,
    decided_by = resolved_decided_by,
    result_updated_at = now()
  where id = p_match_id;

  update public.predictions pr
  set points_awarded = case
    when target_match.stage = 'GROUP' then
      case
        when pr.predicted_home_score = p_home_score and pr.predicted_away_score = p_away_score then 3
        when
          (pr.predicted_home_score > pr.predicted_away_score and p_home_score > p_away_score)
          or (pr.predicted_home_score < pr.predicted_away_score and p_home_score < p_away_score)
          or (pr.predicted_home_score = pr.predicted_away_score and p_home_score = p_away_score)
        then 1
        else 0
      end
    else
      case
        when pr.predicted_home_score = p_home_score and pr.predicted_away_score = p_away_score then public.match_exact_points(target_match.stage)
        when (
          case
            when pr.predicted_home_score > pr.predicted_away_score then target_match.home_team_id
            when pr.predicted_away_score > pr.predicted_home_score then target_match.away_team_id
            else pr.predicted_advancing_team_id
          end
        ) = resolved_winner then public.match_winner_points(target_match.stage)
        else 0
      end
    end
  where pr.match_id = p_match_id;

  get diagnostics prediction_count = row_count;

  insert into public.admin_audit_log (admin_user_id, action, match_id, payload)
  values (
    auth.uid(),
    'RESULT_UPSERT',
    p_match_id,
    jsonb_build_object(
      'home_score', p_home_score,
      'away_score', p_away_score,
      'winner_team_id', resolved_winner,
      'decided_by', resolved_decided_by,
      'updated_predictions', prediction_count
    )
  );
end;
$$;

grant execute on function public.admin_set_match_result(uuid, integer, integer, public.decided_by, text, integer, integer) to authenticated;

notify pgrst, 'reload schema';
