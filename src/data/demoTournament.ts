import { rankAllThirdPlaces, rankGroup, GROUP_LETTERS, type FinalGroupMatch, type GroupLetter, type Match, type RankedTeam, type RankedThirdPlace, type Team } from '../domain/worldCupEngine';
import { withFlag } from './teamFlags';

type TeamSeed = {
  id: string;
  name: string;
  shortName: string;
  groupLetter: GroupLetter;
  drawPosition: number;
};

const teams: TeamSeed[] = [
  { id: 'MEX', name: 'México', shortName: 'MEX', groupLetter: 'A', drawPosition: 1 },
  { id: 'RSA', name: 'Sudáfrica', shortName: 'RSA', groupLetter: 'A', drawPosition: 2 },
  { id: 'KOR', name: 'República de Corea', shortName: 'KOR', groupLetter: 'A', drawPosition: 3 },
  { id: 'CZE', name: 'Chequia', shortName: 'CZE', groupLetter: 'A', drawPosition: 4 },
  { id: 'CAN', name: 'Canadá', shortName: 'CAN', groupLetter: 'B', drawPosition: 1 },
  { id: 'BIH', name: 'Bosnia y Herzegovina', shortName: 'BIH', groupLetter: 'B', drawPosition: 2 },
  { id: 'QAT', name: 'Catar', shortName: 'QAT', groupLetter: 'B', drawPosition: 3 },
  { id: 'SUI', name: 'Suiza', shortName: 'SUI', groupLetter: 'B', drawPosition: 4 },
  { id: 'BRA', name: 'Brasil', shortName: 'BRA', groupLetter: 'C', drawPosition: 1 },
  { id: 'MAR', name: 'Marruecos', shortName: 'MAR', groupLetter: 'C', drawPosition: 2 },
  { id: 'HAI', name: 'Haití', shortName: 'HAI', groupLetter: 'C', drawPosition: 3 },
  { id: 'SCO', name: 'Escocia', shortName: 'SCO', groupLetter: 'C', drawPosition: 4 },
  { id: 'USA', name: 'Estados Unidos', shortName: 'USA', groupLetter: 'D', drawPosition: 1 },
  { id: 'PAR', name: 'Paraguay', shortName: 'PAR', groupLetter: 'D', drawPosition: 2 },
  { id: 'AUS', name: 'Australia', shortName: 'AUS', groupLetter: 'D', drawPosition: 3 },
  { id: 'TUR', name: 'Turquía', shortName: 'TUR', groupLetter: 'D', drawPosition: 4 },
  { id: 'GER', name: 'Alemania', shortName: 'GER', groupLetter: 'E', drawPosition: 1 },
  { id: 'CUW', name: 'Curazao', shortName: 'CUW', groupLetter: 'E', drawPosition: 2 },
  { id: 'CIV', name: 'Costa de Marfil', shortName: 'CIV', groupLetter: 'E', drawPosition: 3 },
  { id: 'ECU', name: 'Ecuador', shortName: 'ECU', groupLetter: 'E', drawPosition: 4 },
  { id: 'NED', name: 'Países Bajos', shortName: 'NED', groupLetter: 'F', drawPosition: 1 },
  { id: 'JPN', name: 'Japón', shortName: 'JPN', groupLetter: 'F', drawPosition: 2 },
  { id: 'SWE', name: 'Suecia', shortName: 'SWE', groupLetter: 'F', drawPosition: 3 },
  { id: 'TUN', name: 'Túnez', shortName: 'TUN', groupLetter: 'F', drawPosition: 4 },
  { id: 'BEL', name: 'Bélgica', shortName: 'BEL', groupLetter: 'G', drawPosition: 1 },
  { id: 'EGY', name: 'Egipto', shortName: 'EGY', groupLetter: 'G', drawPosition: 2 },
  { id: 'IRN', name: 'RI de Irán', shortName: 'IRN', groupLetter: 'G', drawPosition: 3 },
  { id: 'NZL', name: 'Nueva Zelanda', shortName: 'NZL', groupLetter: 'G', drawPosition: 4 },
  { id: 'ESP', name: 'España', shortName: 'ESP', groupLetter: 'H', drawPosition: 1 },
  { id: 'CPV', name: 'Cabo Verde', shortName: 'CPV', groupLetter: 'H', drawPosition: 2 },
  { id: 'KSA', name: 'Arabia Saudí', shortName: 'KSA', groupLetter: 'H', drawPosition: 3 },
  { id: 'URU', name: 'Uruguay', shortName: 'URU', groupLetter: 'H', drawPosition: 4 },
  { id: 'FRA', name: 'Francia', shortName: 'FRA', groupLetter: 'I', drawPosition: 1 },
  { id: 'SEN', name: 'Senegal', shortName: 'SEN', groupLetter: 'I', drawPosition: 2 },
  { id: 'IRQ', name: 'Irak', shortName: 'IRQ', groupLetter: 'I', drawPosition: 3 },
  { id: 'NOR', name: 'Noruega', shortName: 'NOR', groupLetter: 'I', drawPosition: 4 },
  { id: 'ARG', name: 'Argentina', shortName: 'ARG', groupLetter: 'J', drawPosition: 1 },
  { id: 'ALG', name: 'Argelia', shortName: 'ALG', groupLetter: 'J', drawPosition: 2 },
  { id: 'AUT', name: 'Austria', shortName: 'AUT', groupLetter: 'J', drawPosition: 3 },
  { id: 'JOR', name: 'Jordania', shortName: 'JOR', groupLetter: 'J', drawPosition: 4 },
  { id: 'POR', name: 'Portugal', shortName: 'POR', groupLetter: 'K', drawPosition: 1 },
  { id: 'COD', name: 'RD de Congo', shortName: 'COD', groupLetter: 'K', drawPosition: 2 },
  { id: 'UZB', name: 'Uzbekistán', shortName: 'UZB', groupLetter: 'K', drawPosition: 3 },
  { id: 'COL', name: 'Colombia', shortName: 'COL', groupLetter: 'K', drawPosition: 4 },
  { id: 'ENG', name: 'Inglaterra', shortName: 'ENG', groupLetter: 'L', drawPosition: 1 },
  { id: 'CRO', name: 'Croacia', shortName: 'CRO', groupLetter: 'L', drawPosition: 2 },
  { id: 'GHA', name: 'Ghana', shortName: 'GHA', groupLetter: 'L', drawPosition: 3 },
  { id: 'PAN', name: 'Panamá', shortName: 'PAN', groupLetter: 'L', drawPosition: 4 },
];

export const demoTeams: Team[] = teams.map((team, index) => ({
  ...team,
  fifaCode: team.id,
  fifaRankingOrder: index + 1,
}));

type MatchSeed = {
  n: number;
  group: GroupLetter;
  date: string;
  et: string;
  home: string;
  away: string;
  venue: string;
  score?: [number, number];
};

function kickoffAtEt(date: string, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const utc = new Date(`${date}T00:00:00.000Z`);
  utc.setUTCDate(utc.getUTCDate() + (hour >= 20 ? 1 : 0));
  utc.setUTCHours((hour + 4) % 24, minute, 0, 0);
  return utc.toISOString();
}

const groupMatches: MatchSeed[] = [
  { n: 1, group: 'A', date: '2026-06-11', et: '15:00', home: 'MEX', away: 'RSA', score: [2, 0], venue: 'Estadio Ciudad de México' },
  { n: 2, group: 'A', date: '2026-06-11', et: '21:00', home: 'KOR', away: 'CZE', score: [2, 1], venue: 'Estadio Guadalajara' },
  { n: 3, group: 'B', date: '2026-06-12', et: '15:00', home: 'CAN', away: 'BIH', score: [1, 1], venue: 'Estadio Toronto' },
  { n: 4, group: 'D', date: '2026-06-12', et: '21:00', home: 'USA', away: 'PAR', score: [4, 1], venue: 'Estadio Los Ángeles' },
  { n: 5, group: 'B', date: '2026-06-13', et: '15:00', home: 'QAT', away: 'SUI', score: [1, 1], venue: 'Estadio Bahía de San Francisco' },
  { n: 6, group: 'C', date: '2026-06-13', et: '18:00', home: 'BRA', away: 'MAR', score: [1, 1], venue: 'Estadio Nueva York Nueva Jersey' },
  { n: 7, group: 'C', date: '2026-06-13', et: '21:00', home: 'HAI', away: 'SCO', score: [0, 1], venue: 'Estadio Boston' },
  { n: 8, group: 'D', date: '2026-06-13', et: '23:00', home: 'AUS', away: 'TUR', score: [2, 0], venue: 'Estadio BC Place Vancouver' },
  { n: 9, group: 'E', date: '2026-06-14', et: '12:00', home: 'GER', away: 'CUW', score: [7, 1], venue: 'Estadio Houston' },
  { n: 10, group: 'E', date: '2026-06-14', et: '15:00', home: 'CIV', away: 'ECU', score: [1, 0], venue: 'Estadio Filadelfia' },
  { n: 11, group: 'F', date: '2026-06-14', et: '18:00', home: 'NED', away: 'JPN', score: [2, 2], venue: 'Estadio Dallas' },
  { n: 12, group: 'F', date: '2026-06-14', et: '21:00', home: 'SWE', away: 'TUN', score: [5, 1], venue: 'Estadio Monterrey' },
  { n: 13, group: 'G', date: '2026-06-15', et: '15:00', home: 'BEL', away: 'EGY', score: [1, 1], venue: 'Estadio Seattle' },
  { n: 14, group: 'G', date: '2026-06-15', et: '21:00', home: 'IRN', away: 'NZL', score: [2, 2], venue: 'Estadio Los Ángeles' },
  { n: 15, group: 'H', date: '2026-06-15', et: '18:00', home: 'ESP', away: 'CPV', score: [0, 0], venue: 'Estadio Atlanta' },
  { n: 16, group: 'H', date: '2026-06-15', et: '21:00', home: 'KSA', away: 'URU', score: [1, 1], venue: 'Estadio Miami' },
  { n: 17, group: 'I', date: '2026-06-16', et: '15:00', home: 'FRA', away: 'SEN', score: [3, 1], venue: 'Estadio Nueva York Nueva Jersey' },
  { n: 18, group: 'I', date: '2026-06-16', et: '18:00', home: 'IRQ', away: 'NOR', score: [1, 4], venue: 'Estadio Boston' },
  { n: 19, group: 'J', date: '2026-06-16', et: '21:00', home: 'ARG', away: 'ALG', score: [3, 0], venue: 'Estadio Kansas City' },
  { n: 20, group: 'J', date: '2026-06-16', et: '23:00', home: 'AUT', away: 'JOR', score: [3, 1], venue: 'Estadio Bahía de San Francisco' },
  { n: 21, group: 'K', date: '2026-06-17', et: '15:00', home: 'POR', away: 'COD', score: [1, 1], venue: 'Estadio Houston' },
  { n: 22, group: 'K', date: '2026-06-17', et: '21:00', home: 'UZB', away: 'COL', score: [1, 3], venue: 'Estadio Ciudad de México' },
  { n: 23, group: 'L', date: '2026-06-17', et: '18:00', home: 'ENG', away: 'CRO', score: [4, 2], venue: 'Estadio Dallas' },
  { n: 24, group: 'L', date: '2026-06-17', et: '21:00', home: 'GHA', away: 'PAN', score: [1, 0], venue: 'Estadio Toronto' },
  { n: 25, group: 'A', date: '2026-06-18', et: '15:00', home: 'CZE', away: 'RSA', score: [1, 1], venue: 'Estadio Atlanta' },
  { n: 26, group: 'A', date: '2026-06-18', et: '21:00', home: 'MEX', away: 'KOR', score: [1, 0], venue: 'Estadio Guadalajara' },
  { n: 27, group: 'B', date: '2026-06-18', et: '18:00', home: 'SUI', away: 'BIH', score: [4, 1], venue: 'Estadio Los Ángeles' },
  { n: 28, group: 'B', date: '2026-06-18', et: '23:00', home: 'CAN', away: 'QAT', score: [6, 0], venue: 'Estadio BC Place Vancouver' },
  { n: 29, group: 'C', date: '2026-06-19', et: '15:00', home: 'SCO', away: 'MAR', score: [0, 1], venue: 'Estadio Boston' },
  { n: 30, group: 'C', date: '2026-06-19', et: '18:00', home: 'BRA', away: 'HAI', score: [3, 0], venue: 'Estadio Filadelfia' },
  { n: 31, group: 'D', date: '2026-06-19', et: '21:00', home: 'USA', away: 'AUS', score: [2, 0], venue: 'Estadio Seattle' },
  { n: 32, group: 'D', date: '2026-06-19', et: '23:00', home: 'TUR', away: 'PAR', score: [0, 1], venue: 'Estadio Bahía de San Francisco' },
  { n: 33, group: 'E', date: '2026-06-20', et: '16:00', home: 'GER', away: 'CIV', venue: 'Estadio Toronto' },
  { n: 34, group: 'E', date: '2026-06-20', et: '22:00', home: 'ECU', away: 'CUW', venue: 'Estadio Kansas City' },
  { n: 35, group: 'F', date: '2026-06-20', et: '13:00', home: 'NED', away: 'SWE', venue: 'Estadio Houston' },
  { n: 36, group: 'F', date: '2026-06-20', et: '00:00', home: 'TUN', away: 'JPN', venue: 'Estadio Monterrey' },
  { n: 37, group: 'G', date: '2026-06-21', et: '15:00', home: 'BEL', away: 'IRN', venue: 'Estadio Los Ángeles' },
  { n: 38, group: 'G', date: '2026-06-21', et: '21:00', home: 'NZL', away: 'EGY', venue: 'Estadio BC Place Vancouver' },
  { n: 39, group: 'H', date: '2026-06-21', et: '12:00', home: 'ESP', away: 'KSA', venue: 'Estadio Atlanta' },
  { n: 40, group: 'H', date: '2026-06-21', et: '18:00', home: 'URU', away: 'CPV', venue: 'Estadio Miami' },
  { n: 41, group: 'I', date: '2026-06-22', et: '17:00', home: 'FRA', away: 'IRQ', venue: 'Estadio Filadelfia' },
  { n: 42, group: 'I', date: '2026-06-22', et: '20:00', home: 'NOR', away: 'SEN', venue: 'Estadio Nueva York Nueva Jersey' },
  { n: 43, group: 'J', date: '2026-06-22', et: '13:00', home: 'ARG', away: 'AUT', venue: 'Estadio Dallas' },
  { n: 44, group: 'J', date: '2026-06-22', et: '23:00', home: 'JOR', away: 'ALG', venue: 'Estadio Bahía de San Francisco' },
  { n: 45, group: 'K', date: '2026-06-23', et: '13:00', home: 'POR', away: 'UZB', venue: 'Estadio Houston' },
  { n: 46, group: 'K', date: '2026-06-23', et: '22:00', home: 'COL', away: 'COD', venue: 'Estadio Guadalajara' },
  { n: 47, group: 'L', date: '2026-06-23', et: '16:00', home: 'ENG', away: 'GHA', venue: 'Estadio Boston' },
  { n: 48, group: 'L', date: '2026-06-23', et: '19:00', home: 'PAN', away: 'CRO', venue: 'Estadio Toronto' },
  { n: 49, group: 'A', date: '2026-06-24', et: '21:00', home: 'CZE', away: 'MEX', venue: 'Estadio Ciudad de México' },
  { n: 50, group: 'A', date: '2026-06-24', et: '21:00', home: 'RSA', away: 'KOR', venue: 'Estadio Monterrey' },
  { n: 51, group: 'B', date: '2026-06-24', et: '15:00', home: 'SUI', away: 'CAN', venue: 'Estadio BC Place Vancouver' },
  { n: 52, group: 'B', date: '2026-06-24', et: '15:00', home: 'BIH', away: 'QAT', venue: 'Estadio Seattle' },
  { n: 53, group: 'C', date: '2026-06-24', et: '18:00', home: 'BRA', away: 'SCO', venue: 'Estadio Miami' },
  { n: 54, group: 'C', date: '2026-06-24', et: '18:00', home: 'MAR', away: 'HAI', venue: 'Estadio Atlanta' },
  { n: 55, group: 'D', date: '2026-06-25', et: '22:00', home: 'TUR', away: 'USA', venue: 'Estadio Los Ángeles' },
  { n: 56, group: 'D', date: '2026-06-25', et: '22:00', home: 'PAR', away: 'AUS', venue: 'Estadio Bahía de San Francisco' },
  { n: 57, group: 'E', date: '2026-06-25', et: '16:00', home: 'CUW', away: 'CIV', venue: 'Estadio Filadelfia' },
  { n: 58, group: 'E', date: '2026-06-25', et: '16:00', home: 'ECU', away: 'GER', venue: 'Estadio Nueva York Nueva Jersey' },
  { n: 59, group: 'F', date: '2026-06-25', et: '19:00', home: 'JPN', away: 'SWE', venue: 'Estadio Dallas' },
  { n: 60, group: 'F', date: '2026-06-25', et: '19:00', home: 'TUN', away: 'NED', venue: 'Estadio Kansas City' },
  { n: 61, group: 'G', date: '2026-06-26', et: '23:00', home: 'EGY', away: 'IRN', venue: 'Estadio Seattle' },
  { n: 62, group: 'G', date: '2026-06-26', et: '23:00', home: 'NZL', away: 'BEL', venue: 'Estadio BC Place Vancouver' },
  { n: 63, group: 'H', date: '2026-06-26', et: '20:00', home: 'CPV', away: 'KSA', venue: 'Estadio Houston' },
  { n: 64, group: 'H', date: '2026-06-26', et: '20:00', home: 'URU', away: 'ESP', venue: 'Estadio Guadalajara' },
  { n: 65, group: 'I', date: '2026-06-26', et: '15:00', home: 'NOR', away: 'FRA', venue: 'Estadio Boston' },
  { n: 66, group: 'I', date: '2026-06-26', et: '15:00', home: 'SEN', away: 'IRQ', venue: 'Estadio Toronto' },
  { n: 67, group: 'J', date: '2026-06-27', et: '22:00', home: 'ALG', away: 'AUT', venue: 'Estadio Kansas City' },
  { n: 68, group: 'J', date: '2026-06-27', et: '22:00', home: 'JOR', away: 'ARG', venue: 'Estadio Dallas' },
  { n: 69, group: 'K', date: '2026-06-27', et: '19:30', home: 'COL', away: 'POR', venue: 'Estadio Miami' },
  { n: 70, group: 'K', date: '2026-06-27', et: '19:30', home: 'COD', away: 'UZB', venue: 'Estadio Atlanta' },
  { n: 71, group: 'L', date: '2026-06-27', et: '17:00', home: 'PAN', away: 'ENG', venue: 'Estadio Nueva York Nueva Jersey' },
  { n: 72, group: 'L', date: '2026-06-27', et: '17:00', home: 'CRO', away: 'GHA', venue: 'Estadio Filadelfia' },
];

export const demoMatches: Match[] = [
  ...groupMatches.map((match) => {
    const status = match.score ? 'FINAL' : 'SCHEDULED';
    const [homeScore, awayScore] = match.score ?? [null, null];
    const winnerTeamId = match.score && match.score[0] !== match.score[1] ? (match.score[0] > match.score[1] ? match.home : match.away) : null;

    return {
      id: `m${match.n}`,
      fifaMatchNumber: match.n,
      stage: 'GROUP',
      groupLetter: match.group,
      kickoffAt: kickoffAtEt(match.date, match.et),
      venue: match.venue,
      status,
      homeTeamId: match.home,
      awayTeamId: match.away,
      homeScore,
      awayScore,
      penaltiesHome: null,
      penaltiesAway: null,
      winnerTeamId,
      decidedBy: match.score ? 'NORMAL_TIME' : null,
    } satisfies Match;
  }),
  {
    id: 'm73',
    fifaMatchNumber: 73,
    stage: 'R32',
    groupLetter: null,
    kickoffAt: '2026-06-28T19:00:00.000Z',
    venue: 'Los Angeles',
    status: 'SCHEDULED',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    penaltiesHome: null,
    penaltiesAway: null,
    winnerTeamId: null,
    decidedBy: null,
  },
  {
    id: 'm104',
    fifaMatchNumber: 104,
    stage: 'FINAL',
    groupLetter: null,
    kickoffAt: '2026-07-19T19:00:00.000Z',
    venue: 'New York/New Jersey',
    status: 'SCHEDULED',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    penaltiesHome: null,
    penaltiesAway: null,
    winnerTeamId: null,
    decidedBy: null,
  },
];

export const demoPredictions: Array<{ matchId: string; home: number; away: number; points: number }> = [];

export const demoRanking: Array<{ position: number; name: string; matchPoints: number; specialPoints: number; totalPoints: number }> = [];

export function teamName(teamId: string | null): string {
  if (!teamId) return 'TBD';
  const shortName = demoTeams.find((team) => team.id === teamId)?.shortName ?? teamId;
  return withFlag(teamId, shortName);
}

export function teamFullName(teamId: string | null): string {
  if (!teamId) return 'TBD';
  const name = demoTeams.find((team) => team.id === teamId)?.name ?? teamId;
  return withFlag(teamId, name);
}

export function buildDemoGroupTables(): Partial<Record<GroupLetter, RankedTeam[]>> {
  const finalGroupMatches = demoMatches.filter((match): match is FinalGroupMatch => match.stage === 'GROUP' && match.status === 'FINAL');
  return GROUP_LETTERS.reduce<Partial<Record<GroupLetter, RankedTeam[]>>>((tables, groupLetter) => {
    const groupTeams = demoTeams.filter((team) => team.groupLetter === groupLetter);
    const groupFinalMatches = finalGroupMatches.filter((match) => match.groupLetter === groupLetter);
    tables[groupLetter] = rankGroup(groupTeams, groupFinalMatches);
    return tables;
  }, {});
}

export function buildDemoThirdPlaces(): RankedThirdPlace[] {
  const groups = buildDemoGroupTables();
  if (GROUP_LETTERS.some((groupLetter) => !groups[groupLetter]?.[2])) return [];
  return rankAllThirdPlaces(groups as Record<GroupLetter, RankedTeam[]>).slice(0, 8);
}
