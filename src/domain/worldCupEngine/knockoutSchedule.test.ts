import { describe, expect, it } from 'vitest';
import { KNOCKOUT_SCHEDULE } from './knockoutSchedule';

describe('KNOCKOUT_SCHEDULE', () => {
  it('contains every knockout match exactly once', () => {
    expect(KNOCKOUT_SCHEDULE).toHaveLength(32);
    expect(KNOCKOUT_SCHEDULE.map((match) => match.fifaMatchNumber).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 32 }, (_, index) => index + 73),
    );
  });

  it('contains the confirmed participants and kickoff for the opening match', () => {
    expect(KNOCKOUT_SCHEDULE.find((match) => match.fifaMatchNumber === 73)).toMatchObject({
      kickoffAt: '2026-06-28T19:00:00.000Z',
      homeTeamId: 'RSA',
      awayTeamId: 'CAN',
    });
  });

  it('has valid, chronologically bounded UTC kickoffs', () => {
    const kickoffs = KNOCKOUT_SCHEDULE.map((match) => Date.parse(match.kickoffAt));
    expect(kickoffs.every(Number.isFinite)).toBe(true);
    expect(Math.min(...kickoffs)).toBe(Date.parse('2026-06-28T19:00:00.000Z'));
    expect(Math.max(...kickoffs)).toBe(Date.parse('2026-07-19T19:00:00.000Z'));
  });
});
