import type { Match } from '../domain/worldCupEngine';

export const SPECIAL_PREDICTION_POINTS = {
  champion: 30,
  bestPlayer: 20,
  topScorer: 12,
  topAssist: 12,
} as const;

export const SPECIAL_PREDICTION_TOTAL_POINTS =
  SPECIAL_PREDICTION_POINTS.champion +
  SPECIAL_PREDICTION_POINTS.bestPlayer +
  SPECIAL_PREDICTION_POINTS.topScorer +
  SPECIAL_PREDICTION_POINTS.topAssist;

export type SpecialPredictionRow = {
  user_id: string;
  champion_team_id: string;
  best_player_name: string;
  top_scorer_player_name: string;
  top_assist_player_name: string;
  champion_points_awarded: number;
  best_player_points_awarded: number;
  top_scorer_points_awarded: number;
  top_assist_points_awarded: number;
  points_awarded: number;
  updated_at: string;
};

export type VisibleSpecialPredictionRow = SpecialPredictionRow & {
  display_name: string;
};

const FALLBACK_SPECIAL_DEADLINE = '2026-06-28T04:00:00.000Z';
const GROUP_MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function getSpecialPredictionDeadline(matches: Pick<Match, 'stage' | 'kickoffAt'>[]): Date {
  const lastGroupKickoff = matches
    .filter((match) => match.stage === 'GROUP')
    .map((match) => new Date(match.kickoffAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  return new Date((lastGroupKickoff ?? new Date(FALLBACK_SPECIAL_DEADLINE).getTime() - GROUP_MATCH_DURATION_MS) + GROUP_MATCH_DURATION_MS);
}

export function isSpecialPredictionClosed(matches: Pick<Match, 'stage' | 'kickoffAt'>[], now = Date.now()): boolean {
  return now >= getSpecialPredictionDeadline(matches).getTime();
}

export function formatCountdown(deadline: Date, now = Date.now()): string {
  const remainingMs = Math.max(0, deadline.getTime() - now);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export function normalizeOption(value: string): string {
  return value.trim().toLocaleLowerCase('es-ES');
}

export function isExactOption(value: string, options: string[]): boolean {
  const normalizedValue = normalizeOption(value);
  return options.some((option) => normalizeOption(option) === normalizedValue);
}

export function isMissingSpecialPredictionSchemaError(error: { code?: string; message?: string } | null): boolean {
  return Boolean(
    error &&
      (error.code === 'PGRST202' ||
        error.code === 'PGRST204' ||
        error.message?.includes('best_player_name') ||
        error.message?.includes('top_assist_player_name') ||
        error.message?.includes('visible_special_predictions') ||
        error.message?.includes('admin_set_official_awards') ||
        error.message?.includes("Could not find the table 'public.special_predictions'")),
  );
}
