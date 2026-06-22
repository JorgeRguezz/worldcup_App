import type { KnockoutPrediction, KnockoutResult, ScorePrediction, ScoreResult, Stage } from './types';

export const KNOCKOUT_SCORE_RULES: Record<Exclude<Stage, 'GROUP'>, { exact: number; winner: number }> = {
  R32: { exact: 6, winner: 2 },
  R16: { exact: 9, winner: 3 },
  QF: { exact: 12, winner: 4 },
  SF: { exact: 15, winner: 5 },
  THIRD_PLACE: { exact: 15, winner: 5 },
  FINAL: { exact: 30, winner: 10 },
};

export function compareOutcome(home: number, away: number): 'HOME' | 'DRAW' | 'AWAY' {
  if (home > away) return 'HOME';
  if (away > home) return 'AWAY';
  return 'DRAW';
}

export function getGroupPredictionPoints(prediction: ScorePrediction, actual: ScoreResult): number {
  if (prediction.home === actual.home && prediction.away === actual.away) return 3;
  return compareOutcome(prediction.home, prediction.away) === compareOutcome(actual.home, actual.away) ? 1 : 0;
}

export function getKnockoutPredictionPoints(
  prediction: KnockoutPrediction,
  actual: KnockoutResult,
  stage: Exclude<Stage, 'GROUP'>,
): number {
  const rule = KNOCKOUT_SCORE_RULES[stage];
  const exactScore = prediction.home === actual.home && prediction.away === actual.away;
  if (exactScore) return rule.exact;
  return prediction.advancingTeamId === actual.winnerTeamId ? rule.winner : 0;
}

export function inferAdvancingTeamId(
  prediction: ScorePrediction,
  homeTeamId: string,
  awayTeamId: string,
  selectedAdvancingTeamId?: string,
): string {
  const outcome = compareOutcome(prediction.home, prediction.away);
  if (outcome === 'HOME') return homeTeamId;
  if (outcome === 'AWAY') return awayTeamId;
  if (!selectedAdvancingTeamId) {
    throw new Error('Un empate en eliminatoria necesita seleccionar el equipo que avanza');
  }
  if (![homeTeamId, awayTeamId].includes(selectedAdvancingTeamId)) {
    throw new Error('El equipo que avanza debe ser uno de los dos participantes');
  }
  return selectedAdvancingTeamId;
}
