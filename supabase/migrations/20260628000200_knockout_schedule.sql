-- Calendario oficial de la fase eliminatoria. Los horarios se almacenan en UTC.
-- En una base ya poblada también resuelve los participantes confirmados de R32.
-- En un reset limpio, los equipos se resolverán al ejecutar la semilla 004.
with knockout_seed as (
  select *
  from jsonb_to_recordset($$
  [
    {"n":73,"stage":"R32","kickoff_at":"2026-06-28T19:00:00Z","venue":"Los Ángeles","home":"RSA","away":"CAN"},
    {"n":74,"stage":"R32","kickoff_at":"2026-06-29T20:30:00Z","venue":"Boston","home":"GER","away":"PAR"},
    {"n":75,"stage":"R32","kickoff_at":"2026-06-30T01:00:00Z","venue":"Monterrey","home":"NED","away":"MAR"},
    {"n":76,"stage":"R32","kickoff_at":"2026-06-29T17:00:00Z","venue":"Houston","home":"BRA","away":"JPN"},
    {"n":77,"stage":"R32","kickoff_at":"2026-06-30T21:00:00Z","venue":"Nueva York/Nueva Jersey","home":"FRA","away":"SWE"},
    {"n":78,"stage":"R32","kickoff_at":"2026-06-30T17:00:00Z","venue":"Dallas","home":"CIV","away":"NOR"},
    {"n":79,"stage":"R32","kickoff_at":"2026-07-01T01:00:00Z","venue":"Ciudad de México","home":"MEX","away":"ECU"},
    {"n":80,"stage":"R32","kickoff_at":"2026-07-01T16:00:00Z","venue":"Atlanta","home":"ENG","away":"COD"},
    {"n":81,"stage":"R32","kickoff_at":"2026-07-02T00:00:00Z","venue":"Área de la Bahía de San Francisco","home":"USA","away":"BIH"},
    {"n":82,"stage":"R32","kickoff_at":"2026-07-01T20:00:00Z","venue":"Seattle","home":"BEL","away":"SEN"},
    {"n":83,"stage":"R32","kickoff_at":"2026-07-02T23:00:00Z","venue":"Toronto","home":"POR","away":"CRO"},
    {"n":84,"stage":"R32","kickoff_at":"2026-07-02T19:00:00Z","venue":"Los Ángeles","home":"ESP","away":"AUT"},
    {"n":85,"stage":"R32","kickoff_at":"2026-07-03T03:00:00Z","venue":"Vancouver","home":"SUI","away":"ALG"},
    {"n":86,"stage":"R32","kickoff_at":"2026-07-03T22:00:00Z","venue":"Miami","home":"ARG","away":"CPV"},
    {"n":87,"stage":"R32","kickoff_at":"2026-07-04T01:30:00Z","venue":"Kansas City","home":"COL","away":"GHA"},
    {"n":88,"stage":"R32","kickoff_at":"2026-07-03T18:00:00Z","venue":"Dallas","home":"AUS","away":"EGY"},
    {"n":89,"stage":"R16","kickoff_at":"2026-07-04T21:00:00Z","venue":"Filadelfia"},
    {"n":90,"stage":"R16","kickoff_at":"2026-07-04T17:00:00Z","venue":"Houston"},
    {"n":91,"stage":"R16","kickoff_at":"2026-07-05T20:00:00Z","venue":"Nueva York/Nueva Jersey"},
    {"n":92,"stage":"R16","kickoff_at":"2026-07-06T00:00:00Z","venue":"Ciudad de México"},
    {"n":93,"stage":"R16","kickoff_at":"2026-07-06T19:00:00Z","venue":"Dallas"},
    {"n":94,"stage":"R16","kickoff_at":"2026-07-07T00:00:00Z","venue":"Seattle"},
    {"n":95,"stage":"R16","kickoff_at":"2026-07-07T16:00:00Z","venue":"Atlanta"},
    {"n":96,"stage":"R16","kickoff_at":"2026-07-07T20:00:00Z","venue":"Vancouver"},
    {"n":97,"stage":"QF","kickoff_at":"2026-07-09T20:00:00Z","venue":"Boston"},
    {"n":98,"stage":"QF","kickoff_at":"2026-07-10T19:00:00Z","venue":"Los Ángeles"},
    {"n":99,"stage":"QF","kickoff_at":"2026-07-11T21:00:00Z","venue":"Miami"},
    {"n":100,"stage":"QF","kickoff_at":"2026-07-12T01:00:00Z","venue":"Kansas City"},
    {"n":101,"stage":"SF","kickoff_at":"2026-07-14T19:00:00Z","venue":"Dallas"},
    {"n":102,"stage":"SF","kickoff_at":"2026-07-15T19:00:00Z","venue":"Atlanta"},
    {"n":103,"stage":"THIRD_PLACE","kickoff_at":"2026-07-18T21:00:00Z","venue":"Miami"},
    {"n":104,"stage":"FINAL","kickoff_at":"2026-07-19T19:00:00Z","venue":"Nueva York/Nueva Jersey"}
  ]
  $$::jsonb) as item(
    n integer,
    stage text,
    kickoff_at timestamptz,
    venue text,
    home text,
    away text
  )
), resolved_seed as (
  select
    seed.*,
    case when exists (select 1 from public.teams where id = seed.home) then seed.home else null end as resolved_home,
    case when exists (select 1 from public.teams where id = seed.away) then seed.away else null end as resolved_away
  from knockout_seed seed
)
insert into public.matches as existing (
  fifa_match_number,
  stage,
  group_letter,
  kickoff_at,
  venue,
  status,
  home_team_id,
  away_team_id
)
select
  n,
  stage::public.match_stage,
  null,
  kickoff_at,
  venue,
  'SCHEDULED'::public.match_status,
  resolved_home,
  resolved_away
from resolved_seed
on conflict (fifa_match_number) do update
set
  stage = excluded.stage,
  group_letter = null,
  kickoff_at = excluded.kickoff_at,
  venue = excluded.venue,
  home_team_id = case when existing.status = 'FINAL' then existing.home_team_id else coalesce(excluded.home_team_id, existing.home_team_id) end,
  away_team_id = case when existing.status = 'FINAL' then existing.away_team_id else coalesce(excluded.away_team_id, existing.away_team_id) end;
