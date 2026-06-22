export function formatMadridDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(value));
}

export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return '-';
  return `${home}-${away}`;
}
