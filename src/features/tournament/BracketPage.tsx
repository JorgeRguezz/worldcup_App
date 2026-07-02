import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { demoMatches, demoTeams } from '../../data/demoTournament';
import { flagForTeamId } from '../../data/teamFlags';
import {
  GROUP_LETTERS,
  rankGroup,
  type DecidedBy,
  type FinalGroupMatch,
  type GroupLetter,
  type Match,
  type MatchStatus,
  type RankedTeam,
  type Stage,
  type Team,
  type TeamId,
} from '../../domain/worldCupEngine';
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

const roundOf32GroupPositionSources: Array<{ matchNumber: number; side: MatchSide; groupLetter: GroupLetter; rank: 1 | 2 }> = [
  { matchNumber: 73, side: 'home', groupLetter: 'A', rank: 2 },
  { matchNumber: 73, side: 'away', groupLetter: 'B', rank: 2 },
  { matchNumber: 74, side: 'home', groupLetter: 'E', rank: 1 },
  { matchNumber: 75, side: 'home', groupLetter: 'F', rank: 1 },
  { matchNumber: 75, side: 'away', groupLetter: 'C', rank: 2 },
  { matchNumber: 76, side: 'home', groupLetter: 'C', rank: 1 },
  { matchNumber: 76, side: 'away', groupLetter: 'F', rank: 2 },
  { matchNumber: 77, side: 'home', groupLetter: 'I', rank: 1 },
  { matchNumber: 78, side: 'home', groupLetter: 'E', rank: 2 },
  { matchNumber: 78, side: 'away', groupLetter: 'I', rank: 2 },
  { matchNumber: 79, side: 'home', groupLetter: 'A', rank: 1 },
  { matchNumber: 80, side: 'home', groupLetter: 'L', rank: 1 },
  { matchNumber: 81, side: 'home', groupLetter: 'D', rank: 1 },
  { matchNumber: 82, side: 'home', groupLetter: 'G', rank: 1 },
  { matchNumber: 83, side: 'home', groupLetter: 'K', rank: 2 },
  { matchNumber: 83, side: 'away', groupLetter: 'L', rank: 2 },
  { matchNumber: 84, side: 'home', groupLetter: 'H', rank: 1 },
  { matchNumber: 84, side: 'away', groupLetter: 'J', rank: 2 },
  { matchNumber: 85, side: 'home', groupLetter: 'B', rank: 1 },
  { matchNumber: 86, side: 'home', groupLetter: 'J', rank: 1 },
  { matchNumber: 86, side: 'away', groupLetter: 'H', rank: 2 },
  { matchNumber: 87, side: 'home', groupLetter: 'K', rank: 1 },
  { matchNumber: 88, side: 'home', groupLetter: 'D', rank: 2 },
  { matchNumber: 88, side: 'away', groupLetter: 'G', rank: 2 },
];

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

function isFinalGroupMatch(match: Match): match is FinalGroupMatch {
  return (
    match.stage === 'GROUP' &&
    match.status === 'FINAL' &&
    match.groupLetter !== null &&
    match.homeTeamId !== null &&
    match.awayTeamId !== null &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

function buildCompleteGroupTables(teams: Team[], matches: Match[]): Partial<Record<GroupLetter, RankedTeam[]>> {
  const finalGroupMatches = matches.filter(isFinalGroupMatch);

  return Object.fromEntries(
    GROUP_LETTERS.map((groupLetter) => {
      const groupTeams = teams.filter((team) => team.groupLetter === groupLetter);
      const groupMatches = finalGroupMatches.filter((match) => match.groupLetter === groupLetter);
      return [groupLetter, groupMatches.length === 6 ? rankGroup(groupTeams, groupMatches) : []];
    }),
  ) as Partial<Record<GroupLetter, RankedTeam[]>>;
}

function projectedRoundOf32Teams(matches: Match[], teams: Team[]): Map<string, TeamId> {
  const tables = buildCompleteGroupTables(teams, matches);
  const projected = new Map<string, TeamId>();

  roundOf32GroupPositionSources.forEach((source) => {
    const teamId = tables[source.groupLetter]?.[source.rank - 1]?.team.id;
    if (teamId) projected.set(`${source.matchNumber}-${source.side}`, teamId);
  });

  return projected;
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

function buildBracketMatches(matches: Match[], teams: Team[]): BracketDisplayMatch[] {
  const placeholders = stages.flatMap((stage) => stageMatchNumbers[stage.id].map((_, index) => placeholderMatch(stage.id, index)));
  const realMatches = matches
    .filter((match) => stageMatchNumbers[match.stage as DisplayStage])
    .sort((a, b) => a.fifaMatchNumber - b.fifaMatchNumber)
    .map(toDisplayMatch);
  const realMatchesByNumber = new Map(realMatches.map((match) => [match.fifaMatchNumber, match]));
  const projectedTeams = projectedRoundOf32Teams(matches, teams);
  const merged = placeholders.map((placeholder) => {
    const match = realMatchesByNumber.get(placeholder.fifaMatchNumber) ?? placeholder;
    const projectedHomeTeamId = match.homeTeamId ?? projectedTeams.get(`${match.fifaMatchNumber}-home`) ?? null;
    const projectedAwayTeamId = match.awayTeamId ?? projectedTeams.get(`${match.fifaMatchNumber}-away`) ?? null;

    return {
      ...match,
      homeTeamId: projectedHomeTeamId,
      awayTeamId: projectedAwayTeamId,
    };
  });
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

function buildRoundMatches(stage: DisplayStage, matches: Match[], teams: Team[]): BracketDisplayMatch[] {
  return buildBracketMatches(matches, teams)
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

export type BracketPoint = { x: number; y: number; angle: number };
type BracketView = { scale: number; x: number; y: number };
type BracketGesture =
  | { kind: 'drag'; pointerId: number; startX: number; startY: number; startView: BracketView }
  | { kind: 'pinch'; startDistance: number; startView: BracketView };

const BOARD_SIZE = 1000;
const BOARD_CENTER = BOARD_SIZE / 2;
const PARTICIPANT_RADIUS: Record<DisplayStage, number> = {
  R32: 445,
  R16: 348,
  QF: 258,
  SF: 178,
  FINAL: 112,
};
const WINNER_RADIUS: Record<DisplayStage, number> = {
  R32: PARTICIPANT_RADIUS.R16,
  R16: PARTICIPANT_RADIUS.QF,
  QF: PARTICIPANT_RADIUS.SF,
  SF: PARTICIPANT_RADIUS.FINAL,
  FINAL: 0,
};
const stageLegend = [
  { label: '16avos', color: '#e65a4f' },
  { label: 'Octavos', color: '#e5b93f' },
  { label: 'Cuartos', color: '#3c9b70' },
  { label: 'Semis', color: '#4d6fc4' },
  { label: 'Final', color: '#f2d17a' },
];
const branchColors = ['#e65a4f', '#e5b93f', '#3c9b70', '#4d6fc4'];

function pointOnRing(radius: number, angle: number): BracketPoint {
  const radians = (angle * Math.PI) / 180;
  return {
    x: BOARD_CENTER + Math.cos(radians) * radius,
    y: BOARD_CENTER + Math.sin(radians) * radius,
    angle,
  };
}

function sourceDependencies(matchNumber: number): BracketDependency[] {
  return bracketDependencies
    .filter((dependency) => dependency.matchNumber === matchNumber && dependency.sourceType === 'winner')
    .sort((a, b) => (a.side === 'home' ? -1 : b.side === 'home' ? 1 : 0));
}

export function roundOf32Order(): number[] {
  const visit = (matchNumber: number): number[] => {
    if (stageMatchNumbers.R32.includes(matchNumber)) return [matchNumber];
    return sourceDependencies(matchNumber).flatMap((dependency) => visit(dependency.sourceMatchNumber));
  };
  return visit(104);
}

export function leafSlotsByMatch(): Map<number, number[]> {
  const order = roundOf32Order();
  const slots = new Map<number, number[]>();
  order.forEach((matchNumber, index) => slots.set(matchNumber, [index * 2, index * 2 + 1]));

  const resolve = (matchNumber: number): number[] => {
    const existing = slots.get(matchNumber);
    if (existing) return existing;
    const resolved = sourceDependencies(matchNumber).flatMap((dependency) => resolve(dependency.sourceMatchNumber));
    slots.set(matchNumber, resolved);
    return resolved;
  };
  [...stageMatchNumbers.R16, ...stageMatchNumbers.QF, ...stageMatchNumbers.SF, ...stageMatchNumbers.FINAL].forEach(resolve);
  return slots;
}

function angleForLeafSlot(slot: number): number {
  return -90 + (slot + 0.5) * (360 / 32);
}

function midpointAngle(slots: number[]): number {
  return angleForLeafSlot((Math.min(...slots) + Math.max(...slots)) / 2);
}

function participantPoint(
  match: BracketDisplayMatch,
  side: MatchSide,
  order: number[],
  slots: Map<number, number[]>,
): BracketPoint {
  if (match.stage === 'R32') {
    const matchIndex = order.indexOf(match.fifaMatchNumber);
    return pointOnRing(PARTICIPANT_RADIUS.R32, angleForLeafSlot(matchIndex * 2 + (side === 'home' ? 0 : 1)));
  }
  const source = bracketDependencies.find(
    (dependency) => dependency.matchNumber === match.fifaMatchNumber && dependency.side === side && dependency.sourceType === 'winner',
  );
  const sourceSlots = source ? slots.get(source.sourceMatchNumber) : slots.get(match.fifaMatchNumber);
  return pointOnRing(PARTICIPANT_RADIUS[match.stage], midpointAngle(sourceSlots ?? [0]));
}

function winnerPoint(match: BracketDisplayMatch, slots: Map<number, number[]>): BracketPoint {
  if (match.stage === 'FINAL') return { x: BOARD_CENTER, y: BOARD_CENTER, angle: 0 };
  return pointOnRing(WINNER_RADIUS[match.stage], midpointAngle(slots.get(match.fifaMatchNumber) ?? [0]));
}

function matchJunctionPoint(match: BracketDisplayMatch, slots: Map<number, number[]>): BracketPoint {
  const participantRadius = PARTICIPANT_RADIUS[match.stage];
  const nextRadius = WINNER_RADIUS[match.stage];
  const junctionRadius = nextRadius === 0 ? 82 : participantRadius - (participantRadius - nextRadius) * 0.22;
  return pointOnRing(junctionRadius, midpointAngle(slots.get(match.fifaMatchNumber) ?? [0]));
}

export function rotatedRightAngleElbow(from: BracketPoint, to: BracketPoint): BracketPoint {
  const radians = (to.angle * Math.PI) / 180;
  const radial = { x: Math.cos(radians), y: Math.sin(radians) };
  const tangent = { x: -radial.y, y: radial.x };
  const fromCentered = { x: from.x - BOARD_CENTER, y: from.y - BOARD_CENTER };
  const toCentered = { x: to.x - BOARD_CENTER, y: to.y - BOARD_CENTER };
  const fromTangentOffset = fromCentered.x * tangent.x + fromCentered.y * tangent.y;
  const toRadialOffset = toCentered.x * radial.x + toCentered.y * radial.y;

  return {
    x: BOARD_CENTER + radial.x * toRadialOffset + tangent.x * fromTangentOffset,
    y: BOARD_CENTER + radial.y * toRadialOffset + tangent.y * fromTangentOffset,
    angle: to.angle,
  };
}

function rotatedRightAnglePath(from: BracketPoint, to: BracketPoint): string {
  const elbow = rotatedRightAngleElbow(from, to);
  return `M ${from.x} ${from.y} L ${elbow.x} ${elbow.y} L ${to.x} ${to.y}`;
}

function branchColor(slots: number[]): string {
  const average = (Math.min(...slots) + Math.max(...slots)) / 2;
  return branchColors[Math.min(3, Math.floor(average / 8))];
}

function RadialBracket({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const displayMatches = useMemo(() => buildBracketMatches(matches, teams), [matches, teams]);
  const matchesByNumber = useMemo(
    () => new Map(displayMatches.map((match) => [match.fifaMatchNumber, match])),
    [displayMatches],
  );
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const order = useMemo(roundOf32Order, []);
  const slots = useMemo(leafSlotsByMatch, []);
  const [selectedMatch, setSelectedMatch] = useState<BracketDisplayMatch | null>(null);
  const [view, setView] = useState<BracketView>({ scale: 1, x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const viewRef = useRef(view);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<BracketGesture | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const participantTeam = (match: BracketDisplayMatch, side: MatchSide): TeamId | null => {
    const directTeam = side === 'home' ? match.homeTeamId : match.awayTeamId;
    if (directTeam) return directTeam;
    const source = bracketDependencies.find(
      (dependency) => dependency.matchNumber === match.fifaMatchNumber && dependency.side === side && dependency.sourceType === 'winner',
    );
    return source ? matchesByNumber.get(source.sourceMatchNumber)?.winnerTeamId ?? null : null;
  };

  const clampView = (next: BracketView): BracketView => {
    const scale = Math.min(4, Math.max(1, next.scale));
    const limit = (scale - 1) * 360;
    return {
      scale,
      x: Math.min(limit, Math.max(-limit, next.x)),
      y: Math.min(limit, Math.max(-limit, next.y)),
    };
  };

  const pointerDistance = () => {
    const points = [...pointersRef.current.values()];
    return points.length < 2 ? 0 : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    setHasInteracted(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) {
      gestureRef.current = {
        kind: 'drag',
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startView: viewRef.current,
      };
    } else if (pointersRef.current.size === 2) {
      gestureRef.current = { kind: 'pinch', startDistance: pointerDistance(), startView: viewRef.current };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.kind === 'pinch' && pointersRef.current.size >= 2) {
      const distance = pointerDistance();
      setView(clampView({ ...gesture.startView, scale: gesture.startView.scale * (distance / gesture.startDistance) }));
      return;
    }
    if (gesture.kind === 'drag' && pointersRef.current.size === 1 && gesture.pointerId === event.pointerId) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const unitScale = BOARD_SIZE / Math.max(1, bounds.width);
      setView(clampView({
        ...gesture.startView,
        x: gesture.startView.x + (event.clientX - gesture.startX) * unitScale,
        y: gesture.startView.y + (event.clientY - gesture.startY) * unitScale,
      }));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId);
    const remaining = [...pointersRef.current.entries()];
    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0];
      gestureRef.current = {
        kind: 'drag',
        pointerId,
        startX: point.x,
        startY: point.y,
        startView: viewRef.current,
      };
    } else {
      gestureRef.current = null;
    }
  };

  const renderMatchDetail = (match: BracketDisplayMatch) => {
    const homeName = match.homeTeamId ? teamNames.get(match.homeTeamId) ?? match.homeTeamId : 'Por definir';
    const awayName = match.awayTeamId ? teamNames.get(match.awayTeamId) ?? match.awayTeamId : 'Por definir';
    const score = match.homeScore !== null && match.awayScore !== null ? `${match.homeScore}–${match.awayScore}` : 'vs';
    return (
      <aside className="radial-bracket-detail" aria-live="polite">
        <button type="button" className="icon-button" onClick={() => setSelectedMatch(null)} aria-label="Cerrar detalle"><X size={18} /></button>
        <span>{match.displayCode}{match.kickoffAt ? ` · ${formatMadridDateTime(match.kickoffAt)}` : ''}</span>
        <strong>{flagForTeamId(match.homeTeamId)} {homeName} <b>{score}</b> {flagForTeamId(match.awayTeamId)} {awayName}</strong>
      </aside>
    );
  };

  return (
    <section className="radial-bracket-shell">
      <div className="radial-bracket-legend" aria-label="Rondas del cuadro">
        {stageLegend.map((stage) => <span key={stage.label}><i style={{ background: stage.color }} />{stage.label}</span>)}
      </div>
      <div className="radial-bracket-viewport">
        <svg
          className="radial-bracket"
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          role="img"
          aria-label="Cuadro completo de eliminatorias. Pellizca para ampliar y arrastra para moverte."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <defs>
            <radialGradient id="trophyGlow">
              <stop offset="0%" stopColor="#e8bd55" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#e8bd55" stopOpacity="0" />
            </radialGradient>
            <filter id="flagShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.38" />
            </filter>
          </defs>
          <g transform={`translate(${view.x} ${view.y}) translate(${BOARD_CENTER} ${BOARD_CENTER}) scale(${view.scale}) translate(${-BOARD_CENTER} ${-BOARD_CENTER})`}>
            {[PARTICIPANT_RADIUS.R32, PARTICIPANT_RADIUS.R16, PARTICIPANT_RADIUS.QF, PARTICIPANT_RADIUS.SF, PARTICIPANT_RADIUS.FINAL].map((radius) => (
              <circle className="radial-bracket__ring" cx={BOARD_CENTER} cy={BOARD_CENTER} r={radius} key={radius} />
            ))}
            {displayMatches.filter((match) => match.stage !== 'FINAL').map((match) => {
              const target = winnerPoint(match, slots);
              const junction = matchJunctionPoint(match, slots);
              const matchSlots = slots.get(match.fifaMatchNumber) ?? [0];
              const color = branchColor(matchSlots);
              const isComplete = match.status === 'FINAL' && Boolean(match.winnerTeamId);
              return (
                <g key={`fork-${match.fifaMatchNumber}`}>
                  {(['home', 'away'] as MatchSide[]).map((side) => {
                    const from = participantPoint(match, side, order, slots);
                    const teamId = participantTeam(match, side);
                    const isWinner = isComplete && Boolean(teamId) && match.winnerTeamId === teamId;
                    const isLoser = isComplete && Boolean(teamId) && match.winnerTeamId !== teamId;
                    return (
                      <path
                        className={`radial-bracket__branch${isWinner ? ' is-winner' : ''}${isLoser ? ' is-loser' : ''}`}
                        d={rotatedRightAnglePath(from, junction)}
                        key={`path-${match.fifaMatchNumber}-${side}`}
                        style={isWinner ? { stroke: color } : undefined}
                      />
                    );
                  })}
                  <path
                    className={`radial-bracket__stem${isComplete ? ' is-complete' : ''}`}
                    d={`M ${junction.x} ${junction.y} L ${target.x} ${target.y}`}
                    style={isComplete ? { stroke: color } : undefined}
                  />
                  <circle
                    className={`radial-bracket__junction${isComplete ? ' is-complete' : ''}`}
                    cx={junction.x}
                    cy={junction.y}
                    r="5"
                    style={isComplete ? { fill: color } : undefined}
                  />
                </g>
              );
            })}
            <circle className="radial-bracket__center-glow" cx={BOARD_CENTER} cy={BOARD_CENTER} r="146" />
            <circle className="radial-bracket__center" cx={BOARD_CENTER} cy={BOARD_CENTER} r="94" />
            <image href="/world-cup-trophy.webp" x="405" y="437" width="190" height="126" preserveAspectRatio="xMidYMid meet" />
            {displayMatches.flatMap((match) =>
              (['home', 'away'] as MatchSide[]).map((side) => {
                const point = participantPoint(match, side, order, slots);
                const teamId = participantTeam(match, side);
                const isFinal = match.status === 'FINAL' && Boolean(match.winnerTeamId);
                const isWinner = isFinal && teamId === match.winnerTeamId;
                const isLoser = isFinal && Boolean(teamId) && teamId !== match.winnerTeamId;
                return (
                  <g
                    className={`radial-bracket-node${teamId ? ' has-team' : ' is-empty'}${isWinner ? ' is-winner' : ''}${isLoser ? ' is-loser' : ''}`}
                    key={`node-${match.fifaMatchNumber}-${side}`}
                    transform={`translate(${point.x} ${point.y})`}
                    onClick={() => setSelectedMatch(match)}
                    role="button"
                    tabIndex={0}
                  >
                    <title>{teamId ? teamNames.get(teamId) ?? teamId : 'Cruce por definir'}</title>
                    <circle r={teamId ? 27 : 7} />
                    {teamId ? <text aria-hidden="true" textAnchor="middle" dominantBaseline="central">{flagForTeamId(teamId)}</text> : null}
                  </g>
                );
              }),
            )}
          </g>
        </svg>
        {!hasInteracted ? <p className="radial-bracket-hint">Pellizca para ampliar · arrastra para moverte</p> : null}
        {selectedMatch ? renderMatchDetail(selectedMatch) : null}
      </div>
    </section>
  );
}

export function BracketPage() {
  const [teams, setTeams] = useState<Team[]>(isSupabaseConfigured ? [] : demoTeams);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadBracket(showLoading = true) {
      if (showLoading) setIsLoading(true);
      if (showLoading) setMessage('');

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
          .order('fifa_match_number', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (teamError || matchError) {
        setMessage(`No pude cargar el cuadro: ${teamError?.message ?? matchError?.message}`);
      } else {
        setTeams(((teamRows ?? []) as TeamRow[]).map(toTeam));
        setMatches(((matchRows ?? []) as MatchRow[]).map(toMatch));
      }

      if (showLoading) setIsLoading(false);
    }

    void loadBracket();
    const channel = supabase
      .channel('official-bracket-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => void loadBracket(false))
      .subscribe();
    const refreshInterval = window.setInterval(() => void loadBracket(false), 30_000);

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadBracket(false);
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      void supabase?.removeChannel(channel);
    };
  }, []);

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

      <RadialBracket matches={matches} teams={teams} />
    </section>
  );
}
