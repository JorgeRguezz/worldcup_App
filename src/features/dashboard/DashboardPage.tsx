import { CalendarDays, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { RecentPredictionResults, type SuperquotaResult } from '../../components/RecentPredictionResults';
import { demoMatches, demoRanking, demoTeams, teamName } from '../../data/demoTournament';
import { flagForTeamId } from '../../data/teamFlags';
import { type DecidedBy, type GroupLetter, type Match, type MatchStatus, type Stage } from '../../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../../lib/format';
import { formatRankingPosition } from '../../lib/ranking';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { getSpecialPredictionDeadline, SPECIAL_PREDICTION_POINTS, type SpecialPredictionRow } from '../../lib/specialPredictions';
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
  updated_at: string;
};

type SuperquotaPointsRow = {
  market_id: string;
  option_id: string;
  points_awarded: number;
  is_void: boolean;
  updated_at: string;
};

type SuperquotaResultMarketRow = {
  id: string;
  match_id: string;
  title: string;
  status: 'PUBLISHED' | 'RESOLVED';
  correct_option_id: string | null;
  resolved_at: string | null;
};

type SuperquotaResultOptionRow = {
  id: string;
  label: string;
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

type PredictionState = 'exact' | 'outcome' | 'miss' | 'none' | 'pending';

type VisiblePredictionMatchGroup = {
  match: Match;
  ownAnswer: string | null;
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
  ownAnswer: string | null;
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

function compactTeamName(teamId: string | null): string {
  if (!teamId) return 'TBD';
  return demoTeams.find((team) => team.id === teamId)?.shortName ?? teamId;
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
  const [visibleSuperquotaPredictions, setVisibleSuperquotaPredictions] = useState<VisibleSuperquotaPredictionRow[]>([]);
  const [superquotaPointRows, setSuperquotaPointRows] = useState<SuperquotaPointsRow[]>([]);
  const [superquotaResultMarkets, setSuperquotaResultMarkets] = useState<SuperquotaResultMarketRow[]>([]);
  const [superquotaResultOptions, setSuperquotaResultOptions] = useState<SuperquotaResultOptionRow[]>([]);
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
      const [
        matchResult,
        rankingResult,
        predictionResult,
        visiblePredictionResult,
        specialPredictionResult,
        visibleSuperquotaResult,
        superquotaPointsResult,
        superquotaMarketsResult,
        superquotaOptionsResult,
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
              .select('match_id, predicted_home_score, predicted_away_score, points_awarded, updated_at')
              .eq('user_id', currentUserId)
          : Promise.resolve({ data: [], error: null }),
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
        supabase!.rpc('visible_superquota_predictions'),
        currentUserId
          ? supabase!
              .from('superquota_predictions')
              .select('market_id, option_id, points_awarded, is_void, updated_at')
              .eq('user_id', currentUserId)
          : Promise.resolve({ data: [], error: null }),
        supabase!
          .from('superquota_markets')
          .select('id, match_id, title, status, correct_option_id, resolved_at')
          .in('status', ['PUBLISHED', 'RESOLVED']),
        supabase!
          .from('superquota_options')
          .select('id, label'),
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

      if (!visibleSuperquotaResult.error) {
        setVisibleSuperquotaPredictions((visibleSuperquotaResult.data ?? []) as VisibleSuperquotaPredictionRow[]);
      }

      if (!superquotaPointsResult.error) {
        setSuperquotaPointRows((superquotaPointsResult.data ?? []) as SuperquotaPointsRow[]);
      }

      if (!superquotaMarketsResult.error) {
        setSuperquotaResultMarkets((superquotaMarketsResult.data ?? []) as SuperquotaResultMarketRow[]);
      }

      if (!superquotaOptionsResult.error) {
        setSuperquotaResultOptions((superquotaOptionsResult.data ?? []) as SuperquotaResultOptionRow[]);
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
  const currentUserRank = rankedRows.find((row) => row.user_id === userId) ?? null;
  const rollingDayCutoff = now - 24 * 60 * 60 * 1000;
  const jornadaPoints = Object.values(predictions).reduce(
    (total, prediction) =>
      new Date(prediction.updated_at).getTime() >= rollingDayCutoff ? total + prediction.points_awarded : total,
    superquotaPointRows.reduce(
      (total, prediction) =>
        !prediction.is_void && new Date(prediction.updated_at).getTime() >= rollingDayCutoff
          ? total + prediction.points_awarded
          : total,
      specialPrediction && new Date(specialPrediction.updated_at).getTime() >= rollingDayCutoff
        ? specialPrediction.points_awarded
        : 0,
    ),
  );
  const recentSuperquotaResults = useMemo<SuperquotaResult[]>(() => {
    const marketsById = new Map(superquotaResultMarkets.map((market) => [market.id, market]));
    const optionsById = new Map(superquotaResultOptions.map((option) => [option.id, option]));

    return superquotaPointRows.flatMap((prediction) => {
      const market = marketsById.get(prediction.market_id);
      const selectedOption = optionsById.get(prediction.option_id);
      const correctOption = market?.correct_option_id ? optionsById.get(market.correct_option_id) : null;
      if (prediction.is_void || !market?.resolved_at || !selectedOption || !correctOption) return [];
      return [{
        id: prediction.market_id,
        title: market.title,
        selectedAnswer: selectedOption.label,
        correctAnswer: correctOption.label,
        points: prediction.points_awarded,
        resolvedAt: market.resolved_at,
      }];
    });
  }, [superquotaPointRows, superquotaResultMarkets, superquotaResultOptions]);
  const visiblePredictionGroups = useMemo<VisiblePredictionMatchGroup[]>(
    () =>
      matches
        .filter((match) => match.status === 'LIVE')
        .sort((a, b) => {
          const kickoffDiff = new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
          if (kickoffDiff !== 0) return kickoffDiff;
          return a.fifaMatchNumber - b.fifaMatchNumber;
        })
        .map((match) => ({
          match,
          ownAnswer: predictions[match.id]
            ? `${predictions[match.id].predicted_home_score}-${predictions[match.id].predicted_away_score}`
            : null,
          predictions: (visiblePredictions[match.id] ?? [])
            .filter((prediction) => !userId || prediction.user_id !== userId)
            .sort((a, b) => a.display_name.localeCompare(b.display_name)),
        }))
        .slice(0, 6),
    [matches, predictions, userId, visiblePredictions],
  );
  const visibleSuperquotaGroups = useMemo<VisibleSuperquotaGroup[]>(() => {
    return superquotaResultMarkets
      .filter((market) => market.status === 'PUBLISHED')
      .flatMap((market) => {
        const match = matches.find((candidate) => candidate.id === market.match_id && candidate.status === 'LIVE');
        if (!match) return [];
        const marketPredictions = visibleSuperquotaPredictions.filter((prediction) => prediction.market_id === market.id);
        const ownPrediction = marketPredictions.find((prediction) => prediction.user_id === userId);
        return [{
          match,
          marketId: market.id,
          title: market.title,
          ownAnswer: ownPrediction?.option_label ?? null,
          predictions: marketPredictions
            .filter((prediction) => !userId || prediction.user_id !== userId)
            .sort((a, b) => a.display_name.localeCompare(b.display_name)),
        }];
      })
      .sort((a, b) => new Date(a.match.kickoffAt).getTime() - new Date(b.match.kickoffAt).getTime());
  }, [matches, superquotaResultMarkets, userId, visibleSuperquotaPredictions]);
  const visiblePublicPredictionGroupCount = visiblePredictionGroups.length + visibleSuperquotaGroups.length;
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
  }, [updatePublicSliderState, visiblePublicPredictionGroupCount]);

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
        Campeón <b>{teamName(prediction.champion_team_id)}</b><small>+{SPECIAL_PREDICTION_POINTS.champion}</small>
      </span>
      <span>
        Mejor jugador <b>{prediction.best_player_name}</b><small>+{SPECIAL_PREDICTION_POINTS.bestPlayer}</small>
      </span>
      <span>
        Máximo goleador <b>{prediction.top_scorer_player_name}</b><small>+{SPECIAL_PREDICTION_POINTS.topScorer}</small>
      </span>
      <span>
        Máximo asistente <b>{prediction.top_assist_player_name}</b><small>+{SPECIAL_PREDICTION_POINTS.topAssist}</small>
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
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando resumen...</p> : null}

      <div className="metric-grid metric-grid--dashboard">
        <article className="metric">
          <Target size={22} />
          <span>Posición ranking</span>
          <strong>{formatRankingPosition(currentUserRank?.position)}</strong>
        </article>
        <article className="metric metric--good">
          <CalendarDays size={22} />
          <span>Puntos jornada</span>
          <strong>+{jornadaPoints}</strong>
        </article>
      </div>

      {userId ? <SuperquotaPredictionPanel matches={matches} now={now} userId={userId} variant="spotlight" /> : null}

      <RecentPredictionResults
        matches={matches}
        predictions={Object.fromEntries(Object.entries(predictions).map(([matchId, prediction]) => [matchId, {
          home: prediction.predicted_home_score,
          away: prediction.predicted_away_score,
          points: prediction.points_awarded,
        }]))}
        superquotaResults={recentSuperquotaResults}
      />

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
                  predictedTodayMatches.map((match) => {
                    const prediction = predictions[match.id];
                    const isModifiable = new Date(match.kickoffAt).getTime() > now;
                    return (
                      <article className={`table-card dashboard-saved-prediction${isModifiable ? ' is-modifiable' : ''}`} key={match.id}>
                        <div className="dashboard-saved-prediction__header">
                          <time dateTime={match.kickoffAt}>{formatMadridDateTime(match.kickoffAt)}</time>
                        </div>
                        <div className="dashboard-saved-prediction__body">
                          <div className={`dashboard-saved-prediction__match${isModifiable ? ' is-modifiable' : ''}`}>
                            <span className="dashboard-saved-prediction__team">
                              <span aria-hidden="true">{flagForTeamId(match.homeTeamId)}</span>
                              <strong>{compactTeamName(match.homeTeamId)}</strong>
                            </span>
                            <strong className="dashboard-saved-prediction__score">{prediction.predicted_home_score}</strong>
                            <span className="dashboard-saved-prediction__separator">–</span>
                            <strong className="dashboard-saved-prediction__score">{prediction.predicted_away_score}</strong>
                            <span className="dashboard-saved-prediction__team">
                              <span aria-hidden="true">{flagForTeamId(match.awayTeamId)}</span>
                              <strong>{compactTeamName(match.awayTeamId)}</strong>
                            </span>
                          </div>
                          <Link className="dashboard-saved-prediction__modify" to="/predicciones">Modificar</Link>
                        </div>
                      </article>
                    );
                  })
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

          <section className="special-announcement">
            <div className="special-announcement__heading">
              <h2>Predicción especial</h2>
              <strong className={`special-announcement__status${isSpecialClosed ? ' is-closed' : ''}`}>
                {isSpecialClosed ? 'Cerrada' : 'Abierta'}
              </strong>
            </div>
            {specialPrediction ? renderSpecialPredictionSummary(specialPrediction) : <p className="empty-state">Sin predicción guardada</p>}
          </section>
        </section>

        <section className="prediction-section dashboard-public-section">
          <div className="section-heading">
            <h2>Qué han apostado</h2>
            <span>{visiblePublicPredictionGroupCount}</span>
          </div>
          <div className="table-card rank-predictions">
            {visiblePredictionGroups.length > 0 ? (
              <>
                <div className="public-predictions" ref={publicPredictionsRef}>
                {visiblePredictionGroups.map((group) => (
                  <Fragment key={group.match.id}>
                    <article className="public-prediction-match">
                      <div className="public-prediction-match__header">
                        <div className="public-prediction-match__title">
                          <h4>{teamName(group.match.homeTeamId)} vs {teamName(group.match.awayTeamId)}</h4>
                          <span>Tu apuesta: <b>{group.ownAnswer ?? 'Sin respuesta'}</b></span>
                        </div>
                        <span className="match-card__state match-card__state--locked">
                          <span className="match-card__state-dot" />
                          En juego
                        </span>
                      </div>
                      <div className="public-prediction-match__rows">
                        {group.predictions.length > 0 ? group.predictions.map((prediction) => (
                          <div className="public-prediction-row" key={`${prediction.match_id}-${prediction.user_id}`}>
                            <strong>{prediction.display_name}</strong>
                            <b>{prediction.predicted_home_score}-{prediction.predicted_away_score}</b>
                          </div>
                        )) : <p className="empty-state">Nadie más respondió este partido.</p>}
                      </div>
                    </article>

                    {visibleSuperquotaGroups
                      .filter((superquota) => superquota.match.id === group.match.id)
                      .map((superquota) => (
                        <article className="public-prediction-match public-prediction-match--superquota" key={`superquota-${superquota.marketId}`}>
                          <div className="public-prediction-match__header">
                            <div className="public-prediction-match__title">
                              <span>Supercuota · {teamName(superquota.match.homeTeamId)} vs {teamName(superquota.match.awayTeamId)}</span>
                              <h4>{superquota.title}</h4>
                              <span>Tu apuesta: <b>{superquota.ownAnswer ?? 'Sin respuesta'}</b></span>
                            </div>
                            <span className="match-card__state match-card__state--locked">
                              <span className="match-card__state-dot" />
                              En juego
                            </span>
                          </div>
                          <div className="public-prediction-match__rows">
                            {superquota.predictions.length > 0 ? superquota.predictions.map((prediction) => (
                              <div className="public-prediction-row" key={`${prediction.market_id}-${prediction.user_id}`}>
                                <strong>{prediction.display_name}</strong>
                                <b>{prediction.option_label}</b>
                              </div>
                            )) : <p className="empty-state">Nadie más respondió esta Supercuota.</p>}
                          </div>
                        </article>
                      ))}
                  </Fragment>
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
              <p className="public-predictions__empty">Nada en juego</p>
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
                      {prediction && prediction.points_awarded > 0 ? `+${prediction.points_awarded}` : '×'}
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
