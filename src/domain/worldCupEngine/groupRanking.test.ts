import { describe, expect, it } from 'vitest';
import { rankAllThirdPlaces, rankGroup } from './groupRanking';
import type { FinalGroupMatch, GroupLetter, RankedTeam, Team } from './types';

function team(id: string, rank: number, conduct = 0): Team {
  return {
    id,
    name: id,
    shortName: id,
    fifaCode: id,
    groupLetter: 'A',
    drawPosition: rank,
    fifaRankingOrder: rank,
    teamConductScore: conduct,
  };
}

function match(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number): FinalGroupMatch {
  return {
    id: `${homeTeamId}-${awayTeamId}`,
    fifaMatchNumber: 1,
    stage: 'GROUP',
    groupLetter: 'A',
    kickoffAt: '2026-06-11T19:00:00.000Z',
    venue: '',
    status: 'FINAL',
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    penaltiesHome: null,
    penaltiesAway: null,
    winnerTeamId: homeScore === awayScore ? null : homeScore > awayScore ? homeTeamId : awayTeamId,
    decidedBy: 'NORMAL_TIME',
  };
}

describe('group ranking', () => {
  it('resolves two tied teams by head-to-head', () => {
    const teams = [team('A1', 1), team('A2', 2), team('A3', 3), team('A4', 4)];
    const ranked = rankGroup(teams, [
      match('A2', 'A1', 1, 0),
      match('A1', 'A3', 2, 0),
      match('A1', 'A4', 2, 0),
      match('A2', 'A3', 2, 0),
      match('A2', 'A4', 1, 0),
      match('A3', 'A4', 1, 0),
    ]);

    expect(ranked.map((row) => row.team.id).slice(0, 2)).toEqual(['A2', 'A1']);
  });

  it('uses overall goal difference after an unresolved mini-league', () => {
    const teams = [team('A1', 1), team('A2', 2), team('A3', 3), team('A4', 4)];
    const ranked = rankGroup(teams, [
      match('A1', 'A2', 1, 0),
      match('A2', 'A3', 1, 0),
      match('A3', 'A1', 1, 0),
      match('A1', 'A4', 5, 0),
      match('A2', 'A4', 2, 0),
      match('A3', 'A4', 1, 0),
    ]);

    expect(ranked.map((row) => row.team.id).slice(0, 3)).toEqual(['A1', 'A2', 'A3']);
  });

  it('keeps one standings row per team when teams are tied on points', () => {
    const teams = [team('A1', 1), team('A2', 2), team('A3', 3), team('A4', 4)];
    const ranked = rankGroup(teams, [
      match('A1', 'A2', 2, 0),
      match('A3', 'A4', 1, 1),
    ]);

    expect(ranked).toHaveLength(4);
    expect(new Set(ranked.map((row) => row.team.id)).size).toBe(4);
    expect(ranked.map((row) => row.rank)).toEqual([1, 2, 3, 4]);
  });

  it('orders third places without cross-group head-to-head', () => {
    const third = (groupLetter: GroupLetter, points: number, goalDifference: number): RankedTeam[] => [
      { team: team(`${groupLetter}1`, 1), rank: 1, played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 7, teamConductScore: 0 },
      { team: team(`${groupLetter}2`, 2), rank: 2, played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 4, teamConductScore: 0 },
      { team: team(`${groupLetter}3`, 3), rank: 3, played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 3 - goalDifference, goalDifference, points, teamConductScore: 0 },
      { team: team(`${groupLetter}4`, 4), rank: 4, played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 6, goalDifference: -5, points: 0, teamConductScore: 0 },
    ];

    const groups = Object.fromEntries(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((letter, index) => [
        letter,
        third(letter as GroupLetter, index === 1 ? 5 : 3, index === 2 ? 4 : 0),
      ]),
    ) as Record<GroupLetter, RankedTeam[]>;

    const ranked = rankAllThirdPlaces(groups);
    expect(ranked[0].groupLetter).toBe('B');
    expect(ranked[1].groupLetter).toBe('C');
    expect(ranked).toHaveLength(12);
  });
});
