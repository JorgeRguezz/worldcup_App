import { describe, expect, it } from 'vitest';
import { formatRankingPosition, isMissingSuperquotaRankingColumn } from './ranking';

describe('ranking helpers', () => {
  it('formats podium and regular positions', () => {
    expect(formatRankingPosition(1)).toBe('👑 1');
    expect(formatRankingPosition(4)).toBe('#4');
    expect(formatRankingPosition(undefined)).toBe('-');
  });

  it('only treats the missing superquota column as a compatibility error', () => {
    expect(isMissingSuperquotaRankingColumn({ code: '42703', message: 'column superquota_points does not exist' })).toBe(true);
    expect(isMissingSuperquotaRankingColumn({ code: 'PGRST204', message: 'superquota_points missing from schema cache' })).toBe(true);
    expect(isMissingSuperquotaRankingColumn({ code: '42501', message: 'permission denied' })).toBe(false);
    expect(isMissingSuperquotaRankingColumn(null)).toBe(false);
  });
});
