import { CalendarClock } from 'lucide-react';
import { teamName } from '../data/demoTournament';
import type { Match } from '../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../lib/format';
import { StatusPill } from './StatusPill';

type MatchCardProps = {
  match: Match;
  prediction?: { home: number; away: number; points: number };
  predictionStatus?: 'draft' | 'modified' | 'saved';
  onTeamClick?: (teamId: string) => void;
};

function TeamLabel({
  teamId,
  onTeamClick,
}: {
  teamId: string | null;
  onTeamClick?: (teamId: string) => void;
}) {
  if (!teamId || !onTeamClick) return <strong>{teamName(teamId)}</strong>;

  return (
    <button className="team-link" type="button" onClick={() => onTeamClick(teamId)}>
      {teamName(teamId)}
    </button>
  );
}

export function MatchCard({ match, prediction, predictionStatus, onTeamClick }: MatchCardProps) {
  const isLocked = new Date(match.kickoffAt).getTime() <= Date.now();
  const tone = match.status === 'FINAL' ? 'good' : isLocked ? 'danger' : 'warn';
  const label = match.status === 'FINAL' ? 'Finalizado' : isLocked ? 'Bloqueada' : 'Disponible';
  const predictionLabel =
    predictionStatus === 'saved'
      ? 'Apuesta guardada'
      : predictionStatus === 'modified'
        ? 'Cambios sin guardar'
        : predictionStatus === 'draft'
          ? 'Lista para guardar'
          : 'Tu predicción';

  return (
    <article className="match-card">
      <div className="match-card__meta">
        <span>M{match.fifaMatchNumber}</span>
        <StatusPill tone={tone}>{label}</StatusPill>
      </div>
      <div className="match-card__teams">
        <TeamLabel teamId={match.homeTeamId} onTeamClick={onTeamClick} />
        <span>{formatScore(match.homeScore, match.awayScore)}</span>
        <TeamLabel teamId={match.awayTeamId} onTeamClick={onTeamClick} />
      </div>
      <div className="match-card__time">
        <CalendarClock size={16} />
        <span>{formatMadridDateTime(match.kickoffAt)}</span>
      </div>
      {prediction ? (
        <div className={`match-card__prediction${predictionStatus ? ` match-card__prediction--${predictionStatus}` : ''}`}>
          {predictionLabel}: {prediction.home}-{prediction.away}
          {match.status === 'FINAL' ? ` · ${prediction.points} pts` : ''}
        </div>
      ) : (
        <div className="match-card__prediction">Sin apuesta guardada</div>
      )}
    </article>
  );
}
