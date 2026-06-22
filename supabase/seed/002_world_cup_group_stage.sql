-- Equipos y partidos de fase de grupos del Mundial 2026.
-- Ejecutar despues de supabase/migrations/001_initial_schema.sql.

with team_seed as (
  select *
  from jsonb_to_recordset($$
  [
    {"id":"MEX","name":"México","short_name":"MEX","group_letter":"A","draw_position":1,"fifa_ranking_order":1},
    {"id":"RSA","name":"Sudáfrica","short_name":"RSA","group_letter":"A","draw_position":2,"fifa_ranking_order":2},
    {"id":"KOR","name":"República de Corea","short_name":"KOR","group_letter":"A","draw_position":3,"fifa_ranking_order":3},
    {"id":"CZE","name":"Chequia","short_name":"CZE","group_letter":"A","draw_position":4,"fifa_ranking_order":4},
    {"id":"CAN","name":"Canadá","short_name":"CAN","group_letter":"B","draw_position":1,"fifa_ranking_order":5},
    {"id":"BIH","name":"Bosnia y Herzegovina","short_name":"BIH","group_letter":"B","draw_position":2,"fifa_ranking_order":6},
    {"id":"QAT","name":"Catar","short_name":"QAT","group_letter":"B","draw_position":3,"fifa_ranking_order":7},
    {"id":"SUI","name":"Suiza","short_name":"SUI","group_letter":"B","draw_position":4,"fifa_ranking_order":8},
    {"id":"BRA","name":"Brasil","short_name":"BRA","group_letter":"C","draw_position":1,"fifa_ranking_order":9},
    {"id":"MAR","name":"Marruecos","short_name":"MAR","group_letter":"C","draw_position":2,"fifa_ranking_order":10},
    {"id":"HAI","name":"Haití","short_name":"HAI","group_letter":"C","draw_position":3,"fifa_ranking_order":11},
    {"id":"SCO","name":"Escocia","short_name":"SCO","group_letter":"C","draw_position":4,"fifa_ranking_order":12},
    {"id":"USA","name":"Estados Unidos","short_name":"USA","group_letter":"D","draw_position":1,"fifa_ranking_order":13},
    {"id":"PAR","name":"Paraguay","short_name":"PAR","group_letter":"D","draw_position":2,"fifa_ranking_order":14},
    {"id":"AUS","name":"Australia","short_name":"AUS","group_letter":"D","draw_position":3,"fifa_ranking_order":15},
    {"id":"TUR","name":"Turquía","short_name":"TUR","group_letter":"D","draw_position":4,"fifa_ranking_order":16},
    {"id":"GER","name":"Alemania","short_name":"GER","group_letter":"E","draw_position":1,"fifa_ranking_order":17},
    {"id":"CUW","name":"Curazao","short_name":"CUW","group_letter":"E","draw_position":2,"fifa_ranking_order":18},
    {"id":"CIV","name":"Costa de Marfil","short_name":"CIV","group_letter":"E","draw_position":3,"fifa_ranking_order":19},
    {"id":"ECU","name":"Ecuador","short_name":"ECU","group_letter":"E","draw_position":4,"fifa_ranking_order":20},
    {"id":"NED","name":"Países Bajos","short_name":"NED","group_letter":"F","draw_position":1,"fifa_ranking_order":21},
    {"id":"JPN","name":"Japón","short_name":"JPN","group_letter":"F","draw_position":2,"fifa_ranking_order":22},
    {"id":"SWE","name":"Suecia","short_name":"SWE","group_letter":"F","draw_position":3,"fifa_ranking_order":23},
    {"id":"TUN","name":"Túnez","short_name":"TUN","group_letter":"F","draw_position":4,"fifa_ranking_order":24},
    {"id":"BEL","name":"Bélgica","short_name":"BEL","group_letter":"G","draw_position":1,"fifa_ranking_order":25},
    {"id":"EGY","name":"Egipto","short_name":"EGY","group_letter":"G","draw_position":2,"fifa_ranking_order":26},
    {"id":"IRN","name":"RI de Irán","short_name":"IRN","group_letter":"G","draw_position":3,"fifa_ranking_order":27},
    {"id":"NZL","name":"Nueva Zelanda","short_name":"NZL","group_letter":"G","draw_position":4,"fifa_ranking_order":28},
    {"id":"ESP","name":"España","short_name":"ESP","group_letter":"H","draw_position":1,"fifa_ranking_order":29},
    {"id":"CPV","name":"Cabo Verde","short_name":"CPV","group_letter":"H","draw_position":2,"fifa_ranking_order":30},
    {"id":"KSA","name":"Arabia Saudí","short_name":"KSA","group_letter":"H","draw_position":3,"fifa_ranking_order":31},
    {"id":"URU","name":"Uruguay","short_name":"URU","group_letter":"H","draw_position":4,"fifa_ranking_order":32},
    {"id":"FRA","name":"Francia","short_name":"FRA","group_letter":"I","draw_position":1,"fifa_ranking_order":33},
    {"id":"SEN","name":"Senegal","short_name":"SEN","group_letter":"I","draw_position":2,"fifa_ranking_order":34},
    {"id":"IRQ","name":"Irak","short_name":"IRQ","group_letter":"I","draw_position":3,"fifa_ranking_order":35},
    {"id":"NOR","name":"Noruega","short_name":"NOR","group_letter":"I","draw_position":4,"fifa_ranking_order":36},
    {"id":"ARG","name":"Argentina","short_name":"ARG","group_letter":"J","draw_position":1,"fifa_ranking_order":37},
    {"id":"ALG","name":"Argelia","short_name":"ALG","group_letter":"J","draw_position":2,"fifa_ranking_order":38},
    {"id":"AUT","name":"Austria","short_name":"AUT","group_letter":"J","draw_position":3,"fifa_ranking_order":39},
    {"id":"JOR","name":"Jordania","short_name":"JOR","group_letter":"J","draw_position":4,"fifa_ranking_order":40},
    {"id":"POR","name":"Portugal","short_name":"POR","group_letter":"K","draw_position":1,"fifa_ranking_order":41},
    {"id":"COD","name":"RD de Congo","short_name":"COD","group_letter":"K","draw_position":2,"fifa_ranking_order":42},
    {"id":"UZB","name":"Uzbekistán","short_name":"UZB","group_letter":"K","draw_position":3,"fifa_ranking_order":43},
    {"id":"COL","name":"Colombia","short_name":"COL","group_letter":"K","draw_position":4,"fifa_ranking_order":44},
    {"id":"ENG","name":"Inglaterra","short_name":"ENG","group_letter":"L","draw_position":1,"fifa_ranking_order":45},
    {"id":"CRO","name":"Croacia","short_name":"CRO","group_letter":"L","draw_position":2,"fifa_ranking_order":46},
    {"id":"GHA","name":"Ghana","short_name":"GHA","group_letter":"L","draw_position":3,"fifa_ranking_order":47},
    {"id":"PAN","name":"Panamá","short_name":"PAN","group_letter":"L","draw_position":4,"fifa_ranking_order":48}
  ]
  $$::jsonb) as item(
    id text,
    name text,
    short_name text,
    group_letter text,
    draw_position integer,
    fifa_ranking_order integer
  )
)
insert into public.teams (id, name, short_name, fifa_code, group_letter, draw_position, fifa_ranking_order)
select id, name, short_name, id, group_letter, draw_position, fifa_ranking_order
from team_seed
on conflict (id) do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  fifa_code = excluded.fifa_code,
  group_letter = excluded.group_letter,
  draw_position = excluded.draw_position,
  fifa_ranking_order = excluded.fifa_ranking_order;

with match_seed as (
  select *
  from jsonb_to_recordset($$
  [
    {"n":1,"group_letter":"A","kickoff_at":"2026-06-11T19:00:00.000Z","home":"MEX","away":"RSA","venue":"Estadio Ciudad de México","home_score":2,"away_score":0},
    {"n":2,"group_letter":"A","kickoff_at":"2026-06-12T01:00:00.000Z","home":"KOR","away":"CZE","venue":"Estadio Guadalajara","home_score":2,"away_score":1},
    {"n":3,"group_letter":"B","kickoff_at":"2026-06-12T19:00:00.000Z","home":"CAN","away":"BIH","venue":"Estadio Toronto","home_score":1,"away_score":1},
    {"n":4,"group_letter":"D","kickoff_at":"2026-06-13T01:00:00.000Z","home":"USA","away":"PAR","venue":"Estadio Los Ángeles","home_score":4,"away_score":1},
    {"n":5,"group_letter":"B","kickoff_at":"2026-06-13T19:00:00.000Z","home":"QAT","away":"SUI","venue":"Estadio Bahía de San Francisco","home_score":1,"away_score":1},
    {"n":6,"group_letter":"C","kickoff_at":"2026-06-13T22:00:00.000Z","home":"BRA","away":"MAR","venue":"Estadio Nueva York Nueva Jersey","home_score":1,"away_score":1},
    {"n":7,"group_letter":"C","kickoff_at":"2026-06-14T01:00:00.000Z","home":"HAI","away":"SCO","venue":"Estadio Boston","home_score":0,"away_score":1},
    {"n":8,"group_letter":"D","kickoff_at":"2026-06-14T03:00:00.000Z","home":"AUS","away":"TUR","venue":"Estadio BC Place Vancouver","home_score":2,"away_score":0},
    {"n":9,"group_letter":"E","kickoff_at":"2026-06-14T16:00:00.000Z","home":"GER","away":"CUW","venue":"Estadio Houston","home_score":7,"away_score":1},
    {"n":10,"group_letter":"E","kickoff_at":"2026-06-14T19:00:00.000Z","home":"CIV","away":"ECU","venue":"Estadio Filadelfia","home_score":1,"away_score":0},
    {"n":11,"group_letter":"F","kickoff_at":"2026-06-14T22:00:00.000Z","home":"NED","away":"JPN","venue":"Estadio Dallas","home_score":2,"away_score":2},
    {"n":12,"group_letter":"F","kickoff_at":"2026-06-15T01:00:00.000Z","home":"SWE","away":"TUN","venue":"Estadio Monterrey","home_score":5,"away_score":1},
    {"n":13,"group_letter":"G","kickoff_at":"2026-06-15T19:00:00.000Z","home":"BEL","away":"EGY","venue":"Estadio Seattle","home_score":1,"away_score":1},
    {"n":14,"group_letter":"G","kickoff_at":"2026-06-16T01:00:00.000Z","home":"IRN","away":"NZL","venue":"Estadio Los Ángeles","home_score":2,"away_score":2},
    {"n":15,"group_letter":"H","kickoff_at":"2026-06-15T22:00:00.000Z","home":"ESP","away":"CPV","venue":"Estadio Atlanta","home_score":0,"away_score":0},
    {"n":16,"group_letter":"H","kickoff_at":"2026-06-16T01:00:00.000Z","home":"KSA","away":"URU","venue":"Estadio Miami","home_score":1,"away_score":1},
    {"n":17,"group_letter":"I","kickoff_at":"2026-06-16T19:00:00.000Z","home":"FRA","away":"SEN","venue":"Estadio Nueva York Nueva Jersey","home_score":3,"away_score":1},
    {"n":18,"group_letter":"I","kickoff_at":"2026-06-16T22:00:00.000Z","home":"IRQ","away":"NOR","venue":"Estadio Boston","home_score":1,"away_score":4},
    {"n":19,"group_letter":"J","kickoff_at":"2026-06-17T01:00:00.000Z","home":"ARG","away":"ALG","venue":"Estadio Kansas City","home_score":3,"away_score":0},
    {"n":20,"group_letter":"J","kickoff_at":"2026-06-17T03:00:00.000Z","home":"AUT","away":"JOR","venue":"Estadio Bahía de San Francisco","home_score":3,"away_score":1},
    {"n":21,"group_letter":"K","kickoff_at":"2026-06-17T19:00:00.000Z","home":"POR","away":"COD","venue":"Estadio Houston","home_score":1,"away_score":1},
    {"n":22,"group_letter":"K","kickoff_at":"2026-06-18T01:00:00.000Z","home":"UZB","away":"COL","venue":"Estadio Ciudad de México","home_score":1,"away_score":3},
    {"n":23,"group_letter":"L","kickoff_at":"2026-06-17T22:00:00.000Z","home":"ENG","away":"CRO","venue":"Estadio Dallas","home_score":4,"away_score":2},
    {"n":24,"group_letter":"L","kickoff_at":"2026-06-18T01:00:00.000Z","home":"GHA","away":"PAN","venue":"Estadio Toronto","home_score":1,"away_score":0},
    {"n":25,"group_letter":"A","kickoff_at":"2026-06-18T19:00:00.000Z","home":"CZE","away":"RSA","venue":"Estadio Atlanta","home_score":1,"away_score":1},
    {"n":26,"group_letter":"A","kickoff_at":"2026-06-19T01:00:00.000Z","home":"MEX","away":"KOR","venue":"Estadio Guadalajara","home_score":1,"away_score":0},
    {"n":27,"group_letter":"B","kickoff_at":"2026-06-18T22:00:00.000Z","home":"SUI","away":"BIH","venue":"Estadio Los Ángeles","home_score":4,"away_score":1},
    {"n":28,"group_letter":"B","kickoff_at":"2026-06-19T03:00:00.000Z","home":"CAN","away":"QAT","venue":"Estadio BC Place Vancouver","home_score":6,"away_score":0},
    {"n":29,"group_letter":"C","kickoff_at":"2026-06-19T19:00:00.000Z","home":"SCO","away":"MAR","venue":"Estadio Boston","home_score":0,"away_score":1},
    {"n":30,"group_letter":"C","kickoff_at":"2026-06-19T22:00:00.000Z","home":"BRA","away":"HAI","venue":"Estadio Filadelfia","home_score":3,"away_score":0},
    {"n":31,"group_letter":"D","kickoff_at":"2026-06-20T01:00:00.000Z","home":"USA","away":"AUS","venue":"Estadio Seattle","home_score":2,"away_score":0},
    {"n":32,"group_letter":"D","kickoff_at":"2026-06-20T03:00:00.000Z","home":"TUR","away":"PAR","venue":"Estadio Bahía de San Francisco","home_score":0,"away_score":1},
    {"n":33,"group_letter":"E","kickoff_at":"2026-06-20T20:00:00.000Z","home":"GER","away":"CIV","venue":"Estadio Toronto"},
    {"n":34,"group_letter":"E","kickoff_at":"2026-06-21T02:00:00.000Z","home":"ECU","away":"CUW","venue":"Estadio Kansas City"},
    {"n":35,"group_letter":"F","kickoff_at":"2026-06-20T17:00:00.000Z","home":"NED","away":"SWE","venue":"Estadio Houston"},
    {"n":36,"group_letter":"F","kickoff_at":"2026-06-20T04:00:00.000Z","home":"TUN","away":"JPN","venue":"Estadio Monterrey"},
    {"n":37,"group_letter":"G","kickoff_at":"2026-06-21T19:00:00.000Z","home":"BEL","away":"IRN","venue":"Estadio Los Ángeles"},
    {"n":38,"group_letter":"G","kickoff_at":"2026-06-22T01:00:00.000Z","home":"NZL","away":"EGY","venue":"Estadio BC Place Vancouver"},
    {"n":39,"group_letter":"H","kickoff_at":"2026-06-21T16:00:00.000Z","home":"ESP","away":"KSA","venue":"Estadio Atlanta"},
    {"n":40,"group_letter":"H","kickoff_at":"2026-06-21T22:00:00.000Z","home":"URU","away":"CPV","venue":"Estadio Miami"},
    {"n":41,"group_letter":"I","kickoff_at":"2026-06-22T21:00:00.000Z","home":"FRA","away":"IRQ","venue":"Estadio Filadelfia"},
    {"n":42,"group_letter":"I","kickoff_at":"2026-06-23T00:00:00.000Z","home":"NOR","away":"SEN","venue":"Estadio Nueva York Nueva Jersey"},
    {"n":43,"group_letter":"J","kickoff_at":"2026-06-22T17:00:00.000Z","home":"ARG","away":"AUT","venue":"Estadio Dallas"},
    {"n":44,"group_letter":"J","kickoff_at":"2026-06-23T03:00:00.000Z","home":"JOR","away":"ALG","venue":"Estadio Bahía de San Francisco"},
    {"n":45,"group_letter":"K","kickoff_at":"2026-06-23T17:00:00.000Z","home":"POR","away":"UZB","venue":"Estadio Houston"},
    {"n":46,"group_letter":"K","kickoff_at":"2026-06-24T02:00:00.000Z","home":"COL","away":"COD","venue":"Estadio Guadalajara"},
    {"n":47,"group_letter":"L","kickoff_at":"2026-06-23T20:00:00.000Z","home":"ENG","away":"GHA","venue":"Estadio Boston"},
    {"n":48,"group_letter":"L","kickoff_at":"2026-06-23T23:00:00.000Z","home":"PAN","away":"CRO","venue":"Estadio Toronto"},
    {"n":49,"group_letter":"A","kickoff_at":"2026-06-25T01:00:00.000Z","home":"CZE","away":"MEX","venue":"Estadio Ciudad de México"},
    {"n":50,"group_letter":"A","kickoff_at":"2026-06-25T01:00:00.000Z","home":"RSA","away":"KOR","venue":"Estadio Monterrey"},
    {"n":51,"group_letter":"B","kickoff_at":"2026-06-24T19:00:00.000Z","home":"SUI","away":"CAN","venue":"Estadio BC Place Vancouver"},
    {"n":52,"group_letter":"B","kickoff_at":"2026-06-24T19:00:00.000Z","home":"BIH","away":"QAT","venue":"Estadio Seattle"},
    {"n":53,"group_letter":"C","kickoff_at":"2026-06-24T22:00:00.000Z","home":"BRA","away":"SCO","venue":"Estadio Miami"},
    {"n":54,"group_letter":"C","kickoff_at":"2026-06-24T22:00:00.000Z","home":"MAR","away":"HAI","venue":"Estadio Atlanta"},
    {"n":55,"group_letter":"D","kickoff_at":"2026-06-26T02:00:00.000Z","home":"TUR","away":"USA","venue":"Estadio Los Ángeles"},
    {"n":56,"group_letter":"D","kickoff_at":"2026-06-26T02:00:00.000Z","home":"PAR","away":"AUS","venue":"Estadio Bahía de San Francisco"},
    {"n":57,"group_letter":"E","kickoff_at":"2026-06-25T20:00:00.000Z","home":"CUW","away":"CIV","venue":"Estadio Filadelfia"},
    {"n":58,"group_letter":"E","kickoff_at":"2026-06-25T20:00:00.000Z","home":"ECU","away":"GER","venue":"Estadio Nueva York Nueva Jersey"},
    {"n":59,"group_letter":"F","kickoff_at":"2026-06-25T23:00:00.000Z","home":"JPN","away":"SWE","venue":"Estadio Dallas"},
    {"n":60,"group_letter":"F","kickoff_at":"2026-06-25T23:00:00.000Z","home":"TUN","away":"NED","venue":"Estadio Kansas City"},
    {"n":61,"group_letter":"G","kickoff_at":"2026-06-27T03:00:00.000Z","home":"EGY","away":"IRN","venue":"Estadio Seattle"},
    {"n":62,"group_letter":"G","kickoff_at":"2026-06-27T03:00:00.000Z","home":"NZL","away":"BEL","venue":"Estadio BC Place Vancouver"},
    {"n":63,"group_letter":"H","kickoff_at":"2026-06-27T00:00:00.000Z","home":"CPV","away":"KSA","venue":"Estadio Houston"},
    {"n":64,"group_letter":"H","kickoff_at":"2026-06-27T00:00:00.000Z","home":"URU","away":"ESP","venue":"Estadio Guadalajara"},
    {"n":65,"group_letter":"I","kickoff_at":"2026-06-26T19:00:00.000Z","home":"NOR","away":"FRA","venue":"Estadio Boston"},
    {"n":66,"group_letter":"I","kickoff_at":"2026-06-26T19:00:00.000Z","home":"SEN","away":"IRQ","venue":"Estadio Toronto"},
    {"n":67,"group_letter":"J","kickoff_at":"2026-06-28T02:00:00.000Z","home":"ALG","away":"AUT","venue":"Estadio Kansas City"},
    {"n":68,"group_letter":"J","kickoff_at":"2026-06-28T02:00:00.000Z","home":"JOR","away":"ARG","venue":"Estadio Dallas"},
    {"n":69,"group_letter":"K","kickoff_at":"2026-06-27T23:30:00.000Z","home":"COL","away":"POR","venue":"Estadio Miami"},
    {"n":70,"group_letter":"K","kickoff_at":"2026-06-27T23:30:00.000Z","home":"COD","away":"UZB","venue":"Estadio Atlanta"},
    {"n":71,"group_letter":"L","kickoff_at":"2026-06-27T21:00:00.000Z","home":"PAN","away":"ENG","venue":"Estadio Nueva York Nueva Jersey"},
    {"n":72,"group_letter":"L","kickoff_at":"2026-06-27T21:00:00.000Z","home":"CRO","away":"GHA","venue":"Estadio Filadelfia"}
  ]
  $$::jsonb) as item(
    n integer,
    group_letter text,
    kickoff_at timestamptz,
    home text,
    away text,
    venue text,
    home_score integer,
    away_score integer
  )
)
insert into public.matches (
  fifa_match_number,
  stage,
  group_letter,
  kickoff_at,
  venue,
  status,
  home_team_id,
  away_team_id,
  home_score,
  away_score,
  winner_team_id,
  decided_by,
  result_updated_at
)
select
  n,
  'GROUP'::public.match_stage,
  group_letter,
  kickoff_at,
  venue,
  case when home_score is null or away_score is null then 'SCHEDULED'::public.match_status else 'FINAL'::public.match_status end,
  home,
  away,
  home_score,
  away_score,
  case
    when home_score is null or away_score is null or home_score = away_score then null
    when home_score > away_score then home
    else away
  end,
  case when home_score is null or away_score is null then null else 'NORMAL_TIME'::public.decided_by end,
  case when home_score is null or away_score is null then null else now() end
from match_seed
on conflict (fifa_match_number) do update
set
  group_letter = excluded.group_letter,
  kickoff_at = excluded.kickoff_at,
  venue = excluded.venue,
  status = excluded.status,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  winner_team_id = excluded.winner_team_id,
  decided_by = excluded.decided_by,
  result_updated_at = excluded.result_updated_at;
