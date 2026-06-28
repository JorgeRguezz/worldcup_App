-- Ejecutar después de 002_world_cup_group_stage.sql.
-- La migración 20260628000200 crea el calendario; esta semilla resuelve los
-- participantes de dieciseisavos cuando la base se inicializa desde cero.
with round_of_32_teams(n, home, away) as (
  values
    (73, 'RSA', 'CAN'),
    (74, 'GER', 'PAR'),
    (75, 'NED', 'MAR'),
    (76, 'BRA', 'JPN'),
    (77, 'FRA', 'SWE'),
    (78, 'CIV', 'NOR'),
    (79, 'MEX', 'ECU'),
    (80, 'ENG', 'COD'),
    (81, 'USA', 'BIH'),
    (82, 'BEL', 'SEN'),
    (83, 'POR', 'CRO'),
    (84, 'ESP', 'AUT'),
    (85, 'SUI', 'ALG'),
    (86, 'ARG', 'CPV'),
    (87, 'COL', 'GHA'),
    (88, 'AUS', 'EGY')
)
update public.matches match
set
  home_team_id = seed.home,
  away_team_id = seed.away
from round_of_32_teams seed
where match.fifa_match_number = seed.n
  and match.status <> 'FINAL';
