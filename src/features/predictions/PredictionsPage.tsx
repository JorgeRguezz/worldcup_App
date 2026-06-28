import { PencilLine, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { RecentPredictionResults } from '../../components/RecentPredictionResults';
import { SearchSelect } from '../../components/SearchSelect';
import { TeamProfile } from '../../components/TeamProfile';
import { PLAYER_CANDIDATES } from '../../data/playerCandidates';
import { demoMatches, teamName } from '../../data/demoTournament';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage } from '../../domain/worldCupEngine';
import { formatMadridDateTime } from '../../lib/format';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import {
  formatCountdown,
  getSpecialPredictionDeadline,
  isMissingSpecialPredictionSchemaError,
  isExactOption,
  normalizeOption,
  SPECIAL_PREDICTION_POINTS,
  SPECIAL_PREDICTION_TOTAL_POINTS,
  type SpecialPredictionRow,
} from '../../lib/specialPredictions';
import { SuperquotaPredictionPanel } from '../superquota/SuperquotaPredictionPanel';

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

type PredictionRow = {
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_advancing_team_id: string | null;
  points_awarded: number;
};

type DraftPrediction = {
  home: string;
  away: string;
  advancingTeamId: string;
  points: number;
};

type PredictionBucket = {
  title: string;
  matches: Match[];
};

type PastPredictionBucket = PredictionBucket & {
  id: string;
};

type PredictionUpsertRow = {
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_advancing_team_id: string | null;
};

type SpecialPredictionDraft = {
  champion: string;
  bestPlayer: string;
  topScorer: string;
  topAssist: string;
};

const MADRID_TIME_ZONE = 'Europe/Madrid';
const PREDICTION_DAY_START_HOUR = 7;

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

function getMadridDateParts(value: string | Date): { year: number; month: number; day: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    hour: Number(byType.hour),
  };
}

function toDayKey({ year, month, day }: { year: number; month: number; day: number }): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function addDaysToDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return toDayKey({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

function getPredictionDayKey(value: string | Date): string {
  const parts = getMadridDateParts(value);
  const calendarDayKey = toDayKey(parts);
  return parts.hour < PREDICTION_DAY_START_HOUR ? addDaysToDayKey(calendarDayKey, -1) : calendarDayKey;
}

function isLocked(match: Match): boolean {
  return new Date(match.kickoffAt).getTime() <= Date.now();
}

function isCompleteDraft(draft: DraftPrediction | undefined): draft is DraftPrediction {
  return Boolean(draft && draft.home !== '' && draft.away !== '');
}

function sortByKickoffThenNumber(a: Match, b: Match): number {
  const kickoffDiff = new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
  if (kickoffDiff !== 0) return kickoffDiff;
  return a.fifaMatchNumber - b.fifaMatchNumber;
}

function sortByRecentKickoff(a: Match, b: Match): number {
  const kickoffDiff = new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();
  if (kickoffDiff !== 0) return kickoffDiff;
  return b.fifaMatchNumber - a.fifaMatchNumber;
}

function getStageTitle(stage: Stage): string {
  if (stage === 'GROUP') return 'Fase de grupos';
  if (stage === 'R32') return 'Dieciseisavos';
  if (stage === 'R16') return 'Octavos';
  if (stage === 'QF') return 'Cuartos';
  if (stage === 'SF') return 'Semifinales';
  if (stage === 'THIRD_PLACE') return 'Tercer puesto';
  return 'Final';
}

function getGroupMatchday(match: Match, allMatches: Match[]): number {
  if (match.stage !== 'GROUP' || !match.groupLetter) return 0;

  const groupMatches = allMatches
    .filter((item) => item.stage === 'GROUP' && item.groupLetter === match.groupLetter)
    .sort(sortByKickoffThenNumber);
  const matchIndex = groupMatches.findIndex((item) => item.id === match.id);
  if (matchIndex < 0) return 0;

  return Math.floor(matchIndex / 2) + 1;
}

function buildPastPredictionBuckets(pastMatches: Match[], allMatches: Match[]): PastPredictionBucket[] {
  const buckets = new Map<string, PastPredictionBucket>();

  pastMatches.forEach((match) => {
    const groupMatchday = getGroupMatchday(match, allMatches);
    const id = groupMatchday > 0 ? `group-${groupMatchday}` : `stage-${match.stage}`;
    const title = groupMatchday > 0 ? `Fase de grupos · Jornada ${groupMatchday}` : getStageTitle(match.stage);
    const bucket = buckets.get(id) ?? { id, title, matches: [] };

    bucket.matches.push(match);
    buckets.set(id, bucket);
  });

  return [...buckets.values()]
    .map((bucket) => ({ ...bucket, matches: bucket.matches.sort(sortByRecentKickoff) }))
    .sort((a, b) => {
      const latestA = Math.max(...a.matches.map((match) => new Date(match.kickoffAt).getTime()));
      const latestB = Math.max(...b.matches.map((match) => new Date(match.kickoffAt).getTime()));
      return latestB - latestA;
    });
}

export function PredictionsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [drafts, setDrafts] = useState<Record<string, DraftPrediction>>({});
  const [savedPredictions, setSavedPredictions] = useState<Record<string, DraftPrediction>>({});
  const [specialPrediction, setSpecialPrediction] = useState<SpecialPredictionRow | null>(null);
  const [specialDraft, setSpecialDraft] = useState<SpecialPredictionDraft>({
    champion: '',
    bestPlayer: '',
    topScorer: '',
    topAssist: '',
  });
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [isSavingSpecial, setIsSavingSpecial] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const teamProfileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadPredictions() {
      setIsLoading(true);
      setMessage('');

      const { data: userResult, error: userError } = await supabase!.auth.getUser();
      if (!isMounted) return;

      if (userError || !userResult.user) {
        setUserId(null);
        setIsLoading(false);
        return;
      }

      setUserId(userResult.user.id);

      const [
        { data: matchRows, error: matchError },
        { data: predictionRows, error: predictionError },
        { data: specialPredictionRow, error: specialPredictionError },
      ] = await Promise.all([
        supabase!
          .from('matches')
          .select(
            'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
          )
          .order('fifa_match_number', { ascending: true }),
        supabase!
          .from('predictions')
          .select('match_id, predicted_home_score, predicted_away_score, predicted_advancing_team_id, points_awarded')
          .eq('user_id', userResult.user.id),
        supabase!
          .from('special_predictions')
          .select(
            'user_id, champion_team_id, best_player_name, top_scorer_player_name, top_assist_player_name, champion_points_awarded, best_player_points_awarded, top_scorer_points_awarded, top_assist_points_awarded, points_awarded, updated_at',
          )
          .eq('user_id', userResult.user.id)
          .maybeSingle(),
      ]);

      if (!isMounted) return;

      if (matchError) {
        setMessage(`No pude cargar los partidos: ${matchError.message}`);
        setMatches([]);
      } else {
        setMatches(((matchRows ?? []) as MatchRow[]).map(toMatch));
      }

      if (predictionError) {
        setMessage(`No pude cargar tus predicciones: ${predictionError.message}`);
      } else {
        const nextDrafts = Object.fromEntries(
          ((predictionRows ?? []) as PredictionRow[]).map((prediction) => [
            prediction.match_id,
            {
              home: String(prediction.predicted_home_score),
              away: String(prediction.predicted_away_score),
              advancingTeamId: prediction.predicted_advancing_team_id ?? '',
              points: prediction.points_awarded,
            },
          ]),
        );
        setDrafts(nextDrafts);
        setSavedPredictions(nextDrafts);
      }

      if (specialPredictionError && !isMissingSpecialPredictionSchemaError(specialPredictionError)) {
        setMessage(`No pude cargar tu predicción especial: ${specialPredictionError.message}`);
      } else if (specialPredictionRow) {
        const nextSpecialPrediction = specialPredictionRow as SpecialPredictionRow;
        setSpecialPrediction(nextSpecialPrediction);
        setSpecialDraft({
          champion: teamName(nextSpecialPrediction.champion_team_id),
          bestPlayer: nextSpecialPrediction.best_player_name,
          topScorer: nextSpecialPrediction.top_scorer_player_name,
          topAssist: nextSpecialPrediction.top_assist_player_name,
        });
      }

      setIsLoading(false);
    }

    void loadPredictions();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderedMatches = useMemo(() => {
    const now = Date.now();

    return {
      available: matches
        .filter((match) => match.homeTeamId && match.awayTeamId && new Date(match.kickoffAt).getTime() > now)
        .sort(sortByKickoffThenNumber),
      past: matches
        .filter((match) => new Date(match.kickoffAt).getTime() <= now)
        .sort(sortByRecentKickoff),
    };
  }, [matches]);

  const availableBuckets = useMemo<PredictionBucket[]>(() => {
    const todayKey = getPredictionDayKey(new Date());
    const today = orderedMatches.available.filter((match) => getPredictionDayKey(match.kickoffAt) === todayKey);

    return [
      { title: 'Hoy', matches: today },
    ].filter((bucket) => bucket.matches.length > 0);
  }, [orderedMatches.available]);
  const availablePredictionMatches = useMemo(() => availableBuckets.flatMap((bucket) => bucket.matches), [availableBuckets]);
  const pastPredictionBuckets = useMemo(
    () => buildPastPredictionBuckets(orderedMatches.past, matches),
    [matches, orderedMatches.past],
  );
  const teamOptions = useMemo(() => {
    const teamIds = new Set<string>();
    matches
      .filter((match) => match.stage === 'GROUP')
      .forEach((match) => {
        if (match.homeTeamId) teamIds.add(match.homeTeamId);
        if (match.awayTeamId) teamIds.add(match.awayTeamId);
      });

    return [...teamIds]
      .map((id) => ({ id, label: teamName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [matches]);
  const specialDeadline = useMemo(() => getSpecialPredictionDeadline(matches), [matches]);
  const specialClosed = now >= specialDeadline.getTime();
  const specialCountdown = formatCountdown(specialDeadline, now);
  const specialStatusCopy = specialClosed ? 'Cerrada' : `Cierra en ${specialCountdown}`;

  const updateDraft = (matchId: string, patch: Partial<DraftPrediction>) => {
    setDrafts((current) => ({
      ...current,
      [matchId]: {
        home: current[matchId]?.home ?? '',
        away: current[matchId]?.away ?? '',
        advancingTeamId: current[matchId]?.advancingTeamId ?? '',
        points: current[matchId]?.points ?? 0,
        ...patch,
      },
    }));
  };

  const showTeamProfile = (teamId: string) => {
    setSelectedTeamId(teamId);
    window.requestAnimationFrame(() => {
      teamProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (!selectedTeamId) return;
    teamProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedTeamId]);

  const isSameAsSaved = (matchId: string, draft: DraftPrediction | undefined): boolean => {
    const saved = savedPredictions[matchId];
    return Boolean(
      saved &&
        draft &&
        draft.home === saved.home &&
        draft.away === saved.away &&
        (draft.advancingTeamId || '') === (saved.advancingTeamId || ''),
    );
  };

  const toSavedDraft = (row: PredictionUpsertRow, points = 0): DraftPrediction => ({
    home: String(row.predicted_home_score),
    away: String(row.predicted_away_score),
    advancingTeamId: row.predicted_advancing_team_id ?? '',
    points,
  });

  const buildPredictionRow = (match: Match, draft: DraftPrediction | undefined, currentUserId: string): PredictionUpsertRow | string => {
    if (isLocked(match)) return 'Este partido ya empezó y no se puede guardar.';
    if (!match.homeTeamId || !match.awayTeamId) return 'Este partido todavía no tiene equipos definidos.';
    if (!isCompleteDraft(draft)) return 'Completa el marcador del partido antes de guardar.';

    const home = Number(draft.home);
    const away = Number(draft.away);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0 || home > 20 || away > 20) {
      return 'Los marcadores deben ser números enteros entre 0 y 20.';
    }

    const isKnockoutDraw = match.stage !== 'GROUP' && home === away;
    if (isKnockoutDraw && !draft.advancingTeamId) {
      return 'Este partido necesita elegir qué equipo avanza.';
    }

    return {
      user_id: currentUserId,
      match_id: match.id,
      predicted_home_score: home,
      predicted_away_score: away,
      predicted_advancing_team_id: isKnockoutDraw ? draft.advancingTeamId : null,
    };
  };

  const updateSpecialDraft = (patch: Partial<SpecialPredictionDraft>) => {
    setSpecialDraft((current) => ({ ...current, ...patch }));
  };

  const resolveTeamId = (label: string): string | null => {
    const normalizedLabel = normalizeOption(label);
    return teamOptions.find((team) => normalizeOption(team.label) === normalizedLabel)?.id ?? null;
  };

  const saveSpecialPrediction = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Configura Supabase para guardar predicciones reales.');
      return;
    }

    if (!userId) {
      setMessage('Inicia sesión antes de guardar predicciones.');
      return;
    }

    if (specialClosed) {
      setMessage('La predicción especial ya está cerrada.');
      return;
    }

    const championTeamId = resolveTeamId(specialDraft.champion);
    if (!championTeamId) {
      setMessage('Elige un ganador del Mundial de la lista de países participantes.');
      return;
    }

    if (!isExactOption(specialDraft.bestPlayer, [...PLAYER_CANDIDATES])) {
      setMessage('Elige el mejor jugador desde la lista de candidatos.');
      return;
    }

    if (!isExactOption(specialDraft.topScorer, [...PLAYER_CANDIDATES])) {
      setMessage('Elige el máximo goleador desde la lista de candidatos.');
      return;
    }

    if (!isExactOption(specialDraft.topAssist, [...PLAYER_CANDIDATES])) {
      setMessage('Elige el máximo asistente desde la lista de candidatos.');
      return;
    }

    setIsSavingSpecial(true);
    setMessage('');

    const { data, error } = await supabase
      .from('special_predictions')
      .upsert(
        {
          user_id: userId,
          champion_team_id: championTeamId,
          best_player_name: specialDraft.bestPlayer.trim(),
          top_scorer_player_name: specialDraft.topScorer.trim(),
          top_assist_player_name: specialDraft.topAssist.trim(),
        },
        { onConflict: 'user_id' },
      )
      .select(
        'user_id, champion_team_id, best_player_name, top_scorer_player_name, top_assist_player_name, champion_points_awarded, best_player_points_awarded, top_scorer_points_awarded, top_assist_points_awarded, points_awarded, updated_at',
      )
      .single();

    setIsSavingSpecial(false);

    if (error) {
      setMessage(`No se pudo guardar la predicción especial: ${error.message}`);
      return;
    }

    setSpecialPrediction(data as SpecialPredictionRow);
    setMessage(specialPrediction ? 'Predicción especial modificada.' : 'Predicción especial guardada.');
  };

  const savePrediction = async (match: Match) => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Configura Supabase para guardar predicciones reales.');
      return;
    }

    if (!userId) {
      setMessage('Inicia sesión antes de guardar predicciones.');
      return;
    }

    const row = buildPredictionRow(match, drafts[match.id], userId);
    if (typeof row === 'string') {
      setMessage(row);
      return;
    }

    const wasSaved = Boolean(savedPredictions[match.id]);
    setSavingMatchId(match.id);
    setMessage('');

    const { error } = await supabase.from('predictions').upsert([row], {
      onConflict: 'user_id,match_id',
    });

    setSavingMatchId(null);
    if (error) {
      setMessage(`No se pudo guardar: ${error.message}`);
      return;
    }

    setSavedPredictions((current) => ({
      ...current,
      [match.id]: toSavedDraft(row, drafts[match.id]?.points ?? 0),
    }));
    setMessage(wasSaved ? 'Apuesta modificada.' : 'Apuesta guardada.');
  };

  if (isSupabaseConfigured && !isLoading && !userId) {
    return (
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Predicciones privadas</p>
            <h1>Mis predicciones</h1>
          </div>
        </div>
        <section className="table-card">
          <p className="empty-state">Necesitas iniciar sesión para guardar tus predicciones.</p>
          <Link className="primary-link auth-inline-link" to="/auth">
            Entrar o registrarme
          </Link>
        </section>
      </section>
    );
  }

  const renderPredictionEditor = (match: Match, readOnly = false) => {
    const draft = drafts[match.id];
    const locked = isLocked(match);
    const disabled = locked || !match.homeTeamId || !match.awayTeamId;
    const isSubmitting = savingMatchId === match.id;
    const canSave = !disabled && isCompleteDraft(draft) && !savingMatchId;
    const savedDraft = savedPredictions[match.id];
    const hasSavedPrediction = Boolean(savedDraft);
    const editorGlowClass = readOnly
      ? ''
      : hasSavedPrediction
        ? ' prediction-editor--glow-saved'
        : disabled
          ? ''
          : ' prediction-editor--glow-available';
    const isSavedDraft = isSameAsSaved(match.id, draft);
    const predictionStatus = hasSavedPrediction ? (isSavedDraft ? 'saved' : 'modified') : isCompleteDraft(draft) ? 'draft' : undefined;
    const displayPrediction = isCompleteDraft(draft) ? draft : savedDraft;
    const predictionForCard = displayPrediction
      ? { home: Number(displayPrediction.home), away: Number(displayPrediction.away), points: displayPrediction.points }
      : undefined;
    const predictionResult =
      readOnly && predictionForCard && match.homeScore !== null && match.awayScore !== null
        ? predictionForCard.home === match.homeScore && predictionForCard.away === match.awayScore
          ? 'exact'
          : predictionForCard.points > 0
            ? 'correct'
            : 'miss'
        : undefined;
    const isKnockoutDraw = match.stage !== 'GROUP' && draft !== undefined && draft.home !== '' && draft.away !== '' && draft.home === draft.away;

    if (readOnly) {
      return (
        <MatchCard
          key={match.id}
          match={match}
          prediction={predictionForCard}
          predictionStatus={predictionStatus}
          predictionResult={predictionResult}
          glow={predictionResult}
          statusTone="danger"
          onTeamClick={showTeamProfile}
        />
      );
    }

    return (
      <div className={`prediction-editor${editorGlowClass}`} key={match.id}>
        <MatchCard
          match={match}
          prediction={predictionForCard}
          predictionStatus={predictionStatus}
          predictionResult={predictionResult}
          statusTone={readOnly ? 'danger' : undefined}
          onTeamClick={showTeamProfile}
        />
        {readOnly ? null : (
          <>
            <div className="score-inputs" aria-label="Predicción del partido">
              <input
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={draft?.home ?? ''}
                disabled={disabled}
                onChange={(event) => updateDraft(match.id, { home: event.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={draft?.away ?? ''}
                disabled={disabled}
                onChange={(event) => updateDraft(match.id, { away: event.target.value })}
              />
            </div>
            {match.stage !== 'GROUP' ? (
              <select
                disabled={disabled || !isKnockoutDraw}
                value={draft?.advancingTeamId ?? ''}
                onChange={(event) => updateDraft(match.id, { advancingTeamId: event.target.value })}
              >
                <option value="">Equipo que avanza si hay empate</option>
                {match.homeTeamId ? <option value={match.homeTeamId}>{teamName(match.homeTeamId)}</option> : null}
                {match.awayTeamId ? <option value={match.awayTeamId}>{teamName(match.awayTeamId)}</option> : null}
              </select>
            ) : null}
            <button
              className="primary-button prediction-submit"
              type="button"
              disabled={!canSave}
              onClick={() => void savePrediction(match)}
            >
              {hasSavedPrediction ? <PencilLine size={16} /> : <Save size={16} />}
              {hasSavedPrediction ? (isSubmitting ? 'Modificando...' : 'Modificar apuesta') : isSubmitting ? 'Guardando...' : 'Guardar apuesta'}
            </button>
          </>
        )}
      </div>
    );
  };

  const renderSpecialPredictionSection = () => (
    <section className={`special-prediction-card${specialClosed ? ' special-prediction-card--closed' : ''}`}>
      <div className="special-prediction-card__header">
        <div>
          <p className="eyebrow">Antes de eliminatorias</p>
          <h3>Predicción especial</h3>
          <p>Se puede modificar hasta el final de la fase de grupos: {formatMadridDateTime(specialDeadline.toISOString())}.</p>
        </div>
        <strong className="countdown-alert">{specialStatusCopy}</strong>
      </div>

      <div className="special-score-grid" aria-label="Puntuación de la predicción especial">
        <span>
          Campeón <b>+{SPECIAL_PREDICTION_POINTS.champion}</b>
        </span>
        <span>
          Mejor jugador <b>+{SPECIAL_PREDICTION_POINTS.bestPlayer}</b>
        </span>
        <span>
          Máximo goleador <b>+{SPECIAL_PREDICTION_POINTS.topScorer}</b>
        </span>
        <span>
          Máximo asistente <b>+{SPECIAL_PREDICTION_POINTS.topAssist}</b>
        </span>
      </div>

      <div className="special-prediction-form">
        <SearchSelect
          label="Ganador del Mundial"
          value={specialDraft.champion}
          options={teamOptions.map((team) => team.label)}
          points={SPECIAL_PREDICTION_POINTS.champion}
          placeholder="Empieza a escribir un país"
          disabled={specialClosed || isSavingSpecial}
          onChange={(value) => updateSpecialDraft({ champion: value })}
        />
        <SearchSelect
          label="Mejor jugador"
          value={specialDraft.bestPlayer}
          options={PLAYER_CANDIDATES}
          points={SPECIAL_PREDICTION_POINTS.bestPlayer}
          placeholder="Empieza a escribir un jugador"
          disabled={specialClosed || isSavingSpecial}
          onChange={(value) => updateSpecialDraft({ bestPlayer: value })}
        />
        <SearchSelect
          label="Máximo goleador"
          value={specialDraft.topScorer}
          options={PLAYER_CANDIDATES}
          points={SPECIAL_PREDICTION_POINTS.topScorer}
          placeholder="Empieza a escribir un jugador"
          disabled={specialClosed || isSavingSpecial}
          onChange={(value) => updateSpecialDraft({ topScorer: value })}
        />
        <SearchSelect
          label="Máximo asistente"
          value={specialDraft.topAssist}
          options={PLAYER_CANDIDATES}
          points={SPECIAL_PREDICTION_POINTS.topAssist}
          placeholder="Empieza a escribir un jugador"
          disabled={specialClosed || isSavingSpecial}
          onChange={(value) => updateSpecialDraft({ topAssist: value })}
        />
      </div>

      <div className="special-prediction-card__footer">
        <span>
          {specialPrediction
            ? `Guardada. Puede sumar hasta ${SPECIAL_PREDICTION_TOTAL_POINTS} puntos.`
            : `Completa los cuatro campos para optar a ${SPECIAL_PREDICTION_TOTAL_POINTS} puntos.`}
        </span>
        <button className="primary-button" type="button" disabled={specialClosed || isSavingSpecial} onClick={() => void saveSpecialPrediction()}>
          {specialPrediction ? <PencilLine size={16} /> : <Save size={16} />}
          {specialClosed ? 'Predicción cerrada' : specialPrediction ? (isSavingSpecial ? 'Modificando...' : 'Modificar especial') : isSavingSpecial ? 'Guardando...' : 'Guardar especial'}
        </button>
      </div>
    </section>
  );

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Editables hasta el saque inicial</p>
          <h1>Mis predicciones</h1>
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando partidos y predicciones...</p> : null}

      {userId ? <SuperquotaPredictionPanel matches={matches} now={now} userId={userId} /> : null}

      {selectedTeamId ? (
        <div ref={teamProfileRef}>
          <TeamProfile teamId={selectedTeamId} matches={matches} onClose={() => setSelectedTeamId(null)} />
        </div>
      ) : null}

      <RecentPredictionResults
        matches={matches}
        predictions={Object.fromEntries(
          Object.entries(savedPredictions).map(([matchId, prediction]) => [
            matchId,
            {
              home: Number(prediction.home),
              away: Number(prediction.away),
              points: prediction.points,
            },
          ]),
        )}
      />

      <section className="prediction-section">
        <div className="section-heading">
          <h2>Disponibles</h2>
          <span>{availablePredictionMatches.length}</span>
        </div>
        {renderSpecialPredictionSection()}
        {availableBuckets.length > 0 ? (
          <div className="prediction-buckets">
            {availableBuckets.map((bucket) => (
              <section className="prediction-day" key={bucket.title}>
                <div className="section-heading section-heading--compact">
                  <h3>{bucket.title}</h3>
                  <span>{bucket.matches.length}</span>
                </div>
                <div className="prediction-grid">{bucket.matches.map((match) => renderPredictionEditor(match))}</div>
              </section>
            ))}
          </div>
        ) : (
          <p className="empty-state">No hay predicciones disponibles ahora mismo.</p>
        )}
      </section>

      <section className="prediction-section">
        <div className="section-heading">
          <h2>Pasadas</h2>
          <span>{orderedMatches.past.length}</span>
        </div>
        {pastPredictionBuckets.length > 0 ? (
          <div className="past-prediction-groups">
            {pastPredictionBuckets.map((bucket) => (
              <details className="past-prediction-group" key={bucket.id}>
                <summary>
                  <span>
                    <strong>{bucket.title}</strong>
                    <small>{bucket.matches.length} partidos</small>
                  </span>
                  <b>Ver</b>
                </summary>
                <div className="prediction-grid past-prediction-group__grid">
                  {bucket.matches.map((match) => renderPredictionEditor(match, true))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="empty-state">Todavía no hay predicciones pasadas.</p>
        )}
      </section>
    </section>
  );
}
