create extension if not exists "pgcrypto";

create type public.match_stage as enum ('GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL');
create type public.match_status as enum ('SCHEDULED', 'LIVE', 'FINAL');
create type public.decided_by as enum ('NORMAL_TIME', 'EXTRA_TIME', 'PENALTIES');
create type public.slot_side as enum ('HOME', 'AWAY');
create type public.slot_source_type as enum ('TEAM', 'GROUP_POSITION', 'THIRD_PLACE_ASSIGNMENT', 'MATCH_WINNER', 'MATCH_LOSER');
create type public.admin_action_type as enum ('RESULT_UPSERT', 'RESULT_CORRECTION', 'AWARDS_UPSERT', 'RECALCULATE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.teams (
  id text primary key,
  name text not null,
  short_name text not null,
  fifa_code text not null unique,
  group_letter text not null check (group_letter ~ '^[A-L]$'),
  draw_position integer not null check (draw_position between 1 and 4),
  fifa_ranking_order integer not null check (fifa_ranking_order > 0),
  team_conduct_score integer not null default 0
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  fifa_match_number integer not null unique check (fifa_match_number between 1 and 104),
  stage public.match_stage not null,
  group_letter text check (group_letter is null or group_letter ~ '^[A-L]$'),
  kickoff_at timestamptz not null,
  venue text not null default '',
  status public.match_status not null default 'SCHEDULED',
  home_team_id text references public.teams(id),
  away_team_id text references public.teams(id),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  penalties_home integer check (penalties_home is null or penalties_home >= 0),
  penalties_away integer check (penalties_away is null or penalties_away >= 0),
  winner_team_id text references public.teams(id),
  decided_by public.decided_by,
  result_updated_at timestamptz,
  constraint group_stage_requires_group check ((stage = 'GROUP' and group_letter is not null) or (stage <> 'GROUP' and group_letter is null)),
  constraint distinct_match_teams check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id),
  constraint winner_is_participant check (winner_team_id is null or winner_team_id = home_team_id or winner_team_id = away_team_id),
  constraint final_has_scores check (status <> 'FINAL' or (home_score is not null and away_score is not null)),
  constraint knockout_penalty_winner check (
    stage = 'GROUP'
    or status <> 'FINAL'
    or home_score <> away_score
    or (winner_team_id is not null and decided_by = 'PENALTIES')
  ),
  constraint knockout_non_draw_winner check (
    stage = 'GROUP'
    or status <> 'FINAL'
    or home_score = away_score
    or (
      winner_team_id = case when home_score > away_score then home_team_id else away_team_id end
      and decided_by in ('NORMAL_TIME', 'EXTRA_TIME')
    )
  )
);

create table public.match_slots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  side public.slot_side not null,
  source_type public.slot_source_type not null,
  source_value text not null,
  resolved_team_id text references public.teams(id),
  unique (match_id, side)
);

create table public.group_team_stats (
  team_id text not null references public.teams(id) on delete cascade,
  group_letter text not null check (group_letter ~ '^[A-L]$'),
  played integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  goal_difference integer not null default 0,
  points integer not null default 0,
  team_conduct_score integer not null default 0,
  rank integer check (rank between 1 and 4),
  updated_at timestamptz not null default now(),
  primary key (team_id, group_letter)
);

create table public.third_place_combinations (
  qualifying_groups_key text primary key check (qualifying_groups_key ~ '^[A-L]{8}$'),
  for_1a text not null check (for_1a ~ '^[A-L]$'),
  for_1b text not null check (for_1b ~ '^[A-L]$'),
  for_1d text not null check (for_1d ~ '^[A-L]$'),
  for_1e text not null check (for_1e ~ '^[A-L]$'),
  for_1g text not null check (for_1g ~ '^[A-L]$'),
  for_1i text not null check (for_1i ~ '^[A-L]$'),
  for_1k text not null check (for_1k ~ '^[A-L]$'),
  for_1l text not null check (for_1l ~ '^[A-L]$'),
  source_option integer not null unique check (source_option between 1 and 495)
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score between 0 and 20),
  predicted_away_score integer not null check (predicted_away_score between 0 and 20),
  predicted_advancing_team_id text references public.teams(id),
  points_awarded integer not null default 0,
  is_void boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table public.special_predictions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  champion_team_id text not null references public.teams(id),
  runner_up_team_id text not null references public.teams(id),
  top_scorer_player_name text not null check (length(trim(top_scorer_player_name)) > 0),
  points_awarded integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint distinct_special_teams check (champion_team_id <> runner_up_team_id)
);

create table public.official_awards (
  id boolean primary key default true check (id),
  champion_team_id text references public.teams(id),
  runner_up_team_id text references public.teams(id),
  top_scorer_player_name text,
  updated_at timestamptz not null default now(),
  constraint single_official_awards_row check (id = true)
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id),
  action public.admin_action_type not null,
  match_id uuid references public.matches(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_prediction_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger predictions_touch_updated_at
before update on public.predictions
for each row execute function public.touch_prediction_updated_at();

create or replace function public.validate_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match public.matches%rowtype;
begin
  select * into target_match from public.matches where id = new.match_id;
  if target_match.id is null then
    raise exception 'Partido inexistente';
  end if;

  if not public.is_admin() and now() >= target_match.kickoff_at then
    raise exception 'La prediccion esta bloqueada';
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

create trigger predictions_validate_write
before insert or update on public.predictions
for each row execute function public.validate_prediction_write();

create or replace function public.validate_prediction_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kickoff timestamptz;
begin
  select kickoff_at into kickoff from public.matches where id = old.match_id;
  if not public.is_admin() and now() >= kickoff then
    raise exception 'La prediccion esta bloqueada';
  end if;
  return old;
end;
$$;

create trigger predictions_validate_delete
before delete on public.predictions
for each row execute function public.validate_prediction_delete();

create or replace view public.ranking as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points_awarded) filter (where pr.id is not null), 0)::integer as match_points,
  coalesce(sp.points_awarded, 0)::integer as special_points,
  (coalesce(sum(pr.points_awarded) filter (where pr.id is not null), 0) + coalesce(sp.points_awarded, 0))::integer as total_points
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.special_predictions sp on sp.user_id = p.id
group by p.id, p.display_name, sp.points_awarded;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.match_slots enable row level security;
alter table public.group_team_stats enable row level security;
alter table public.third_place_combinations enable row level security;
alter table public.predictions enable row level security;
alter table public.special_predictions enable row level security;
alter table public.official_awards enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "profiles readable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "users update own non-admin profile fields" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and is_admin = false);
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "teams readable" on public.teams for select to authenticated using (true);
create policy "admins manage teams" on public.teams for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "matches readable" on public.matches for select to authenticated using (true);
create policy "admins manage matches" on public.matches for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "match slots readable" on public.match_slots for select to authenticated using (true);
create policy "admins manage match slots" on public.match_slots for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "group stats readable" on public.group_team_stats for select to authenticated using (true);
create policy "admins manage group stats" on public.group_team_stats for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "third combinations readable" on public.third_place_combinations for select to authenticated using (true);
create policy "admins manage third combinations" on public.third_place_combinations for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own predictions" on public.predictions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "users insert own predictions" on public.predictions for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
create policy "users update own predictions" on public.predictions for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "users delete own predictions" on public.predictions for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "users read own special predictions" on public.special_predictions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "users write own special predictions" on public.special_predictions for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "official awards readable" on public.official_awards for select to authenticated using (true);
create policy "admins manage official awards" on public.official_awards for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin audit readable by admins" on public.admin_audit_log for select to authenticated using (public.is_admin());
create policy "admin audit writable by admins" on public.admin_audit_log for insert to authenticated with check (public.is_admin());
