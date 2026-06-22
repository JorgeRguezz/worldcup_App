import { CalendarClock } from 'lucide-react';
import { teamName } from '../data/demoTournament';
import type { Match } from '../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../lib/format';
import { StatusPill } from './StatusPill';

type MatchCardProps = {
  match: Match;
  prediction?: { home: number; away: number; points: number };
  predictionStatus?: 'draft' | 'modified' | 'saved';
  predictionResult?: 'correct' | 'miss';
  glow?: 'locked' | 'missing' | 'modifiable' | 'saved' | 'available';
  hideStatusPill?: boolean;
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

export function MatchCard({ match, prediction, predictionStatus, predictionResult, glow, hideStatusPill = false, onTeamClick }: MatchCardProps) {
  const isLocked = new Date(match.kickoffAt).getTime() <= Date.now();
  const tone = match.status === 'FINAL' ? 'good' : isLocked ? 'danger' : 'warn';
  const label = match.status === 'FINAL' ? 'Finalizado' : isLocked ? 'Bloqueada' : 'Disponible';
  const glowLabel = glow === 'locked' ? 'En juego' : glow === 'missing' ? 'Disponible' : glow === 'modifiable' ? 'Modificable' : null;
  const predictionLabel =
    predictionStatus === 'saved'
      ? 'Apuesta guardada'
      : predictionStatus === 'modified'
        ? 'Cambios sin guardar'
        : predictionStatus === 'draft'
          ? 'Lista para guardar'
          : 'Tu predicción';

  return (
    <article className={`match-card${glow ? ` match-card--glow-${glow}` : ''}`}>
      <div className="match-card__meta">
        <span>M{match.fifaMatchNumber}</span>
        {hideStatusPill ? (
          glowLabel ? (
            <span className={`match-card__state match-card__state--${glow}`}>
              {glow === 'locked' ? <span className="match-card__state-dot" /> : null}
              {glowLabel}
            </span>
          ) : null
        ) : (
          <StatusPill tone={tone}>{label}</StatusPill>
        )}
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
        <div
          className={`match-card__prediction${predictionStatus ? ` match-card__prediction--${predictionStatus}` : ''}${
            predictionResult ? ` match-card__prediction--${predictionResult}` : ''
          }`}
        >
          {predictionLabel}: {prediction.home}-{prediction.away}
          {match.status === 'FINAL' ? ` · ${prediction.points} pts` : ''}
        </div>
      ) : (
        <div className="match-card__prediction">Sin apuesta guardada</div>
      )}
    </article>
  );
}
