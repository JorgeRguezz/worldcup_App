import { PencilLine, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { TeamProfile } from '../../components/TeamProfile';
import { demoMatches, teamName } from '../../data/demoTournament';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage } from '../../domain/worldCupEngine';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

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

type PredictionUpsertRow = {
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_advancing_team_id: string | null;
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

export function PredictionsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [drafts, setDrafts] = useState<Record<string, DraftPrediction>>({});
  const [savedPredictions, setSavedPredictions] = useState<Record<string, DraftPrediction>>({});
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const teamProfileRef = useRef<HTMLDivElement | null>(null);

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

      const [{ data: matchRows, error: matchError }, { data: predictionRows, error: predictionError }] = await Promise.all([
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

      setIsLoading(false);
    }

    void loadPredictions();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderedMatches = useMemo(() => {
    const now = Date.now();
    const byKickoffAsc = (a: Match, b: Match) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
    const byKickoffDesc = (a: Match, b: Match) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();

    return {
      available: matches
        .filter((match) => match.homeTeamId && match.awayTeamId && new Date(match.kickoffAt).getTime() > now)
        .sort(byKickoffAsc),
      past: matches
        .filter((match) => !match.homeTeamId || !match.awayTeamId || new Date(match.kickoffAt).getTime() <= now)
        .sort(byKickoffDesc),
    };
  }, [matches]);

  const availableBuckets = useMemo<PredictionBucket[]>(() => {
    const todayKey = getPredictionDayKey(new Date());
    const tomorrowKey = addDaysToDayKey(todayKey, 1);

    const today = orderedMatches.available.filter((match) => getPredictionDayKey(match.kickoffAt) === todayKey);
    const tomorrow = orderedMatches.available.filter((match) => getPredictionDayKey(match.kickoffAt) === tomorrowKey);

    return [
      { title: 'Hoy', matches: today },
      { title: 'Mañana', matches: tomorrow },
    ].filter((bucket) => bucket.matches.length > 0);
  }, [orderedMatches.available]);
  const availablePredictionMatches = useMemo(() => availableBuckets.flatMap((bucket) => bucket.matches), [availableBuckets]);

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
    if (isLocked(match)) return `El partido M${match.fifaMatchNumber} ya empezó y no se puede guardar.`;
    if (!match.homeTeamId || !match.awayTeamId) return `El partido M${match.fifaMatchNumber} todavía no tiene equipos definidos.`;
    if (!isCompleteDraft(draft)) return `Completa el marcador del partido M${match.fifaMatchNumber} antes de guardar.`;

    const home = Number(draft.home);
    const away = Number(draft.away);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0 || home > 20 || away > 20) {
      return 'Los marcadores deben ser números enteros entre 0 y 20.';
    }

    const isKnockoutDraw = match.stage !== 'GROUP' && home === away;
    if (isKnockoutDraw && !draft.advancingTeamId) {
      return `El partido M${match.fifaMatchNumber} necesita elegir qué equipo avanza.`;
    }

    return {
      user_id: currentUserId,
      match_id: match.id,
      predicted_home_score: home,
      predicted_away_score: away,
      predicted_advancing_team_id: isKnockoutDraw ? draft.advancingTeamId : null,
    };
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
    setMessage(wasSaved ? `Apuesta M${match.fifaMatchNumber} modificada.` : `Apuesta M${match.fifaMatchNumber} guardada.`);
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
    const predictionResult = readOnly && predictionForCard ? (predictionForCard.points > 0 ? 'correct' : 'miss') : undefined;
    const isKnockoutDraw = match.stage !== 'GROUP' && draft !== undefined && draft.home !== '' && draft.away !== '' && draft.home === draft.away;

    return (
      <div className={`prediction-editor${editorGlowClass}`} key={match.id}>
        <MatchCard
          match={match}
          prediction={predictionForCard}
          predictionStatus={predictionStatus}
          predictionResult={predictionResult}
          onTeamClick={showTeamProfile}
        />
        {readOnly ? null : (
          <>
            <div className="score-inputs" aria-label={`Predicción M${match.fifaMatchNumber}`}>
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

      {selectedTeamId ? (
        <div ref={teamProfileRef}>
          <TeamProfile teamId={selectedTeamId} matches={matches} onClose={() => setSelectedTeamId(null)} />
        </div>
      ) : null}

      <section className="prediction-section">
        <div className="section-heading">
          <h2>Disponibles</h2>
          <span>{availablePredictionMatches.length}</span>
        </div>
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
        {orderedMatches.past.length > 0 ? (
          <div className="prediction-grid">{orderedMatches.past.map((match) => renderPredictionEditor(match, true))}</div>
        ) : (
          <p className="empty-state">Todavía no hay predicciones pasadas.</p>
        )}
      </section>
    </section>
  );
}
