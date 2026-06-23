import { X } from 'lucide-react';
import { teamName } from '../data/demoTournament';
import type { Match } from '../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../lib/format';

type TeamProfileProps = {
  teamId: string;
  matches: Match[];
  onClose: () => void;
};

function isLocked(match: Match): boolean {
  return new Date(match.kickoffAt).getTime() <= Date.now();
}

export function TeamProfile({ teamId, matches, onClose }: TeamProfileProps) {
  const teamMatches = matches
    .filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
  const pastMatches = teamMatches.filter((match) => isLocked(match)).reverse();
  const futureMatches = teamMatches.filter((match) => !isLocked(match));

  return (
    <section className="team-profile table-card" aria-label={`Perfil de ${teamName(teamId)}`}>
      <div className="team-profile__header">
        <div>
          <p className="eyebrow">Perfil de equipo</p>
          <h2>{teamName(teamId)}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar perfil">
          <X size={18} />
        </button>
      </div>

      <div className="team-profile__columns">
        <section>
          <h3>Jugados</h3>
          {pastMatches.length > 0 ? (
            <div className="team-match-list">
              {pastMatches.map((match) => (
                <article className="team-match-row" key={match.id}>
                  <strong>
                    {teamName(match.homeTeamId)} vs {teamName(match.awayTeamId)}
                  </strong>
                  <span>{formatScore(match.homeScore, match.awayScore)}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">Todavía no ha jugado partidos.</p>
          )}
        </section>

        <section>
          <h3>Por jugar</h3>
          {futureMatches.length > 0 ? (
            <div className="team-match-list">
              {futureMatches.map((match) => (
                <article className="team-match-row" key={match.id}>
                  <strong>
                    {teamName(match.homeTeamId)} vs {teamName(match.awayTeamId)}
                  </strong>
                  <small>{formatMadridDateTime(match.kickoffAt)}</small>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No quedan partidos programados para este equipo.</p>
          )}
        </section>
      </div>
    </section>
  );
}
