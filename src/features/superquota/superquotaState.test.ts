import { describe, expect, it } from 'vitest';
import {
  effectiveSuperquotaPoints,
  getOpenSuperquotaMarkets,
  getResolvedSuperquotaMarkets,
  isMissingSuperquotaSchemaError,
} from './superquotaState';

const matches = [
  { id: 'early', kickoffAt: '2026-06-28T18:00:00Z' },
  { id: 'late', kickoffAt: '2026-06-28T21:00:00Z' },
];

describe('superquota state', () => {
  it('only exposes published markets before kickoff and orders them by kickoff', () => {
    const markets = [
      { id: 'late-market', match_id: 'late', status: 'PUBLISHED' as const },
      { id: 'draft-market', match_id: 'early', status: 'DRAFT' as const },
      { id: 'early-market', match_id: 'early', status: 'PUBLISHED' as const },
    ];

    expect(getOpenSuperquotaMarkets(markets, matches, Date.parse('2026-06-28T17:00:00Z')).map(({ id }) => id))
      .toEqual(['early-market', 'late-market']);
  });

  it('closes a market exactly at kickoff', () => {
    const markets = [{ id: 'market', match_id: 'early', status: 'PUBLISHED' as const }];
    expect(getOpenSuperquotaMarkets(markets, matches, Date.parse('2026-06-28T18:00:00Z'))).toEqual([]);
  });

  it('only returns resolved markets answered by the user, newest first and within the limit', () => {
    const markets = [
      { id: 'early-result', match_id: 'early', status: 'RESOLVED' as const },
      { id: 'late-result', match_id: 'late', status: 'RESOLVED' as const },
      { id: 'unanswered', match_id: 'late', status: 'RESOLVED' as const },
    ];

    expect(getResolvedSuperquotaMarkets(markets, matches, new Set(['early-result', 'late-result']), 1))
      .toEqual([markets[1]]);
  });

  it('uses option points when present, including zero, and otherwise uses the default', () => {
    expect(effectiveSuperquotaPoints(0, 3)).toBe(0);
    expect(effectiveSuperquotaPoints(5, 3)).toBe(5);
    expect(effectiveSuperquotaPoints(null, 3)).toBe(3);
  });

  it('distinguishes a missing migration from permission and validation errors', () => {
    expect(isMissingSuperquotaSchemaError({ code: 'PGRST205', message: 'table missing' })).toBe(true);
    expect(isMissingSuperquotaSchemaError({ code: '42883', message: 'function missing' })).toBe(true);
    expect(isMissingSuperquotaSchemaError({ message: 'Could not find superquota_markets in the schema cache' })).toBe(true);
    expect(isMissingSuperquotaSchemaError({ code: '42501', message: 'permission denied for superquota_markets' })).toBe(false);
    expect(isMissingSuperquotaSchemaError({ message: 'Superquota option is invalid' })).toBe(false);
  });
});
