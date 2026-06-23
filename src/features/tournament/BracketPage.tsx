import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { demoMatches, demoTeams } from '../../data/demoTournament';
import { flagForTeamId } from '../../data/teamFlags';
import type { MatchStatus, Stage, TeamId } from '../../domain/worldCupEngine';
import { formatMadridDateTime } from '../../lib/format';

const stages = [
  { id: 'R32', label: 'Dieciseisavos' },
  { id: 'R16', label: 'Octavos' },
  { id: 'QF', label: 'Cuartos' },
  { id: 'SF', label: 'Semifinales' },
  { id: 'FINAL', label: 'Final' },
] as const satisfies ReadonlyArray<{ id: Stage; label: string }>;

type BracketStage = (typeof stages)[number];
type DisplayStage = BracketStage['id'];
type MatchSide = 'home' | 'away';

type BracketDisplayMatch = {
  key: string;
  stage: DisplayStage;
  kickoffAt: string | null;
  venue: string;
  status: MatchStatus;
  homeTeamId: TeamId | null;
  awayTeamId: TeamId | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: TeamId | null;
  homeSourceLabel: string;
  awaySourceLabel: string;
};

const roundOf32Sources: Record<number, { home: string; away: string }> = {
  73: { home: 'Segundo Grupo A', away: 'Segundo Grupo B' },
  74: { home: 'Ganador Grupo E', away: 'Mejor tercero asignado' },
  75: { home: 'Ganador Grupo F', away: 'Segundo Grupo C' },
  76: { home: 'Ganador Grupo C', away: 'Segundo Grupo F' },
  77: { home: 'Ganador Grupo I', away: 'Mejor tercero asignado' },
  78: { home: 'Segundo Grupo E', away: 'Segundo Grupo I' },
  79: { home: 'Ganador Grupo A', away: 'Mejor tercero asignado' },
  80: { home: 'Ganador Grupo L', away: 'Mejor tercero asignado' },
  81: { home: 'Ganador Grupo D', away: 'Mejor tercero asignado' },
  82: { home: 'Ganador Grupo G', away: 'Mejor tercero asignado' },
  83: { home: 'Segundo Grupo K', away: 'Segundo Grupo L' },
  84: { home: 'Ganador Grupo H', away: 'Segundo Grupo J' },
  85: { home: 'Ganador Grupo B', away: 'Mejor tercero asignado' },
  86: { home: 'Ganador Grupo J', away: 'Segundo Grupo H' },
  87: { home: 'Ganador Grupo K', away: 'Mejor tercero asignado' },
  88: { home: 'Segundo Grupo D', away: 'Segundo Grupo G' },
};

const placeholderCounts: Record<DisplayStage, number> = {
  R32: 16,
  R16: 8,
  QF: 4,
  SF: 2,
  FINAL: 1,
};

const placeholderLabels: Record<DisplayStage, { home: string; away: string }> = {
  R32: { home: 'Por definir', away: 'Por definir' },
  R16: { home: 'Ganador de dieciseisavos', away: 'Ganador de dieciseisavos' },
  QF: { home: 'Ganador de octavos', away: 'Ganador de octavos' },
  SF: { home: 'Ganador de cuartos', away: 'Ganador de cuartos' },
  FINAL: { home: 'Ganador semifinal 1', away: 'Ganador semifinal 2' },
};

function placeholderMatch(stage: DisplayStage, index: number): BracketDisplayMatch {
  const fifaMatchNumber = stage === 'R32' ? 73 + index : null;
  const sources = fifaMatchNumber ? roundOf32Sources[fifaMatchNumber] : placeholderLabels[stage];

  return {
    key: `${stage}-${index}`,
    stage,
    kickoffAt: null,
    venue: '',
    status: 'SCHEDULED',
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    winnerTeamId: null,
    homeSourceLabel: sources.home,
    awaySourceLabel: sources.away,
  };
}

function toDisplayMatch(match: (typeof demoMatches)[number]): BracketDisplayMatch {
  const source = match.stage === 'R32' ? roundOf32Sources[match.fifaMatchNumber] : null;
  const labels = source ?? placeholderLabels[match.stage as DisplayStage] ?? { home: 'Por definir', away: 'Por definir' };

  return {
    key: match.id,
    stage: match.stage as DisplayStage,
    kickoffAt: match.kickoffAt,
    venue: match.venue,
    status: match.status,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winnerTeamId: match.winnerTeamId,
    homeSourceLabel: labels.home,
    awaySourceLabel: labels.away,
  };
}

function buildRoundMatches(stage: DisplayStage): BracketDisplayMatch[] {
  const placeholders = Array.from({ length: placeholderCounts[stage] }, (_, index) => placeholderMatch(stage, index));
  const realMatches = demoMatches.filter((match) => match.stage === stage).map(toDisplayMatch);
  const matchesByNumber = new Map(realMatches.map((match) => [match.key, match]));

  return placeholders.map((placeholder, index) => {
    const real = realMatches[index] ?? matchesByNumber.get(placeholder.key);
    return real ?? placeholder;
  });
}

function teamLabel(teamId: TeamId | null): string {
  if (!teamId) return 'Por definir';
  return demoTeams.find((team) => team.id === teamId)?.name ?? teamId;
}

function teamDisplay(match: BracketDisplayMatch, side: MatchSide) {
  const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
  return {
    flag: flagForTeamId(teamId),
    label: teamId ? teamLabel(teamId) : side === 'home' ? match.homeSourceLabel : match.awaySourceLabel,
    score: side === 'home' ? match.homeScore : match.awayScore,
    teamId,
  };
}

function statusLabel(match: BracketDisplayMatch): string {
  if (match.status === 'FINAL' && match.winnerTeamId) return `${teamLabel(match.winnerTeamId)} avanza`;
  if (match.homeTeamId && match.awayTeamId) return 'Completo';
  if (match.stage === 'R32') return 'Pendiente de grupos y mejores terceros';
  return 'Pendiente de ronda anterior';
}

function BracketTeamRow({ match, side }: { match: BracketDisplayMatch; side: MatchSide }) {
  const team = teamDisplay(match, side);
  const isFinal = match.status === 'FINAL' && Boolean(match.winnerTeamId);
  const isWinner = isFinal && team.teamId === match.winnerTeamId;
  const isLoser = isFinal && team.teamId !== match.winnerTeamId;

  return (
    <div className={`bracket-team ${isWinner ? 'bracket-team--winner' : ''} ${isLoser ? 'bracket-team--loser' : ''}`}>
      <span className="bracket-team__identity">
        <span className="bracket-team__flag" aria-hidden="true">
          {team.flag}
        </span>
        <strong>{team.label}</strong>
      </span>
      {match.status === 'FINAL' && team.score !== null ? <span className="bracket-team__score">{team.score}</span> : null}
    </div>
  );
}

function BracketMatchCard({ match }: { match: BracketDisplayMatch }) {
  return (
    <article className={`bracket-match bracket-match--${match.status.toLowerCase()}`}>
      <div className="bracket-match__meta">
        <span>{match.kickoffAt ? formatMadridDateTime(match.kickoffAt) : 'Fecha por confirmar'}</span>
        {match.venue ? <span>{match.venue}</span> : null}
      </div>
      <div className="bracket-match__teams">
        <BracketTeamRow match={match} side="home" />
        <span className="bracket-match__versus">vs</span>
        <BracketTeamRow match={match} side="away" />
      </div>
      <p className="bracket-match__status">{statusLabel(match)}</p>
    </article>
  );
}

export function BracketPage() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage: BracketStage = stages[activeStageIndex];
  const activeMatches = buildRoundMatches(activeStage.id);

  const goToPreviousStage = () => {
    setActiveStageIndex((current) => Math.max(0, current - 1));
  };

  const goToNextStage = () => {
    setActiveStageIndex((current) => Math.min(stages.length - 1, current + 1));
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Cuadro único, generado con resultados oficiales</p>
          <h1>Cuadro</h1>
        </div>
      </div>

      <div className="bracket-round-slider" aria-label="Rondas del cuadro">
        <button className="icon-button bracket-round-slider__arrow" type="button" onClick={goToPreviousStage} disabled={activeStageIndex === 0} aria-label="Ver ronda anterior">
          <ChevronLeft size={18} />
        </button>
        <div className="bracket-round-tabs" role="tablist" aria-label="Selecciona una ronda">
          {stages.map((stage, index) => (
            <button
              aria-selected={stage.id === activeStage.id}
              className={stage.id === activeStage.id ? 'bracket-round-tab bracket-round-tab--active' : 'bracket-round-tab'}
              key={stage.id}
              onClick={() => setActiveStageIndex(index)}
              role="tab"
              type="button"
            >
              {stage.label}
            </button>
          ))}
        </div>
        <button
          className="icon-button bracket-round-slider__arrow"
          type="button"
          onClick={goToNextStage}
          disabled={activeStageIndex === stages.length - 1}
          aria-label="Ver siguiente ronda"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="bracket-board bracket-board--active" aria-live="polite">
        <section className="bracket-column">
          <h2>{activeStage.label}</h2>
          {activeMatches.length > 0 ? activeMatches.map((match) => <BracketMatchCard key={match.key} match={match} />) : <p className="empty-state">Esta ronda se completará cuando avance el torneo.</p>}
        </section>
      </div>
    </section>
  );
}
