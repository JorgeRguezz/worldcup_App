export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

export type GroupLetter = (typeof GROUP_LETTERS)[number];

export type TeamId = string;

export type Stage =
  | 'GROUP'
  | 'R32'
  | 'R16'
  | 'QF'
  | 'SF'
  | 'THIRD_PLACE'
  | 'FINAL';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINAL';
export type DecidedBy = 'NORMAL_TIME' | 'EXTRA_TIME' | 'PENALTIES';
export type Outcome = 'HOME' | 'DRAW' | 'AWAY';

export type Team = {
  id: TeamId;
  name: string;
  shortName: string;
  fifaCode: string;
  groupLetter: GroupLetter;
  drawPosition: number;
  fifaRankingOrder: number;
  teamConductScore?: number;
};

export type Match = {
  id: string;
  fifaMatchNumber: number;
  stage: Stage;
  groupLetter: GroupLetter | null;
  kickoffAt: string;
  venue: string;
  status: MatchStatus;
  homeTeamId: TeamId | null;
  awayTeamId: TeamId | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  winnerTeamId: TeamId | null;
  decidedBy: DecidedBy | null;
};

export type FinalGroupMatch = Match & {
  stage: 'GROUP';
  groupLetter: GroupLetter;
  status: 'FINAL';
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number;
  awayScore: number;
};

export type RankedTeam = {
  team: Team;
  rank: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  teamConductScore: number;
};

export type RankedThirdPlace = RankedTeam & {
  groupLetter: GroupLetter;
};

export type ThirdPlaceCombination = {
  qualifyingGroupsKey: string;
  for1A: GroupLetter;
  for1B: GroupLetter;
  for1D: GroupLetter;
  for1E: GroupLetter;
  for1G: GroupLetter;
  for1I: GroupLetter;
  for1K: GroupLetter;
  for1L: GroupLetter;
  sourceOption: number;
};

export type RoundOf32ThirdPlaceMap = Record<'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87', TeamId>;

export type ScorePrediction = {
  home: number;
  away: number;
};

export type KnockoutPrediction = ScorePrediction & {
  advancingTeamId: TeamId;
};

export type ScoreResult = ScorePrediction;

export type KnockoutResult = ScoreResult & {
  winnerTeamId: TeamId;
};
