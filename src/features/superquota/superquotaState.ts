import type { SuperquotaMarketStatus } from './types';

type MatchTiming = {
  id: string;
  kickoffAt: string;
};

type MarketTiming = {
  id: string;
  match_id: string;
  status: SuperquotaMarketStatus;
};

export function isMissingSuperquotaSchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code ?? '')) return true;

  const message = error.message?.toLocaleLowerCase() ?? '';
  const referencesSuperquota = message.includes('superquota');
  const reportsMissingResource =
    message.includes('could not find') ||
    message.includes('does not exist') ||
    message.includes('schema cache');

  return referencesSuperquota && reportsMissingResource;
}

function kickoffTime(market: MarketTiming, matchesById: Map<string, MatchTiming>): number {
  const kickoffAt = matchesById.get(market.match_id)?.kickoffAt;
  return kickoffAt ? new Date(kickoffAt).getTime() : Number.NaN;
}

export function getOpenSuperquotaMarkets<T extends MarketTiming>(markets: T[], matches: MatchTiming[], now: number): T[] {
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  return markets
    .filter((market) => market.status === 'PUBLISHED' && kickoffTime(market, matchesById) > now)
    .sort((a, b) => kickoffTime(a, matchesById) - kickoffTime(b, matchesById));
}

export function getResolvedSuperquotaMarkets<T extends MarketTiming>(
  markets: T[],
  matches: MatchTiming[],
  predictionMarketIds: ReadonlySet<string>,
  limit = 6,
): T[] {
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  return markets
    .filter((market) => market.status === 'RESOLVED' && predictionMarketIds.has(market.id))
    .sort((a, b) => kickoffTime(b, matchesById) - kickoffTime(a, matchesById))
    .slice(0, limit);
}

export function effectiveSuperquotaPoints(optionPoints: number | null, defaultPoints: number): number {
  return optionPoints ?? defaultPoints;
}
