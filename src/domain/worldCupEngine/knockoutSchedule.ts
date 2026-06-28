import type { Stage, TeamId } from './types';

export type KnockoutScheduleEntry = {
  fifaMatchNumber: number;
  stage: Exclude<Stage, 'GROUP'>;
  kickoffAt: string;
  venue: string;
  homeTeamId: TeamId | null;
  awayTeamId: TeamId | null;
};

// Horarios oficiales convertidos desde CEST (UTC+2) a UTC.
export const KNOCKOUT_SCHEDULE: KnockoutScheduleEntry[] = [
  { fifaMatchNumber: 73, stage: 'R32', kickoffAt: '2026-06-28T19:00:00.000Z', venue: 'Los Ángeles', homeTeamId: 'RSA', awayTeamId: 'CAN' },
  { fifaMatchNumber: 74, stage: 'R32', kickoffAt: '2026-06-29T20:30:00.000Z', venue: 'Boston', homeTeamId: 'GER', awayTeamId: 'PAR' },
  { fifaMatchNumber: 75, stage: 'R32', kickoffAt: '2026-06-30T01:00:00.000Z', venue: 'Monterrey', homeTeamId: 'NED', awayTeamId: 'MAR' },
  { fifaMatchNumber: 76, stage: 'R32', kickoffAt: '2026-06-29T17:00:00.000Z', venue: 'Houston', homeTeamId: 'BRA', awayTeamId: 'JPN' },
  { fifaMatchNumber: 77, stage: 'R32', kickoffAt: '2026-06-30T21:00:00.000Z', venue: 'Nueva York/Nueva Jersey', homeTeamId: 'FRA', awayTeamId: 'SWE' },
  { fifaMatchNumber: 78, stage: 'R32', kickoffAt: '2026-06-30T17:00:00.000Z', venue: 'Dallas', homeTeamId: 'CIV', awayTeamId: 'NOR' },
  { fifaMatchNumber: 79, stage: 'R32', kickoffAt: '2026-07-01T01:00:00.000Z', venue: 'Ciudad de México', homeTeamId: 'MEX', awayTeamId: 'ECU' },
  { fifaMatchNumber: 80, stage: 'R32', kickoffAt: '2026-07-01T16:00:00.000Z', venue: 'Atlanta', homeTeamId: 'ENG', awayTeamId: 'COD' },
  { fifaMatchNumber: 81, stage: 'R32', kickoffAt: '2026-07-02T00:00:00.000Z', venue: 'Área de la Bahía de San Francisco', homeTeamId: 'USA', awayTeamId: 'BIH' },
  { fifaMatchNumber: 82, stage: 'R32', kickoffAt: '2026-07-01T20:00:00.000Z', venue: 'Seattle', homeTeamId: 'BEL', awayTeamId: 'SEN' },
  { fifaMatchNumber: 83, stage: 'R32', kickoffAt: '2026-07-02T23:00:00.000Z', venue: 'Toronto', homeTeamId: 'POR', awayTeamId: 'CRO' },
  { fifaMatchNumber: 84, stage: 'R32', kickoffAt: '2026-07-02T19:00:00.000Z', venue: 'Los Ángeles', homeTeamId: 'ESP', awayTeamId: 'AUT' },
  { fifaMatchNumber: 85, stage: 'R32', kickoffAt: '2026-07-03T03:00:00.000Z', venue: 'Vancouver', homeTeamId: 'SUI', awayTeamId: 'ALG' },
  { fifaMatchNumber: 86, stage: 'R32', kickoffAt: '2026-07-03T22:00:00.000Z', venue: 'Miami', homeTeamId: 'ARG', awayTeamId: 'CPV' },
  { fifaMatchNumber: 87, stage: 'R32', kickoffAt: '2026-07-04T01:30:00.000Z', venue: 'Kansas City', homeTeamId: 'COL', awayTeamId: 'GHA' },
  { fifaMatchNumber: 88, stage: 'R32', kickoffAt: '2026-07-03T18:00:00.000Z', venue: 'Dallas', homeTeamId: 'AUS', awayTeamId: 'EGY' },
  { fifaMatchNumber: 89, stage: 'R16', kickoffAt: '2026-07-04T21:00:00.000Z', venue: 'Filadelfia', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 90, stage: 'R16', kickoffAt: '2026-07-04T17:00:00.000Z', venue: 'Houston', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 91, stage: 'R16', kickoffAt: '2026-07-05T20:00:00.000Z', venue: 'Nueva York/Nueva Jersey', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 92, stage: 'R16', kickoffAt: '2026-07-06T00:00:00.000Z', venue: 'Ciudad de México', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 93, stage: 'R16', kickoffAt: '2026-07-06T19:00:00.000Z', venue: 'Dallas', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 94, stage: 'R16', kickoffAt: '2026-07-07T00:00:00.000Z', venue: 'Seattle', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 95, stage: 'R16', kickoffAt: '2026-07-07T16:00:00.000Z', venue: 'Atlanta', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 96, stage: 'R16', kickoffAt: '2026-07-07T20:00:00.000Z', venue: 'Vancouver', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 97, stage: 'QF', kickoffAt: '2026-07-09T20:00:00.000Z', venue: 'Boston', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 98, stage: 'QF', kickoffAt: '2026-07-10T19:00:00.000Z', venue: 'Los Ángeles', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 99, stage: 'QF', kickoffAt: '2026-07-11T21:00:00.000Z', venue: 'Miami', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 100, stage: 'QF', kickoffAt: '2026-07-12T01:00:00.000Z', venue: 'Kansas City', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 101, stage: 'SF', kickoffAt: '2026-07-14T19:00:00.000Z', venue: 'Dallas', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 102, stage: 'SF', kickoffAt: '2026-07-15T19:00:00.000Z', venue: 'Atlanta', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 103, stage: 'THIRD_PLACE', kickoffAt: '2026-07-18T21:00:00.000Z', venue: 'Miami', homeTeamId: null, awayTeamId: null },
  { fifaMatchNumber: 104, stage: 'FINAL', kickoffAt: '2026-07-19T19:00:00.000Z', venue: 'Nueva York/Nueva Jersey', homeTeamId: null, awayTeamId: null },
];
