import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { demoMatches, demoTeams } from '../../data/demoTournament';
import { flagForTeamId } from '../../data/teamFlags';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage, Team, TeamId } from '../../domain/worldCupEngine';
import { formatMadridDateTime } from '../../lib/format';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

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

type TeamRow = {
  id: string;
  name: string;
  short_name: string;
  fifa_code: string;
  group_letter: GroupLetter;
  draw_position: number;
  fifa_ranking_order: number;
  team_conduct_score: number;
};

type MatchRow = {
  id: string;
  fifa_match_number: number;
  stage: Stage;
  group_letter: GroupLetter | null;
  kickoff_at: string;
  venue: string;
  status: MatchStatus;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  penalties_home: number | null;
  penalties_away: number | null;
  winner_team_id: string | null;
  decided_by: DecidedBy | null;
};

type BracketDisplayMatch = {
  key: string;
  fifaMatchNumber: number;
  displayCode: string;
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

type BracketDependency = {
  matchNumber: number;
  side: MatchSide;
  sourceType: 'winner' | 'loser';
  sourceMatchNumber: number;
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

const stageMatchNumbers: Record<DisplayStage, number[]> = {
  R32: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  R16: [89, 90, 91, 92, 93, 94, 95, 96],
  QF: [97, 98, 99, 100],
  SF: [101, 102],
  FINAL: [104],
};

const stageCodePrefixes: Record<DisplayStage, string> = {
  R32: 'D',
  R16: 'O',
  QF: 'C',
  SF: 'S',
  FINAL: 'Final',
};

const bracketDependencies: BracketDependency[] = [
  { matchNumber: 89, side: 'home', sourceType: 'winner', sourceMatchNumber: 74 },
  { matchNumber: 89, side: 'away', sourceType: 'winner', sourceMatchNumber: 77 },
  { matchNumber: 90, side: 'home', sourceType: 'winner', sourceMatchNumber: 73 },
  { matchNumber: 90, side: 'away', sourceType: 'winner', sourceMatchNumber: 75 },
  { matchNumber: 91, side: 'home', sourceType: 'winner', sourceMatchNumber: 76 },
  { matchNumber: 91, side: 'away', sourceType: 'winner', sourceMatchNumber: 78 },
  { matchNumber: 92, side: 'home', sourceType: 'winner', sourceMatchNumber: 79 },
  { matchNumber: 92, side: 'away', sourceType: 'winner', sourceMatchNumber: 80 },
  { matchNumber: 93, side: 'home', sourceType: 'winner', sourceMatchNumber: 83 },
  { matchNumber: 93, side: 'away', sourceType: 'winner', sourceMatchNumber: 84 },
  { matchNumber: 94, side: 'home', sourceType: 'winner', sourceMatchNumber: 81 },
  { matchNumber: 94, side: 'away', sourceType: 'winner', sourceMatchNumber: 82 },
  { matchNumber: 95, side: 'home', sourceType: 'winner', sourceMatchNumber: 86 },
  { matchNumber: 95, side: 'away', sourceType: 'winner', sourceMatchNumber: 88 },
  { matchNumber: 96, side: 'home', sourceType: 'winner', sourceMatchNumber: 85 },
  { matchNumber: 96, side: 'away', sourceType: 'winner', sourceMatchNumber: 87 },
  { matchNumber: 97, side: 'home', sourceType: 'winner', sourceMatchNumber: 89 },
  { matchNumber: 97, side: 'away', sourceType: 'winner', sourceMatchNumber: 90 },
  { matchNumber: 98, side: 'home', sourceType: 'winner', sourceMatchNumber: 93 },
  { matchNumber: 98, side: 'away', sourceType: 'winner', sourceMatchNumber: 94 },
  { matchNumber: 99, side: 'home', sourceType: 'winner', sourceMatchNumber: 91 },
  { matchNumber: 99, side: 'away', sourceType: 'winner', sourceMatchNumber: 92 },
  { matchNumber: 100, side: 'home', sourceType: 'winner', sourceMatchNumber: 95 },
  { matchNumber: 100, side: 'away', sourceType: 'winner', sourceMatchNumber: 96 },
  { matchNumber: 101, side: 'home', sourceType: 'winner', sourceMatchNumber: 97 },
  { matchNumber: 101, side: 'away', sourceType: 'winner', sourceMatchNumber: 98 },
  { matchNumber: 102, side: 'home', sourceType: 'winner', sourceMatchNumber: 99 },
  { matchNumber: 102, side: 'away', sourceType: 'winner', sourceMatchNumber: 100 },
  { matchNumber: 104, side: 'home', sourceType: 'winner', sourceMatchNumber: 101 },
  { matchNumber: 104, side: 'away', sourceType: 'winner', sourceMatchNumber: 102 },
];

const placeholderLabels: Record<DisplayStage, { home: string; away: string }> = {
  R32: { home: 'Por definir', away: 'Por definir' },
  R16: { home: 'Ganador de dieciseisavos', away: 'Ganador de dieciseisavos' },
  QF: { home: 'Ganador de octavos', away: 'Ganador de octavos' },
  SF: { home: 'Ganador de cuartos', away: 'Ganador de cuartos' },
  FINAL: { home: 'Ganador semifinal 1', away: 'Ganador semifinal 2' },
};

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    fifaCode: row.fifa_code,
    groupLetter: row.group_letter,
    drawPosition: row.draw_position,
    fifaRankingOrder: row.fifa_ranking_order,
    teamConductScore: row.team_conduct_score,
  };
}

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    fifaMatchNumber: row.fifa_match_number,
    stage: row.stage,
    groupLetter: row.group_letter,
    kickoffAt: row.kickoff_at,
    venue: row.venue,
    status: row.status,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    penaltiesHome: row.penalties_home,
    penaltiesAway: row.penalties_away,
    winnerTeamId: row.winner_team_id,
    decidedBy: row.decided_by,
  };
}

function placeholderMatch(stage: DisplayStage, index: number): BracketDisplayMatch {
  const fifaMatchNumber = stageMatchNumbers[stage][index];
  const sources = roundOf32Sources[fifaMatchNumber] ?? placeholderLabels[stage];
  const displayCode = stage === 'FINAL' ? stageCodePrefixes[stage] : `${stageCodePrefixes[stage]}${String(index + 1).padStart(2, '0')}`;

  return {
    key: `${stage}-${fifaMatchNumber}`,
    fifaMatchNumber,
    displayCode,
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

function toDisplayMatch(match: Match): BracketDisplayMatch {
  const source = match.stage === 'R32' ? roundOf32Sources[match.fifaMatchNumber] : null;
  const labels = source ?? placeholderLabels[match.stage as DisplayStage] ?? { home: 'Por definir', away: 'Por definir' };
  const stageNumbers = stageMatchNumbers[match.stage as DisplayStage] ?? [];
  const stageIndex = stageNumbers.indexOf(match.fifaMatchNumber);
  const displayCode =
    match.stage === 'FINAL' ? stageCodePrefixes.FINAL : `${stageCodePrefixes[match.stage as DisplayStage]}${String(stageIndex + 1).padStart(2, '0')}`;

  return {
    key: match.id,
    fifaMatchNumber: match.fifaMatchNumber,
    displayCode,
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

function sourceLabelForDependency(
  dependency: BracketDependency,
  matchesByNumber: Map<number, BracketDisplayMatch>,
): string {
  const source = matchesByNumber.get(dependency.sourceMatchNumber);
  if (!source) return dependency.sourceType === 'winner' ? 'Ganador de cruce previo' : 'Perdedor de cruce previo';

  return dependency.sourceType === 'winner' ? `Ganador de ${source.displayCode}` : `Perdedor de ${source.displayCode}`;
}

function buildBracketMatches(matches: Match[]): BracketDisplayMatch[] {
  const placeholders = stages.flatMap((stage) => stageMatchNumbers[stage.id].map((_, index) => placeholderMatch(stage.id, index)));
  const realMatches = matches
    .filter((match) => stageMatchNumbers[match.stage as DisplayStage])
    .sort((a, b) => a.fifaMatchNumber - b.fifaMatchNumber)
    .map(toDisplayMatch);
  const realMatchesByNumber = new Map(realMatches.map((match) => [match.fifaMatchNumber, match]));
  const merged = placeholders.map((placeholder) => realMatchesByNumber.get(placeholder.fifaMatchNumber) ?? placeholder);
  const mergedByNumber = new Map(merged.map((match) => [match.fifaMatchNumber, match]));

  return merged.map((match) => {
    const homeDependency = bracketDependencies.find((dependency) => dependency.matchNumber === match.fifaMatchNumber && dependency.side === 'home');
    const awayDependency = bracketDependencies.find((dependency) => dependency.matchNumber === match.fifaMatchNumber && dependency.side === 'away');

    return {
      ...match,
      homeSourceLabel: match.homeTeamId || !homeDependency ? match.homeSourceLabel : sourceLabelForDependency(homeDependency, mergedByNumber),
      awaySourceLabel: match.awayTeamId || !awayDependency ? match.awaySourceLabel : sourceLabelForDependency(awayDependency, mergedByNumber),
    };
  });
}

function buildRoundMatches(stage: DisplayStage, matches: Match[]): BracketDisplayMatch[] {
  return buildBracketMatches(matches)
    .filter((match) => match.stage === stage)
    .sort((a, b) => a.fifaMatchNumber - b.fifaMatchNumber);
}

function teamLabel(teamId: TeamId | null, teamNames: Map<TeamId, string>): string {
  if (!teamId) return 'Por definir';
  return teamNames.get(teamId) ?? teamId;
}

function teamDisplay(match: BracketDisplayMatch, side: MatchSide, teamNames: Map<TeamId, string>) {
  const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
  const sourceLabel = side === 'home' ? match.homeSourceLabel : match.awaySourceLabel;
  return {
    flag: flagForTeamId(teamId),
    label: teamId ? teamLabel(teamId, teamNames) : 'Por definir',
    sourceLabel: teamId ? '' : sourceLabel,
    score: side === 'home' ? match.homeScore : match.awayScore,
    teamId,
  };
}

function statusLabel(match: BracketDisplayMatch, teamNames: Map<TeamId, string>): string {
  if (match.status === 'FINAL' && match.winnerTeamId) return `${teamLabel(match.winnerTeamId, teamNames)} avanza`;
  if (match.homeTeamId && match.awayTeamId) return 'Completo';
  if (match.stage === 'R32') return 'Pendiente de grupos y mejores terceros';
  return 'Pendiente de ronda anterior';
}

function BracketTeamRow({ match, side, teamNames }: { match: BracketDisplayMatch; side: MatchSide; teamNames: Map<TeamId, string> }) {
  const team = teamDisplay(match, side, teamNames);
  const isFinal = match.status === 'FINAL' && Boolean(match.winnerTeamId);
  const isWinner = isFinal && team.teamId === match.winnerTeamId;
  const isLoser = isFinal && team.teamId !== match.winnerTeamId;

  return (
    <div className={`bracket-team ${isWinner ? 'bracket-team--winner' : ''} ${isLoser ? 'bracket-team--loser' : ''}`}>
      <span className="bracket-team__identity">
        <span className="bracket-team__flag" aria-hidden="true">
          {team.flag}
        </span>
        <span className="bracket-team__text">
          <strong>{team.label}</strong>
          {team.sourceLabel ? <small>{team.sourceLabel}</small> : null}
        </span>
      </span>
      {match.status === 'FINAL' && team.score !== null ? <span className="bracket-team__score">{team.score}</span> : null}
    </div>
  );
}

function BracketMatchCard({ match, teamNames }: { match: BracketDisplayMatch; teamNames: Map<TeamId, string> }) {
  return (
    <article className={`bracket-match bracket-match--${match.status.toLowerCase()}`}>
      <div className="bracket-match__meta">
        <span className="bracket-match__code">{match.displayCode}</span>
        <span>{match.kickoffAt ? formatMadridDateTime(match.kickoffAt) : 'Fecha por confirmar'}</span>
        {match.venue ? <span>{match.venue}</span> : null}
      </div>
      <div className="bracket-match__teams">
        <BracketTeamRow match={match} side="home" teamNames={teamNames} />
        <span className="bracket-match__versus">vs</span>
        <BracketTeamRow match={match} side="away" teamNames={teamNames} />
      </div>
      <p className="bracket-match__status">{statusLabel(match, teamNames)}</p>
    </article>
  );
}

export function BracketPage() {
  const [teams, setTeams] = useState<Team[]>(isSupabaseConfigured ? [] : demoTeams);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage: BracketStage = stages[activeStageIndex];
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const activeMatches = useMemo(() => buildRoundMatches(activeStage.id, matches), [activeStage.id, matches]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadBracket() {
      setIsLoading(true);
      setMessage('');

      const [{ data: teamRows, error: teamError }, { data: matchRows, error: matchError }] = await Promise.all([
        supabase!
          .from('teams')
          .select('id, name, short_name, fifa_code, group_letter, draw_position, fifa_ranking_order, team_conduct_score')
          .order('group_letter', { ascending: true })
          .order('draw_position', { ascending: true }),
        supabase!
          .from('matches')
          .select(
            'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
          )
          .neq('stage', 'GROUP')
          .order('fifa_match_number', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (teamError || matchError) {
        setMessage(`No pude cargar el cuadro: ${teamError?.message ?? matchError?.message}`);
      } else {
        setTeams(((teamRows ?? []) as TeamRow[]).map(toTeam));
        setMatches(((matchRows ?? []) as MatchRow[]).map(toMatch));
      }

      setIsLoading(false);
    }

    void loadBracket();

    return () => {
      isMounted = false;
    };
  }, []);

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

      {isLoading ? <p className="mode-note">Cargando cuadro desde Supabase...</p> : null}
      {message ? <p className="empty-state">{message}</p> : null}

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
          {activeMatches.length > 0 ? (
            activeMatches.map((match) => <BracketMatchCard key={match.key} match={match} teamNames={teamNames} />)
          ) : (
            <p className="empty-state">Esta ronda se completará cuando avance el torneo.</p>
          )}
        </section>
      </div>
    </section>
  );
}
