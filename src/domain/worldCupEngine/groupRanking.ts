import type { FinalGroupMatch, GroupLetter, RankedTeam, RankedThirdPlace, Team, TeamId } from './types';

type TeamStats = Omit<RankedTeam, 'rank'>;

function createStats(team: Team): TeamStats {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    teamConductScore: team.teamConductScore ?? 0,
  };
}

function applyMatch(stats: Map<TeamId, TeamStats>, match: FinalGroupMatch): void {
  const home = stats.get(match.homeTeamId);
  const away = stats.get(match.awayTeamId);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.goalsFor += match.homeScore;
  home.goalsAgainst += match.awayScore;
  away.goalsFor += match.awayScore;
  away.goalsAgainst += match.homeScore;

  if (match.homeScore > match.awayScore) {
    home.wins += 1;
    home.points += 3;
    away.losses += 1;
  } else if (match.awayScore > match.homeScore) {
    away.wins += 1;
    away.points += 3;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
    home.points += 1;
    away.points += 1;
  }

  home.goalDifference = home.goalsFor - home.goalsAgainst;
  away.goalDifference = away.goalsFor - away.goalsAgainst;
}

function headToHeadStats(teams: TeamStats[], matches: FinalGroupMatch[]): Map<TeamId, Pick<TeamStats, 'points' | 'goalsFor' | 'goalDifference'>> {
  const teamIds = new Set(teams.map((item) => item.team.id));
  const stats = new Map<TeamId, Pick<TeamStats, 'points' | 'goalsFor' | 'goalDifference'>>();
  teams.forEach((item) => stats.set(item.team.id, { points: 0, goalsFor: 0, goalDifference: 0 }));

  matches
    .filter((match) => teamIds.has(match.homeTeamId) && teamIds.has(match.awayTeamId))
    .forEach((match) => {
      const home = stats.get(match.homeTeamId)!;
      const away = stats.get(match.awayTeamId)!;

      home.goalsFor += match.homeScore;
      away.goalsFor += match.awayScore;
      home.goalDifference += match.homeScore - match.awayScore;
      away.goalDifference += match.awayScore - match.homeScore;

      if (match.homeScore > match.awayScore) home.points += 3;
      else if (match.awayScore > match.homeScore) away.points += 3;
      else {
        home.points += 1;
        away.points += 1;
      }
    });

  return stats;
}

function splitByCriterion<T>(items: T[], value: (item: T) => number): T[][] {
  const sorted = [...items].sort((a, b) => value(b) - value(a));
  const blocks: T[][] = [];
  sorted.forEach((item) => {
    const last = blocks.at(-1);
    if (!last || value(last[0]) !== value(item)) blocks.push([item]);
    else last.push(item);
  });
  return blocks;
}

function resolveHeadToHead(tied: TeamStats[], matches: FinalGroupMatch[]): TeamStats[] {
  if (tied.length <= 1) return tied;
  const h2h = headToHeadStats(tied, matches);
  let blocks = [tied];

  (['points', 'goalDifference', 'goalsFor'] as const).forEach((criterion) => {
    blocks = blocks.flatMap((block) => {
      if (block.length <= 1) return [block];
      return splitByCriterion(block, (item) => h2h.get(item.team.id)![criterion]);
    });
  });

  return blocks.flatMap((block) => (block.length > 1 ? resolveRemainingTie(block, matches) : block));
}

function resolveRemainingTie(tied: TeamStats[], matches: FinalGroupMatch[]): TeamStats[] {
  let blocks = [tied];
  const criteria = [
    (item: TeamStats) => item.goalDifference,
    (item: TeamStats) => item.goalsFor,
    (item: TeamStats) => item.teamConductScore,
    (item: TeamStats) => -item.team.fifaRankingOrder,
  ];

  criteria.forEach((criterion) => {
    blocks = blocks.flatMap((block) => (block.length <= 1 ? [block] : splitByCriterion(block, criterion)));
  });

  return blocks.flatMap((block) => (block.length > 1 ? [...block].sort((a, b) => a.team.name.localeCompare(b.team.name)) : block));
}

function rankEqualPointBlock(block: TeamStats[], matches: FinalGroupMatch[]): TeamStats[] {
  if (block.length <= 1) return block;
  return resolveHeadToHead(block, matches);
}

export function rankGroup(teams: Team[], matches: FinalGroupMatch[]): RankedTeam[] {
  const stats = new Map<TeamId, TeamStats>();
  teams.forEach((team) => stats.set(team.id, createStats(team)));
  matches.forEach((match) => applyMatch(stats, match));

  const byPoints = splitByCriterion([...stats.values()], (item) => item.points);
  const ranked = byPoints.flatMap((block) => rankEqualPointBlock(block, matches));

  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
}

export function rankAllThirdPlaces(groups: Record<GroupLetter, RankedTeam[]>): RankedThirdPlace[] {
  const thirds = Object.entries(groups).map(([groupLetter, ranked]) => ({
    ...ranked[2],
    groupLetter: groupLetter as GroupLetter,
  }));

  return thirds
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.teamConductScore !== a.teamConductScore) return b.teamConductScore - a.teamConductScore;
      return a.team.fifaRankingOrder - b.team.fifaRankingOrder;
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
