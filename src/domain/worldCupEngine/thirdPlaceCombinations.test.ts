import { describe, expect, it } from 'vitest';
import { exampleThirdPlaceCombination, resolveRoundOf32ThirdPlaces, validateThirdPlaceCombinations } from './thirdPlaceCombinations';
import type { RankedThirdPlace, Team } from './types';

function third(groupLetter: string): RankedThirdPlace {
  const team: Team = {
    id: `team-${groupLetter}`,
    name: `Team ${groupLetter}`,
    shortName: groupLetter,
    fifaCode: groupLetter,
    groupLetter: groupLetter as Team['groupLetter'],
    drawPosition: 3,
    fifaRankingOrder: 1,
  };

  return {
    team,
    groupLetter: groupLetter as RankedThirdPlace['groupLetter'],
    rank: 3,
    played: 3,
    wins: 1,
    draws: 0,
    losses: 2,
    goalsFor: 3,
    goalsAgainst: 4,
    goalDifference: -1,
    points: 3,
    teamConductScore: 0,
  };
}

describe('third-place combinations', () => {
  it('validates the documented EFGHIJKL example row', () => {
    expect(validateThirdPlaceCombinations([exampleThirdPlaceCombination], false)).toEqual([]);
  });

  it('requires 495 rows when validating a complete seed', () => {
    expect(validateThirdPlaceCombinations([exampleThirdPlaceCombination], true)).toContain(
      'La semilla debe tener 495 filas; tiene 1',
    );
  });

  it('resolves round of 32 third-place teams from the FIFA row', () => {
    const result = resolveRoundOf32ThirdPlaces(
      ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(third),
      [exampleThirdPlaceCombination],
    );

    expect(result).toEqual({
      M79: 'team-E',
      M85: 'team-J',
      M81: 'team-I',
      M74: 'team-F',
      M82: 'team-H',
      M77: 'team-G',
      M87: 'team-L',
      M80: 'team-K',
    });
  });
});
