import { describe, expect, it } from 'vitest';
import { getGroupPredictionPoints, getKnockoutPredictionPoints, inferAdvancingTeamId } from './scoring';

describe('prediction scoring', () => {
  it('scores group predictions as exact, outcome, or miss', () => {
    expect(getGroupPredictionPoints({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(3);
    expect(getGroupPredictionPoints({ home: 1, away: 0 }, { home: 2, away: 1 })).toBe(1);
    expect(getGroupPredictionPoints({ home: 1, away: 1 }, { home: 2, away: 1 })).toBe(0);
  });

  it('scores knockout exact score before winner-only points', () => {
    expect(
      getKnockoutPredictionPoints(
        { home: 1, away: 1, advancingTeamId: 'away' },
        { home: 1, away: 1, winnerTeamId: 'home' },
        'FINAL',
      ),
    ).toBe(24);
  });

  it('scores knockout advancing team by stage', () => {
    expect(
      getKnockoutPredictionPoints(
        { home: 2, away: 1, advancingTeamId: 'home' },
        { home: 3, away: 2, winnerTeamId: 'home' },
        'R32',
      ),
    ).toBe(2);
  });

  it('requires an advancing team for predicted knockout draws', () => {
    expect(() => inferAdvancingTeamId({ home: 1, away: 1 }, 'home', 'away')).toThrow(
      'Un empate en eliminatoria',
    );
    expect(inferAdvancingTeamId({ home: 1, away: 1 }, 'home', 'away', 'away')).toBe('away');
  });
});
