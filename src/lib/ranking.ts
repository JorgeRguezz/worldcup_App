export function formatRankingPosition(position: number | undefined): string {
  if (!position) return '-';
  if (position === 1) return '👑 1';
  if (position === 2) return '🥈 2';
  if (position === 3) return '🥉 3';
  return `#${position}`;
}

export function isMissingSuperquotaRankingColumn(error: { code?: string; message?: string } | null): boolean {
  return Boolean(
    error &&
      (error.code === '42703' ||
        error.code === 'PGRST204' ||
        error.message?.includes('superquota_points')),
  );
}
