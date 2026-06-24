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

create or replace function public.is_group_complete(p_group_letter text)
returns boolean
language sql
stable
set search_path = public
as $$
  select count(*) = 6
  from public.matches
  where stage = 'GROUP'
    and group_letter = p_group_letter
    and status = 'FINAL';
$$;

create or replace function public.group_position_team_id(p_group_letter text, p_rank integer)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when public.is_group_complete(p_group_letter) then (
      select team_id
      from public.group_team_stats
      where group_letter = p_group_letter
        and rank = p_rank
      limit 1
    )
    else null
  end;
$$;

create or replace function public.set_match_side_team(
  p_fifa_match_number integer,
  p_side public.slot_side,
  p_team_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
  set
    home_team_id = case when p_side = 'HOME' then p_team_id else home_team_id end,
    away_team_id = case when p_side = 'AWAY' then p_team_id else away_team_id end
  where fifa_match_number = p_fifa_match_number
    and status <> 'FINAL';
end;
$$;

create or replace function public.loser_team_id(p_match public.matches)
returns text
language sql
stable
as $$
  select case
    when p_match.home_team_id is null or p_match.away_team_id is null or p_match.winner_team_id is null then null
    when p_match.winner_team_id = p_match.home_team_id then p_match.away_team_id
    else p_match.home_team_id
  end;
$$;

create or replace function public.refresh_bracket_from_results()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  all_groups_complete boolean;
  third_key text;
  third_row public.third_place_combinations%rowtype;
  source_match public.matches%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede recalcular el cuadro';
  end if;

  perform public.refresh_group_team_stats();

  perform public.set_match_side_team(73, 'HOME', public.group_position_team_id('A', 2));
  perform public.set_match_side_team(73, 'AWAY', public.group_position_team_id('B', 2));
  perform public.set_match_side_team(74, 'HOME', public.group_position_team_id('E', 1));
  perform public.set_match_side_team(75, 'HOME', public.group_position_team_id('F', 1));
  perform public.set_match_side_team(75, 'AWAY', public.group_position_team_id('C', 2));
  perform public.set_match_side_team(76, 'HOME', public.group_position_team_id('C', 1));
  perform public.set_match_side_team(76, 'AWAY', public.group_position_team_id('F', 2));
  perform public.set_match_side_team(77, 'HOME', public.group_position_team_id('I', 1));
  perform public.set_match_side_team(78, 'HOME', public.group_position_team_id('E', 2));
  perform public.set_match_side_team(78, 'AWAY', public.group_position_team_id('I', 2));
  perform public.set_match_side_team(79, 'HOME', public.group_position_team_id('A', 1));
  perform public.set_match_side_team(80, 'HOME', public.group_position_team_id('L', 1));
  perform public.set_match_side_team(81, 'HOME', public.group_position_team_id('D', 1));
  perform public.set_match_side_team(82, 'HOME', public.group_position_team_id('G', 1));
  perform public.set_match_side_team(83, 'HOME', public.group_position_team_id('K', 2));
  perform public.set_match_side_team(83, 'AWAY', public.group_position_team_id('L', 2));
  perform public.set_match_side_team(84, 'HOME', public.group_position_team_id('H', 1));
  perform public.set_match_side_team(84, 'AWAY', public.group_position_team_id('J', 2));
  perform public.set_match_side_team(85, 'HOME', public.group_position_team_id('B', 1));
  perform public.set_match_side_team(86, 'HOME', public.group_position_team_id('J', 1));
  perform public.set_match_side_team(86, 'AWAY', public.group_position_team_id('H', 2));
  perform public.set_match_side_team(87, 'HOME', public.group_position_team_id('K', 1));
  perform public.set_match_side_team(88, 'HOME', public.group_position_team_id('D', 2));
  perform public.set_match_side_team(88, 'AWAY', public.group_position_team_id('G', 2));

  select bool_and(public.is_group_complete(group_letter))
  into all_groups_complete
  from unnest(array['A','B','C','D','E','F','G','H','I','J','K','L']) as groups(group_letter);

  if all_groups_complete then
    select string_agg(group_letter, '' order by group_letter)
    into third_key
    from (
      select gts.group_letter
      from public.group_team_stats gts
      where gts.rank = 3
      order by gts.points desc, gts.goal_difference desc, gts.goals_for desc, gts.team_conduct_score desc, (
        select t.fifa_ranking_order from public.teams t where t.id = gts.team_id
      ) asc
      limit 8
    ) qualified_thirds;

    select *
    into third_row
    from public.third_place_combinations
    where qualifying_groups_key = third_key;

    if third_row.qualifying_groups_key is not null then
      perform public.set_match_side_team(79, 'AWAY', public.group_position_team_id(third_row.for_1a, 3));
      perform public.set_match_side_team(85, 'AWAY', public.group_position_team_id(third_row.for_1b, 3));
      perform public.set_match_side_team(81, 'AWAY', public.group_position_team_id(third_row.for_1d, 3));
      perform public.set_match_side_team(74, 'AWAY', public.group_position_team_id(third_row.for_1e, 3));
      perform public.set_match_side_team(82, 'AWAY', public.group_position_team_id(third_row.for_1g, 3));
      perform public.set_match_side_team(77, 'AWAY', public.group_position_team_id(third_row.for_1i, 3));
      perform public.set_match_side_team(87, 'AWAY', public.group_position_team_id(third_row.for_1k, 3));
      perform public.set_match_side_team(80, 'AWAY', public.group_position_team_id(third_row.for_1l, 3));
    end if;
  else
    perform public.set_match_side_team(74, 'AWAY', null);
    perform public.set_match_side_team(77, 'AWAY', null);
    perform public.set_match_side_team(79, 'AWAY', null);
    perform public.set_match_side_team(80, 'AWAY', null);
    perform public.set_match_side_team(81, 'AWAY', null);
    perform public.set_match_side_team(82, 'AWAY', null);
    perform public.set_match_side_team(85, 'AWAY', null);
    perform public.set_match_side_team(87, 'AWAY', null);
  end if;

  for source_match in
    select * from public.matches where fifa_match_number between 73 and 102
  loop
    if source_match.status = 'FINAL' then
      perform public.set_match_side_team(89, 'HOME', case when source_match.fifa_match_number = 74 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 89) end);
      perform public.set_match_side_team(89, 'AWAY', case when source_match.fifa_match_number = 77 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 89) end);
      perform public.set_match_side_team(90, 'HOME', case when source_match.fifa_match_number = 73 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 90) end);
      perform public.set_match_side_team(90, 'AWAY', case when source_match.fifa_match_number = 75 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 90) end);
      perform public.set_match_side_team(91, 'HOME', case when source_match.fifa_match_number = 76 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 91) end);
      perform public.set_match_side_team(91, 'AWAY', case when source_match.fifa_match_number = 78 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 91) end);
      perform public.set_match_side_team(92, 'HOME', case when source_match.fifa_match_number = 79 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 92) end);
      perform public.set_match_side_team(92, 'AWAY', case when source_match.fifa_match_number = 80 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 92) end);
      perform public.set_match_side_team(93, 'HOME', case when source_match.fifa_match_number = 83 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 93) end);
      perform public.set_match_side_team(93, 'AWAY', case when source_match.fifa_match_number = 84 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 93) end);
      perform public.set_match_side_team(94, 'HOME', case when source_match.fifa_match_number = 81 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 94) end);
      perform public.set_match_side_team(94, 'AWAY', case when source_match.fifa_match_number = 82 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 94) end);
      perform public.set_match_side_team(95, 'HOME', case when source_match.fifa_match_number = 86 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 95) end);
      perform public.set_match_side_team(95, 'AWAY', case when source_match.fifa_match_number = 88 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 95) end);
      perform public.set_match_side_team(96, 'HOME', case when source_match.fifa_match_number = 85 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 96) end);
      perform public.set_match_side_team(96, 'AWAY', case when source_match.fifa_match_number = 87 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 96) end);
      perform public.set_match_side_team(97, 'HOME', case when source_match.fifa_match_number = 89 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 97) end);
      perform public.set_match_side_team(97, 'AWAY', case when source_match.fifa_match_number = 90 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 97) end);
      perform public.set_match_side_team(98, 'HOME', case when source_match.fifa_match_number = 93 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 98) end);
      perform public.set_match_side_team(98, 'AWAY', case when source_match.fifa_match_number = 94 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 98) end);
      perform public.set_match_side_team(99, 'HOME', case when source_match.fifa_match_number = 91 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 99) end);
      perform public.set_match_side_team(99, 'AWAY', case when source_match.fifa_match_number = 92 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 99) end);
      perform public.set_match_side_team(100, 'HOME', case when source_match.fifa_match_number = 95 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 100) end);
      perform public.set_match_side_team(100, 'AWAY', case when source_match.fifa_match_number = 96 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 100) end);
      perform public.set_match_side_team(101, 'HOME', case when source_match.fifa_match_number = 97 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 101) end);
      perform public.set_match_side_team(101, 'AWAY', case when source_match.fifa_match_number = 98 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 101) end);
      perform public.set_match_side_team(102, 'HOME', case when source_match.fifa_match_number = 99 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 102) end);
      perform public.set_match_side_team(102, 'AWAY', case when source_match.fifa_match_number = 100 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 102) end);
      perform public.set_match_side_team(103, 'HOME', case when source_match.fifa_match_number = 101 then public.loser_team_id(source_match) else (select home_team_id from public.matches where fifa_match_number = 103) end);
      perform public.set_match_side_team(103, 'AWAY', case when source_match.fifa_match_number = 102 then public.loser_team_id(source_match) else (select away_team_id from public.matches where fifa_match_number = 103) end);
      perform public.set_match_side_team(104, 'HOME', case when source_match.fifa_match_number = 101 then source_match.winner_team_id else (select home_team_id from public.matches where fifa_match_number = 104) end);
      perform public.set_match_side_team(104, 'AWAY', case when source_match.fifa_match_number = 102 then source_match.winner_team_id else (select away_team_id from public.matches where fifa_match_number = 104) end);
    end if;
  end loop;
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

  perform public.refresh_bracket_from_results();

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
      'updated_predictions', prediction_count,
      'bracket_refreshed', true
    )
  );
end;
$$;

grant execute on function public.refresh_bracket_from_results() to authenticated;
grant execute on function public.admin_set_match_result(uuid, integer, integer, public.decided_by, text, integer, integer) to authenticated;

notify pgrst, 'reload schema';
