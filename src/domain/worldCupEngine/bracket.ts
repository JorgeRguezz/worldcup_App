import type { Match, TeamId } from './types';

export type SlotSource = {
  matchNumber: number;
  side: 'HOME' | 'AWAY';
  sourceType: 'MATCH_WINNER' | 'MATCH_LOSER';
  sourceMatchNumber: number;
};

export const KNOCKOUT_DEPENDENCIES: SlotSource[] = [
  { matchNumber: 89, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 74 },
  { matchNumber: 89, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 77 },
  { matchNumber: 90, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 73 },
  { matchNumber: 90, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 75 },
  { matchNumber: 91, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 76 },
  { matchNumber: 91, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 78 },
  { matchNumber: 92, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 79 },
  { matchNumber: 92, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 80 },
  { matchNumber: 93, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 83 },
  { matchNumber: 93, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 84 },
  { matchNumber: 94, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 81 },
  { matchNumber: 94, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 82 },
  { matchNumber: 95, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 86 },
  { matchNumber: 95, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 88 },
  { matchNumber: 96, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 85 },
  { matchNumber: 96, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 87 },
  { matchNumber: 97, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 89 },
  { matchNumber: 97, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 90 },
  { matchNumber: 98, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 93 },
  { matchNumber: 98, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 94 },
  { matchNumber: 99, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 91 },
  { matchNumber: 99, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 92 },
  { matchNumber: 100, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 95 },
  { matchNumber: 100, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 96 },
  { matchNumber: 101, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 97 },
  { matchNumber: 101, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 98 },
  { matchNumber: 102, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 99 },
  { matchNumber: 102, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 100 },
  { matchNumber: 103, side: 'HOME', sourceType: 'MATCH_LOSER', sourceMatchNumber: 101 },
  { matchNumber: 103, side: 'AWAY', sourceType: 'MATCH_LOSER', sourceMatchNumber: 102 },
  { matchNumber: 104, side: 'HOME', sourceType: 'MATCH_WINNER', sourceMatchNumber: 101 },
  { matchNumber: 104, side: 'AWAY', sourceType: 'MATCH_WINNER', sourceMatchNumber: 102 },
];

export function getLoserTeamId(match: Match): TeamId | null {
  if (!match.homeTeamId || !match.awayTeamId || !match.winnerTeamId) return null;
  return match.winnerTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
}

export function resolveDependentSlots(matches: Match[]): Match[] {
  const byNumber = new Map(matches.map((match) => [match.fifaMatchNumber, match]));

  return matches.map((match) => {
    const dependencies = KNOCKOUT_DEPENDENCIES.filter((dependency) => dependency.matchNumber === match.fifaMatchNumber);
    if (dependencies.length === 0) return match;

    let homeTeamId = match.homeTeamId;
    let awayTeamId = match.awayTeamId;
    dependencies.forEach((dependency) => {
      const source = byNumber.get(dependency.sourceMatchNumber);
      if (!source || source.status !== 'FINAL') return;
      const resolved = dependency.sourceType === 'MATCH_WINNER' ? source.winnerTeamId : getLoserTeamId(source);
      if (dependency.side === 'HOME') homeTeamId = resolved;
      else awayTeamId = resolved;
    });
    return { ...match, homeTeamId, awayTeamId };
  });
}
