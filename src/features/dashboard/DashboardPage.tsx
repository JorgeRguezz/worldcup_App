import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, ChevronLeft, ChevronRight, Minus, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { RecentPredictionResults } from '../../components/RecentPredictionResults';
import { demoMatches, demoRanking, teamName } from '../../data/demoTournament';
import { type DecidedBy, type GroupLetter, type Match, type MatchStatus, type Stage } from '../../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../../lib/format';
import { formatRankingPosition } from '../../lib/ranking';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import {
  formatCountdown,
  getSpecialPredictionDeadline,
  SPECIAL_PREDICTION_POINTS,
  type SpecialPredictionRow,
  type VisibleSpecialPredictionRow,
} from '../../lib/specialPredictions';
import { SuperquotaPredictionPanel } from '../superquota/SuperquotaPredictionPanel';

const MADRID_TIME_ZONE = 'Europe/Madrid';
const PREDICTION_DAY_START_HOUR = 7;

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
  points_awarded: number;
};

type VisiblePredictionRow = PredictionRow & {
  user_id: string;
  display_name: string;
};

type RankingRow = {
  user_id?: string;
  display_name: string;
  match_points: number;
  special_points: number;
  superquota_points: number;
  total_points: number;
};

type RankedRow = RankingRow & {
  position: number;
};

type DailyDeltaRow = {
  user_id: string;
  display_name: string;
  current_position: number;
  previous_position: number;
  position_delta: number;
  points_on_day: number;
  current_total_points: number;
};

type PredictionState = 'exact' | 'outcome' | 'miss' | 'none' | 'pending';

type VisiblePredictionMatchGroup = {
  match: Match;
  predictions: VisiblePredictionRow[];
};

type VisibleSuperquotaPredictionRow = {
  match_id: string;
  market_id: string;
  market_title: string;
  user_id: string;
  display_name: string;
  option_id: string;
  option_label: string;
  points_awarded: number;
  is_void: boolean;
  updated_at: string;
};

type VisibleSuperquotaGroup = {
  match: Match;
  marketId: string;
  title: string;
  predictions: VisibleSuperquotaPredictionRow[];
};

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

function rankRows(rows: RankingRow[]): RankedRow[] {
  let previousPoints: number | null = null;
  let currentPosition = 0;

  return [...rows]
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return a.display_name.localeCompare(b.display_name);
    })
    .map((row) => {
      if (previousPoints !== row.total_points) {
        currentPosition += 1;
      }

      previousPoints = row.total_points;
      return { ...row, position: currentPosition };
    });
}

function getPredictionState(match: Match, prediction: PredictionRow | undefined): PredictionState {
  if (!prediction) return 'none';
  if (match.status !== 'FINAL' || match.homeScore === null || match.awayScore === null) return 'pending';
  if (prediction.predicted_home_score === match.homeScore && prediction.predicted_away_score === match.awayScore) return 'exact';
  return prediction.points_awarded > 0 ? 'outcome' : 'miss';
}

function predictionStateCopy(state: PredictionState): { label: string; tone: string } {
  if (state === 'exact') return { label: 'Marcador exacto', tone: 'warn' };
  if (state === 'outcome') return { label: 'Signo acertado', tone: 'good' };
  if (state === 'miss') return { label: 'Fallada', tone: 'danger' };
  if (state === 'pending') return { label: 'Pendiente', tone: 'neutral' };
  return { label: 'Sin predicción', tone: 'neutral' };
}

function resultCardClassName(state: PredictionState): string {
  if (state === 'exact') return 'table-card result-card result-card--exact';
  if (state === 'outcome') return 'table-card result-card result-card--outcome';
  if (state === 'miss') return 'table-card result-card result-card--miss';
  return 'table-card result-card';
}

function toCardPrediction(prediction: PredictionRow | undefined): { home: number; away: number; points: number } | undefined {
  if (!prediction) return undefined;
  return {
    home: prediction.predicted_home_score,
    away: prediction.predicted_away_score,
    points: prediction.points_awarded,
  };
}

function getDashboardPredictionGlow(match: Match, prediction: PredictionRow | undefined): 'locked' | 'missing' | 'modifiable' {
  const isLocked = new Date(match.kickoffAt).getTime() <= Date.now();
  if (isLocked) return 'locked';
  return prediction ? 'modifiable' : 'missing';
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

function addDaysToDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getPredictionDayKey(value: string | Date): string {
  const parts = getMadridDateParts(value);
  const calendarDayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  return parts.hour < PREDICTION_DAY_START_HOUR ? addDaysToDayKey(calendarDayKey, -1) : calendarDayKey;
}

export function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [predictions, setPredictions] = useState<Record<string, PredictionRow>>({});
  const [visiblePredictions, setVisiblePredictions] = useState<Record<string, VisiblePredictionRow[]>>({});
  const [specialPrediction, setSpecialPrediction] = useState<SpecialPredictionRow | null>(null);
  const [visibleSpecialPredictions, setVisibleSpecialPredictions] = useState<VisibleSpecialPredictionRow[]>([]);
  const [visibleSuperquotaPredictions, setVisibleSuperquotaPredictions] = useState<VisibleSuperquotaPredictionRow[]>([]);
  const [dailyDeltas, setDailyDeltas] = useState<DailyDeltaRow[]>([]);
  const [superquotaPointsToday, setSuperquotaPointsToday] = useState(0);
  const [isDailyDeltaReady, setIsDailyDeltaReady] = useState(!isSupabaseConfigured);
  const [rankingRows, setRankingRows] = useState<RankingRow[]>(
    demoRanking.map((row) => ({
      display_name: row.name,
      match_points: row.matchPoints,
      special_points: row.specialPoints,
      superquota_points: 0,
      total_points: row.totalPoints,
    })),
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const publicPredictionsRef = useRef<HTMLDivElement | null>(null);
  const [publicSliderState, setPublicSliderState] = useState({ canGoLeft: false, canGoRight: false });

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setMessage('');

      const { data: userResult } = await supabase!.auth.getUser();
      if (!isMounted) return;

      const currentUserId = userResult.user?.id ?? null;
      setUserId(currentUserId);
      const yesterdayKey = addDaysToDayKey(getPredictionDayKey(new Date()), -1);

      const [
        matchResult,
        rankingResult,
        predictionResult,
        deltaResult,
        visiblePredictionResult,
        specialPredictionResult,
        visibleSpecialResult,
        visibleSuperquotaResult,
        superquotaPointsTodayResult,
      ] = await Promise.all([
        supabase!
          .from('matches')
          .select(
            'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
          )
          .order('kickoff_at', { ascending: true }),
        supabase!
          .from('ranking')
          .select('user_id, display_name, match_points, special_points, total_points')
          .order('total_points', { ascending: false })
          .order('display_name', { ascending: true }),
        currentUserId
          ? supabase!
              .from('predictions')
              .select('match_id, predicted_home_score, predicted_away_score, points_awarded')
              .eq('user_id', currentUserId)
          : Promise.resolve({ data: [], error: null }),
        supabase!.rpc('ranking_daily_delta', { p_day: yesterdayKey }),
        supabase!.rpc('visible_match_predictions'),
        currentUserId
          ? supabase!
              .from('special_predictions')
              .select(
                'user_id, champion_team_id, best_player_name, top_scorer_player_name, top_assist_player_name, champion_points_awarded, best_player_points_awarded, top_scorer_points_awarded, top_assist_points_awarded, points_awarded, updated_at',
              )
              .eq('user_id', currentUserId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase!.rpc('visible_special_predictions'),
        supabase!.rpc('visible_superquota_predictions'),
        currentUserId
          ? supabase!.rpc('user_superquota_points_on_day', { p_day: getPredictionDayKey(new Date()) })
          : Promise.resolve({ data: 0, error: null }),
      ]);

      if (!isMounted) return;

      if (matchResult.error) setMessage(`No pude cargar los partidos: ${matchResult.error.message}`);
      else setMatches(((matchResult.data ?? []) as MatchRow[]).map(toMatch));

      if (rankingResult.error) setMessage(`No pude cargar el ranking: ${rankingResult.error.message}`);
      else setRankingRows((rankingResult.data ?? []) as RankingRow[]);

      if (predictionResult.error) {
        setMessage(`No pude cargar tus predicciones: ${predictionResult.error.message}`);
      } else {
        setPredictions(
          Object.fromEntries(((predictionResult.data ?? []) as PredictionRow[]).map((prediction) => [prediction.match_id, prediction])),
        );
      }

      if (!deltaResult.error) {
        setDailyDeltas((deltaResult.data ?? []) as DailyDeltaRow[]);
        setIsDailyDeltaReady(true);
      } else {
        setIsDailyDeltaReady(false);
      }

      if (!visiblePredictionResult.error) {
        const groupedPredictions = ((visiblePredictionResult.data ?? []) as VisiblePredictionRow[]).reduce<
          Record<string, VisiblePredictionRow[]>
        >((grouped, prediction) => {
          grouped[prediction.match_id] = [...(grouped[prediction.match_id] ?? []), prediction];
          return grouped;
        }, {});
        setVisiblePredictions(groupedPredictions);
      }

      if (!specialPredictionResult.error) {
        setSpecialPrediction((specialPredictionResult.data as SpecialPredictionRow | null) ?? null);
      }

      if (!visibleSpecialResult.error) {
        setVisibleSpecialPredictions((visibleSpecialResult.data ?? []) as VisibleSpecialPredictionRow[]);
      }

      if (!visibleSuperquotaResult.error) {
        setVisibleSuperquotaPredictions((visibleSuperquotaResult.data ?? []) as VisibleSuperquotaPredictionRow[]);
      }

      if (!superquotaPointsTodayResult.error) {
        setSuperquotaPointsToday(Number(superquotaPointsTodayResult.data ?? 0));
      }

      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentPredictionDayKey = useMemo(() => getPredictionDayKey(new Date()), []);
  const todayPredictionMatches = useMemo(
    () =>
      matches
        .filter((match) => match.homeTeamId && match.awayTeamId && match.status !== 'FINAL')
        .filter((match) => getPredictionDayKey(match.kickoffAt) === currentPredictionDayKey)
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
    [currentPredictionDayKey, matches],
  );
  const predictedTodayMatches = useMemo(
    () => todayPredictionMatches.filter((match) => Boolean(predictions[match.id])),
    [predictions, todayPredictionMatches],
  );
  const missingTodayMatches = useMemo(
    () => todayPredictionMatches.filter((match) => !predictions[match.id]),
    [predictions, todayPredictionMatches],
  );
  const recentMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status === 'FINAL')
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
        .slice(0, 6),
    [matches],
  );
  const rankedRows = useMemo(() => rankRows(rankingRows), [rankingRows]);
  const specialDeadline = useMemo(() => getSpecialPredictionDeadline(matches), [matches]);
  const isSpecialClosed = now >= specialDeadline.getTime();
  const specialCountdown = formatCountdown(specialDeadline, now);
  const publicSpecialPredictions = isSpecialClosed ? visibleSpecialPredictions : [];
  const currentUserRank = rankedRows.find((row) => row.user_id === userId) ?? null;
  const currentUserDelta = dailyDeltas.find((row) => row.user_id === userId) ?? null;
  const todayPoints = Object.values(predictions).reduce((total, prediction) => {
    const match = matches.find((item) => item.id === prediction.match_id);
    if (!match || match.status !== 'FINAL' || getPredictionDayKey(match.kickoffAt) !== currentPredictionDayKey) return total;
    return total + prediction.points_awarded;
  }, superquotaPointsToday);
  const rankDelta = currentUserDelta?.position_delta ?? 0;
  const rankDeltaCopy = !currentUserRank
    ? { label: '-', tone: 'neutral', Icon: Minus }
    : !isDailyDeltaReady
      ? { label: 'Pendiente', tone: 'neutral', Icon: Minus }
      : rankDelta > 0
      ? { label: `+${rankDelta}`, tone: 'good', Icon: ArrowUp }
      : rankDelta < 0
        ? { label: String(rankDelta), tone: 'danger', Icon: ArrowDown }
        : { label: '0', tone: 'neutral', Icon: Minus };
  const visiblePredictionGroups = useMemo<VisiblePredictionMatchGroup[]>(
    () =>
      matches
        .filter((match) => match.status !== 'FINAL')
        .sort((a, b) => {
          const kickoffDiff = new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
          if (kickoffDiff !== 0) return kickoffDiff;
          return a.fifaMatchNumber - b.fifaMatchNumber;
        })
        .map((match) => ({
          match,
          predictions: (visiblePredictions[match.id] ?? [])
            .filter((prediction) => !userId || prediction.user_id !== userId)
            .sort((a, b) => a.display_name.localeCompare(b.display_name)),
        }))
        .filter((group) => group.predictions.length > 0)
        .slice(0, 6),
    [matches, userId, visiblePredictions],
  );
  const visibleSuperquotaGroups = useMemo<VisibleSuperquotaGroup[]>(() => {
    const grouped = new Map<string, VisibleSuperquotaGroup>();

    visibleSuperquotaPredictions
      .filter((prediction) => !userId || prediction.user_id !== userId)
      .forEach((prediction) => {
        const match = matches.find((candidate) => candidate.id === prediction.match_id);
        if (!match) return;
        const current = grouped.get(prediction.market_id);
        if (current) {
          current.predictions.push(prediction);
        } else {
          grouped.set(prediction.market_id, {
            match,
            marketId: prediction.market_id,
            title: prediction.market_title,
            predictions: [prediction],
          });
        }
      });

    return [...grouped.values()]
      .map((group) => ({
        ...group,
        predictions: group.predictions.sort((a, b) => a.display_name.localeCompare(b.display_name)),
      }))
      .sort((a, b) => new Date(a.match.kickoffAt).getTime() - new Date(b.match.kickoffAt).getTime());
  }, [matches, userId, visibleSuperquotaPredictions]);
  const visiblePublicPredictionGroupCount =
    visiblePredictionGroups.length + visibleSuperquotaGroups.length + (publicSpecialPredictions.length > 0 ? 1 : 0);
  const updatePublicSliderState = useCallback(() => {
    const slider = publicPredictionsRef.current;
    if (!slider) {
      setPublicSliderState({ canGoLeft: false, canGoRight: false });
      return;
    }

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    const nextState = {
      canGoLeft: slider.scrollLeft > 4,
      canGoRight: maxScrollLeft - slider.scrollLeft > 4,
    };

    setPublicSliderState((current) =>
      current.canGoLeft === nextState.canGoLeft && current.canGoRight === nextState.canGoRight ? current : nextState,
    );
  }, []);

  useEffect(() => {
    updatePublicSliderState();
    const slider = publicPredictionsRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', updatePublicSliderState, { passive: true });
    window.addEventListener('resize', updatePublicSliderState);

    return () => {
      slider.removeEventListener('scroll', updatePublicSliderState);
      window.removeEventListener('resize', updatePublicSliderState);
    };
  }, [updatePublicSliderState, visiblePredictionGroups.length]);

  const scrollPublicPredictions = (direction: 'left' | 'right') => {
    const slider = publicPredictionsRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction === 'left' ? -slider.clientWidth : slider.clientWidth,
      behavior: 'smooth',
    });
    window.setTimeout(updatePublicSliderState, 260);
  };

  const renderSpecialPredictionSummary = (prediction: SpecialPredictionRow) => (
    <div className="special-selection-list">
      <span>
        Campeón <b>{teamName(prediction.champion_team_id)}</b>
      </span>
      <span>
        Mejor jugador <b>{prediction.best_player_name}</b>
      </span>
      <span>
        Máximo goleador <b>{prediction.top_scorer_player_name}</b>
      </span>
      <span>
        Máximo asistente <b>{prediction.top_assist_player_name}</b>
      </span>
    </div>
  );

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resumen de la porra</p>
          <h1>Inicio</h1>
        </div>
        <Link className="primary-link" to="/predicciones">
          Mis predicciones <ArrowRight size={16} />
        </Link>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando resumen...</p> : null}

      {userId ? <SuperquotaPredictionPanel matches={matches} now={now} userId={userId} variant="spotlight" /> : null}

      <div className="metric-grid">
        <article className="metric">
          <Target size={22} />
          <span>Posición ranking</span>
          <strong>{formatRankingPosition(currentUserRank?.position)}</strong>
        </article>
        <article className="metric">
          <CalendarDays size={22} />
          <span>Puntos hoy</span>
          <strong>+{todayPoints}</strong>
        </article>
        <article className={`metric metric--${rankDeltaCopy.tone}`}>
          <rankDeltaCopy.Icon size={22} />
          <span>Cambio ranking</span>
          <strong>{rankDeltaCopy.label}</strong>
        </article>
      </div>

      <section className={`special-announcement${isSpecialClosed ? ' special-announcement--closed' : ''}`}>
        <div className="special-announcement__content">
          <p className="eyebrow">Predicción especial</p>
          <h2>{isSpecialClosed ? 'La predicción especial está cerrada' : 'Última llamada antes de eliminatorias'}</h2>
          <p>
            Acierta el campeón {SPECIAL_PREDICTION_POINTS.champion} pts, mejor jugador {SPECIAL_PREDICTION_POINTS.bestPlayer} pts, goleador{' '}
            {SPECIAL_PREDICTION_POINTS.topScorer} pts y asistente {SPECIAL_PREDICTION_POINTS.topAssist} pts.
          </p>
          {specialPrediction ? renderSpecialPredictionSummary(specialPrediction) : <p className="empty-state">Todavía no has guardado esta predicción.</p>}
        </div>
        <div className="special-announcement__action">
          <strong className="countdown-alert">{isSpecialClosed ? 'Cerrada' : specialCountdown}</strong>
          <span>Hasta {formatMadridDateTime(specialDeadline.toISOString())}</span>
          <Link className="primary-link" to="/predicciones">
            {specialPrediction ? 'Ver o modificar' : 'Registrar predicción'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <RecentPredictionResults matches={matches} predictions={Object.fromEntries(Object.entries(predictions).map(([matchId, prediction]) => [matchId, {
        home: prediction.predicted_home_score,
        away: prediction.predicted_away_score,
        points: prediction.points_awarded,
      }]))} />

      <div className="split-section dashboard-main">
        <section className="prediction-section dashboard-predictions-section">
          <div className="section-heading">
            <h2>Predicciones de hoy</h2>
            <span>{todayPredictionMatches.length}</span>
          </div>
          <div className="prediction-buckets">
            <section className="prediction-day">
              <div className="section-heading section-heading--compact">
                <h3>Ya hechas</h3>
                <span>{predictedTodayMatches.length}</span>
              </div>
              <div className="match-list">
                {predictedTodayMatches.length > 0 ? (
                  predictedTodayMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      prediction={toCardPrediction(predictions[match.id])}
                      glow={getDashboardPredictionGlow(match, predictions[match.id])}
                      hideStatusPill
                    />
                  ))
                ) : (
                  <section className="table-card">
                    <p className="empty-state">Todavía no has guardado predicciones para los partidos de este día.</p>
                  </section>
                )}
              </div>
            </section>

            <section className="prediction-day">
              <div className="section-heading section-heading--compact">
                <h3>Por predecir</h3>
                <span>{missingTodayMatches.length}</span>
              </div>
              <div className="match-list">
                {missingTodayMatches.length > 0 ? (
                  missingTodayMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      prediction={toCardPrediction(predictions[match.id])}
                      glow={getDashboardPredictionGlow(match, predictions[match.id])}
                      hideStatusPill
                    />
                  ))
                ) : todayPredictionMatches.length > 0 ? (
                  <section className="table-card">
                    <p className="empty-state">Vas al día: no te falta ninguna predicción para hoy.</p>
                  </section>
                ) : (
                  <section className="table-card">
                    <p className="empty-state">No hay partidos pendientes en el día operativo actual.</p>
                  </section>
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="prediction-section dashboard-public-section">
          <div className="section-heading">
            <h2>Qué han apostado</h2>
            <span>{visiblePublicPredictionGroupCount}</span>
          </div>
          <div className="table-card rank-predictions">
            {visiblePredictionGroups.length > 0 || visibleSuperquotaGroups.length > 0 || publicSpecialPredictions.length > 0 ? (
              <>
                {visibleSuperquotaGroups.map((group) => (
                  <article className="public-prediction-match public-prediction-match--superquota" key={`superquota-${group.marketId}`}>
                    <div className="public-prediction-match__header">
                      <div>
                        <span>Supercuota · {teamName(group.match.homeTeamId)} vs {teamName(group.match.awayTeamId)}</span>
                        <h4>{group.title}</h4>
                      </div>
                      <span className="match-card__state match-card__state--locked">
                        <span className="match-card__state-dot" />
                        Cerrada
                      </span>
                    </div>
                    <div className="public-prediction-match__rows">
                      {group.predictions.map((prediction) => (
                        <div className="public-prediction-row" key={`${prediction.market_id}-${prediction.user_id}`}>
                          <strong>{prediction.display_name}</strong>
                          <b>{prediction.option_label}</b>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
                {publicSpecialPredictions.length > 0 ? (
                  <article className="public-prediction-match public-prediction-match--special">
                    <div className="public-prediction-match__header">
                      <h4>Predicción especial</h4>
                      <span className="match-card__state match-card__state--locked">
                        <span className="match-card__state-dot" />
                        Cerrada
                      </span>
                    </div>
                    <div className="public-prediction-match__rows">
                      {publicSpecialPredictions.map((prediction) => (
                        <div className="public-prediction-row public-prediction-row--special" key={`special-${prediction.user_id}`}>
                          <strong>{prediction.display_name}</strong>
                          <span>{teamName(prediction.champion_team_id)}</span>
                          <small>{prediction.best_player_name}</small>
                          <small>{prediction.top_scorer_player_name}</small>
                          <small>{prediction.top_assist_player_name}</small>
                          <b>+{prediction.points_awarded}</b>
                        </div>
                      ))}
                    </div>
                  </article>
                ) : null}
                <div className="public-predictions" ref={publicPredictionsRef}>
                {visiblePredictionGroups.map((group) => (
                  <article className="public-prediction-match" key={group.match.id}>
                    <div className="public-prediction-match__header">
                      <h4>
                        {teamName(group.match.homeTeamId)} vs {teamName(group.match.awayTeamId)}
                      </h4>
                      <span className="match-card__state match-card__state--locked">
                        <span className="match-card__state-dot" />
                        En juego
                      </span>
                    </div>
                    <div className="public-prediction-match__rows">
                      {group.predictions.map((prediction) => (
                        <div className="public-prediction-row" key={`${prediction.match_id}-${prediction.user_id}`}>
                          <strong>{prediction.display_name}</strong>
                          <b>
                            {prediction.predicted_home_score}-{prediction.predicted_away_score}
                          </b>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
                </div>
                <button
                  className="public-predictions__control public-predictions__control--left"
                  type="button"
                  aria-label="Ver partido anterior"
                  disabled={!publicSliderState.canGoLeft}
                  onClick={() => scrollPublicPredictions('left')}
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  className="public-predictions__control public-predictions__control--right"
                  type="button"
                  aria-label="Ver siguiente partido"
                  disabled={!publicSliderState.canGoRight}
                  onClick={() => scrollPublicPredictions('right')}
                >
                  <ChevronRight size={19} />
                </button>
              </>
            ) : (
              <p className="empty-state">
                Solo podrás ver las apuestas de los demás cuando el partido esté en juego. La predicción especial se verá al cerrar la fase de grupos.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="prediction-section">
        <div className="section-heading">
          <h2>Últimos partidos</h2>
          <span>{recentMatches.length}</span>
        </div>
        <div className="recent-results">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => {
              const prediction = predictions[match.id];
              const state = getPredictionState(match, prediction);
              const copy = predictionStateCopy(state);

              return (
                <article className={resultCardClassName(state)} key={match.id}>
                  {state === 'exact' || state === 'outcome' || state === 'miss' ? (
                    <span className="prediction-result-indicator" aria-hidden="true">
                      {state === 'exact' ? '+3' : state === 'outcome' ? '+1' : '×'}
                    </span>
                  ) : null}
                  <div>
                    <p className="eyebrow">{formatMadridDateTime(match.kickoffAt)}</p>
                    <h3>
                      {teamName(match.homeTeamId)} {formatScore(match.homeScore, match.awayScore)} {teamName(match.awayTeamId)}
                    </h3>
                  </div>
                  <div className={`prediction-badge prediction-badge--${copy.tone}`}>
                    <strong>{copy.label}</strong>
                    <span>
                      {prediction
                        ? `${prediction.predicted_home_score}-${prediction.predicted_away_score} · ${prediction.points_awarded} pts`
                      : 'Sin marcador guardado'}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="table-card">
              <p className="empty-state">Todavía no hay partidos finalizados.</p>
            </section>
          )}
        </div>
      </section>
    </section>
  );
}
