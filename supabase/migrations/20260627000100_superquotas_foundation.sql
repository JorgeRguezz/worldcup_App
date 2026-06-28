create type public.superquota_market_type as enum (
  'YES_NO',
  'TEAM',
  'PLAYER',
  'NUMBER_RANGE',
  'MULTIPLE_CHOICE'
);

create type public.superquota_market_status as enum (
  'DRAFT',
  'PUBLISHED',
  'RESOLVED',
  'CANCELLED'
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  position text,
  shirt_number integer check (shirt_number is null or shirt_number between 1 and 99),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, name)
);

create table public.superquota_markets (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  market_type public.superquota_market_type not null,
  title text not null check (length(trim(title)) > 0),
  default_points integer not null default 1 check (default_points >= 0),
  subject_team_id text references public.teams(id),
  subject_player_id uuid references public.players(id),
  status public.superquota_market_status not null default 'DRAFT',
  correct_option_id uuid,
  created_by uuid not null references public.profiles(id),
  published_at timestamptz,
  resolved_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint superquota_resolution_state check (
    (status = 'RESOLVED' and correct_option_id is not null and resolved_at is not null)
    or (status = 'CANCELLED' and correct_option_id is null and cancelled_at is not null)
    or (status in ('DRAFT', 'PUBLISHED') and correct_option_id is null and resolved_at is null and cancelled_at is null)
  ),
  constraint superquota_publication_state check (
    status in ('DRAFT', 'CANCELLED') or published_at is not null
  )
);

create table public.superquota_options (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.superquota_markets(id) on delete cascade,
  label text not null check (length(trim(label)) > 0),
  points integer check (points is null or points >= 0),
  team_id text references public.teams(id),
  player_id uuid references public.players(id),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market_id, label),
  unique (market_id, display_order),
  unique (id, market_id)
);

alter table public.superquota_markets
  add constraint superquota_correct_option
  foreign key (correct_option_id, id)
  references public.superquota_options(id, market_id);

create table public.superquota_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  market_id uuid not null references public.superquota_markets(id) on delete cascade,
  option_id uuid not null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  is_void boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, market_id),
  foreign key (option_id, market_id)
    references public.superquota_options(id, market_id)
);

create index superquota_markets_match_id_idx
  on public.superquota_markets(match_id);

create index superquota_options_market_id_idx
  on public.superquota_options(market_id, display_order);

create index superquota_predictions_market_id_idx
  on public.superquota_predictions(market_id);

create index superquota_predictions_user_id_idx
  on public.superquota_predictions(user_id);

create or replace function public.touch_superquota_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_touch_updated_at
before update on public.players
for each row execute function public.touch_superquota_updated_at();

create trigger superquota_markets_touch_updated_at
before update on public.superquota_markets
for each row execute function public.touch_superquota_updated_at();

create trigger superquota_options_touch_updated_at
before update on public.superquota_options
for each row execute function public.touch_superquota_updated_at();

create trigger superquota_predictions_touch_updated_at
before update on public.superquota_predictions
for each row execute function public.touch_superquota_updated_at();

create or replace function public.validate_superquota_market_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match public.matches%rowtype;
  has_predictions boolean;
begin
  select * into target_match
  from public.matches
  where id = new.match_id;

  if target_match.id is null then
    raise exception 'Partido inexistente';
  end if;

  if new.subject_player_id is not null and not exists (
    select 1
    from public.players p
    where p.id = new.subject_player_id
      and (p.team_id = target_match.home_team_id or p.team_id = target_match.away_team_id)
  ) then
    raise exception 'El jugador indicado no pertenece a ninguno de los equipos del partido';
  end if;

  if new.subject_team_id is not null
     and new.subject_team_id is distinct from target_match.home_team_id
     and new.subject_team_id is distinct from target_match.away_team_id then
    raise exception 'El equipo indicado no participa en el partido';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'DRAFT' then
      raise exception 'Las supercuotas deben crearse como borrador';
    end if;
    new.created_by = auth.uid();
    return new;
  end if;

  select exists (
    select 1 from public.superquota_predictions sp where sp.market_id = old.id
  ) into has_predictions;

  if has_predictions and (
    new.match_id is distinct from old.match_id
    or new.market_type is distinct from old.market_type
    or new.title is distinct from old.title
    or new.default_points is distinct from old.default_points
    or new.subject_team_id is distinct from old.subject_team_id
    or new.subject_player_id is distinct from old.subject_player_id
  ) then
    raise exception 'No se puede modificar una supercuota que ya tiene respuestas';
  end if;

  return new;
end;
$$;

create trigger superquota_markets_validate_write
before insert or update on public.superquota_markets
for each row execute function public.validate_superquota_market_write();

create or replace function public.validate_superquota_option_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_market public.superquota_markets%rowtype;
  target_match public.matches%rowtype;
begin
  select * into target_market
  from public.superquota_markets
  where id = new.market_id;

  if target_market.id is null then
    raise exception 'Supercuota inexistente';
  end if;

  select * into target_match
  from public.matches
  where id = target_market.match_id;

  if target_market.status in ('RESOLVED', 'CANCELLED') or now() >= target_match.kickoff_at then
    raise exception 'Las opciones de esta supercuota estan bloqueadas';
  end if;

  if exists (
    select 1 from public.superquota_predictions sp where sp.market_id = target_market.id
  ) then
    raise exception 'No se pueden modificar opciones cuando ya existen respuestas';
  end if;

  if new.player_id is not null and not exists (
    select 1
    from public.players p
    where p.id = new.player_id
      and (p.team_id = target_match.home_team_id or p.team_id = target_match.away_team_id)
  ) then
    raise exception 'El jugador de la opcion no pertenece a ninguno de los equipos del partido';
  end if;

  if new.team_id is not null
     and new.team_id is distinct from target_match.home_team_id
     and new.team_id is distinct from target_match.away_team_id then
    raise exception 'El equipo de la opcion no participa en el partido';
  end if;

  return new;
end;
$$;

create trigger superquota_options_validate_write
before insert or update on public.superquota_options
for each row execute function public.validate_superquota_option_write();

create or replace function public.validate_superquota_option_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kickoff timestamptz;
  market_status public.superquota_market_status;
begin
  select m.kickoff_at, sqm.status
  into kickoff, market_status
  from public.superquota_markets sqm
  join public.matches m on m.id = sqm.match_id
  where sqm.id = old.market_id;

  if market_status in ('RESOLVED', 'CANCELLED') or now() >= kickoff then
    raise exception 'Las opciones de esta supercuota estan bloqueadas';
  end if;

  if exists (
    select 1 from public.superquota_predictions sp where sp.market_id = old.market_id
  ) then
    raise exception 'No se pueden eliminar opciones cuando ya existen respuestas';
  end if;

  return old;
end;
$$;

create trigger superquota_options_validate_delete
before delete on public.superquota_options
for each row execute function public.validate_superquota_option_delete();

create or replace function public.validate_superquota_prediction_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_market public.superquota_markets%rowtype;
  kickoff timestamptz;
begin
  select sqm.* into target_market
  from public.superquota_markets sqm
  where sqm.id = new.market_id;

  select kickoff_at into kickoff
  from public.matches
  where id = target_market.match_id;

  if target_market.id is null then
    raise exception 'Supercuota inexistente';
  end if;

  if target_market.status <> 'PUBLISHED' then
    raise exception 'La supercuota no esta abierta';
  end if;

  if now() >= kickoff then
    raise exception 'La supercuota esta bloqueada';
  end if;

  if not exists (
    select 1
    from public.superquota_options sqo
    where sqo.id = new.option_id and sqo.market_id = new.market_id
  ) then
    raise exception 'La opcion no pertenece a esta supercuota';
  end if;

  new.points_awarded = 0;
  new.is_void = false;
  return new;
end;
$$;

create trigger superquota_predictions_validate_write
before insert or update of user_id, market_id, option_id on public.superquota_predictions
for each row execute function public.validate_superquota_prediction_write();

create or replace function public.validate_superquota_prediction_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  market_status public.superquota_market_status;
  kickoff timestamptz;
begin
  select sqm.status, m.kickoff_at
  into market_status, kickoff
  from public.superquota_markets sqm
  join public.matches m on m.id = sqm.match_id
  where sqm.id = old.market_id;

  if market_status <> 'PUBLISHED' or now() >= kickoff then
    raise exception 'La supercuota esta bloqueada';
  end if;

  return old;
end;
$$;

create trigger superquota_predictions_validate_delete
before delete on public.superquota_predictions
for each row execute function public.validate_superquota_prediction_delete();

create or replace function public.admin_publish_superquota(p_market_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_market public.superquota_markets%rowtype;
  kickoff timestamptz;
  option_count integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select sqm.* into target_market
  from public.superquota_markets sqm
  where sqm.id = p_market_id
  for update;

  select kickoff_at into kickoff
  from public.matches
  where id = target_market.match_id;

  if target_market.id is null then
    raise exception 'Supercuota inexistente';
  end if;

  if target_market.status <> 'DRAFT' then
    raise exception 'Solo se puede publicar una supercuota en borrador';
  end if;

  if now() >= kickoff then
    raise exception 'No se puede publicar una supercuota después del inicio del partido';
  end if;

  select count(*) into option_count
  from public.superquota_options
  where market_id = p_market_id;

  if option_count < 2 then
    raise exception 'La supercuota necesita al menos dos opciones';
  end if;

  update public.superquota_markets
  set status = 'PUBLISHED', published_at = now()
  where id = p_market_id;
end;
$$;

create or replace function public.admin_resolve_superquota(
  p_market_id uuid,
  p_correct_option_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  target_market public.superquota_markets%rowtype;
  kickoff timestamptz;
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select sqm.* into target_market
  from public.superquota_markets sqm
  where sqm.id = p_market_id
  for update;

  select kickoff_at into kickoff
  from public.matches
  where id = target_market.match_id;

  if target_market.id is null then
    raise exception 'Supercuota inexistente';
  end if;

  if target_market.status <> 'PUBLISHED' then
    raise exception 'La supercuota no esta pendiente de resolucion';
  end if;

  if now() < kickoff then
    raise exception 'No se puede resolver antes del inicio del partido';
  end if;

  if not exists (
    select 1
    from public.superquota_options
    where id = p_correct_option_id and market_id = p_market_id
  ) then
    raise exception 'La opcion correcta no pertenece a esta supercuota';
  end if;

  update public.superquota_predictions sp
  set
    points_awarded = case
      when sp.option_id = p_correct_option_id then coalesce(sqo.points, target_market.default_points)
      else 0
    end,
    is_void = false
  from public.superquota_options sqo
  where sp.market_id = p_market_id and sqo.id = sp.option_id;

  get diagnostics updated_count = row_count;

  update public.superquota_markets
  set
    status = 'RESOLVED',
    correct_option_id = p_correct_option_id,
    resolved_at = now()
  where id = p_market_id;

  return updated_count;
end;
$$;

create or replace function public.admin_cancel_superquota(p_market_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status public.superquota_market_status;
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select status into target_status
  from public.superquota_markets
  where id = p_market_id
  for update;

  if target_status is null then
    raise exception 'Supercuota inexistente';
  end if;

  if target_status in ('RESOLVED', 'CANCELLED') then
    raise exception 'La supercuota ya esta cerrada';
  end if;

  update public.superquota_predictions
  set points_awarded = 0, is_void = true
  where market_id = p_market_id;

  get diagnostics updated_count = row_count;

  update public.superquota_markets
  set status = 'CANCELLED', cancelled_at = now()
  where id = p_market_id;

  return updated_count;
end;
$$;

create or replace function public.visible_superquota_predictions()
returns table (
  match_id uuid,
  market_id uuid,
  market_title text,
  user_id uuid,
  display_name text,
  option_id uuid,
  option_label text,
  points_awarded integer,
  is_void boolean,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sqm.match_id,
    sp.market_id,
    sqm.title,
    sp.user_id,
    p.display_name,
    sp.option_id,
    sqo.label,
    sp.points_awarded,
    sp.is_void,
    sp.updated_at
  from public.superquota_predictions sp
  join public.superquota_markets sqm on sqm.id = sp.market_id
  join public.matches m on m.id = sqm.match_id
  join public.superquota_options sqo on sqo.id = sp.option_id
  join public.profiles p on p.id = sp.user_id
  where m.kickoff_at <= now()
    and sqm.status in ('PUBLISHED', 'RESOLVED')
  order by sqm.match_id, sqm.id, p.display_name;
$$;

alter table public.players enable row level security;
alter table public.superquota_markets enable row level security;
alter table public.superquota_options enable row level security;
alter table public.superquota_predictions enable row level security;

revoke all on table public.players from anon, authenticated;
revoke all on table public.superquota_markets from anon, authenticated;
revoke all on table public.superquota_options from anon, authenticated;
revoke all on table public.superquota_predictions from anon, authenticated;

grant select, insert, update, delete on table public.players to authenticated;
grant select, insert, delete on table public.superquota_markets to authenticated;
grant update (
  match_id,
  market_type,
  title,
  default_points,
  subject_team_id,
  subject_player_id
) on table public.superquota_markets to authenticated;
grant select, insert, update, delete on table public.superquota_options to authenticated;
grant select, insert, delete on table public.superquota_predictions to authenticated;
grant update (option_id) on table public.superquota_predictions to authenticated;

create policy "players readable" on public.players
for select to authenticated using (true);

create policy "admins manage players" on public.players
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "published superquota markets readable" on public.superquota_markets
for select to authenticated
using (status in ('PUBLISHED', 'RESOLVED') or public.is_admin());

create policy "admins manage superquota markets" on public.superquota_markets
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "published superquota options readable" on public.superquota_options
for select to authenticated
using (
  exists (
    select 1
    from public.superquota_markets sqm
    where sqm.id = market_id and (sqm.status in ('PUBLISHED', 'RESOLVED') or public.is_admin())
  )
);

create policy "admins manage superquota options" on public.superquota_options
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own superquota predictions" on public.superquota_predictions
for select to authenticated using (user_id = auth.uid());

create policy "users insert own superquota predictions" on public.superquota_predictions
for insert to authenticated with check (user_id = auth.uid());

create policy "users update own superquota predictions" on public.superquota_predictions
for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users delete own superquota predictions" on public.superquota_predictions
for delete to authenticated using (user_id = auth.uid());

revoke execute on function public.admin_publish_superquota(uuid) from public, anon;
revoke execute on function public.admin_resolve_superquota(uuid, uuid) from public, anon;
revoke execute on function public.admin_cancel_superquota(uuid) from public, anon;
revoke execute on function public.visible_superquota_predictions() from public, anon;

grant execute on function public.admin_publish_superquota(uuid) to authenticated;
grant execute on function public.admin_resolve_superquota(uuid, uuid) to authenticated;
grant execute on function public.admin_cancel_superquota(uuid) to authenticated;
grant execute on function public.visible_superquota_predictions() to authenticated;

notify pgrst, 'reload schema';
