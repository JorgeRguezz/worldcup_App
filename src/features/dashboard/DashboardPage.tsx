import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, Minus, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { demoMatches, demoRanking, teamName } from '../../data/demoTournament';
import { withFlag } from '../../data/teamFlags';
import {
  compareOutcome,
  type DecidedBy,
  type GroupLetter,
  type Match,
  type MatchStatus,
  type Stage,
} from '../../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../../lib/format';
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
  let previousPosition = 0;

  return [...rows]
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return a.display_name.localeCompare(b.display_name);
    })
    .map((row, index) => {
      const position = previousPoints === row.total_points ? previousPosition : index + 1;
      previousPoints = row.total_points;
      previousPosition = position;
      return { ...row, position };
    });
}

function getPredictionState(match: Match, prediction: PredictionRow | undefined): PredictionState {
  if (!prediction) return 'none';
  if (match.status !== 'FINAL' || match.homeScore === null || match.awayScore === null) return 'pending';
  if (prediction.predicted_home_score === match.homeScore && prediction.predicted_away_score === match.awayScore) return 'exact';
  if (
    compareOutcome(prediction.predicted_home_score, prediction.predicted_away_score) ===
    compareOutcome(match.homeScore, match.awayScore)
  ) {
    return 'outcome';
  }
  return 'miss';
}

function predictionStateCopy(state: PredictionState): { label: string; tone: string } {
  if (state === 'exact') return { label: 'Marcador exacto', tone: 'good' };
  if (state === 'outcome') return { label: 'Signo acertado', tone: 'warn' };
  if (state === 'miss') return { label: 'Fallada', tone: 'danger' };
  if (state === 'pending') return { label: 'Pendiente', tone: 'neutral' };
  return { label: 'Sin predicción', tone: 'neutral' };
}

function toCardPrediction(prediction: PredictionRow | undefined): { home: number; away: number; points: number } | undefined {
  if (!prediction) return undefined;
  return {
    home: prediction.predicted_home_score,
    away: prediction.predicted_away_score,
    points: prediction.points_awarded,
  };
}

function getMadridDayKey(value: string | Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function addDaysToDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [predictions, setPredictions] = useState<Record<string, PredictionRow>>({});
  const [visiblePredictions, setVisiblePredictions] = useState<Record<string, VisiblePredictionRow[]>>({});
  const [dailyDeltas, setDailyDeltas] = useState<DailyDeltaRow[]>([]);
  const [isDailyDeltaReady, setIsDailyDeltaReady] = useState(!isSupabaseConfigured);
  const [rankingRows, setRankingRows] = useState<RankingRow[]>(
    demoRanking.map((row) => ({
      display_name: row.name,
      match_points: row.matchPoints,
      special_points: row.specialPoints,
      total_points: row.totalPoints,
    })),
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');

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
      const yesterdayKey = addDaysToDayKey(getMadridDayKey(new Date()), -1);

      const [matchResult, rankingResult, predictionResult, deltaResult, visiblePredictionResult] = await Promise.all([
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

      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const now = Date.now();
  const nextMatches = useMemo(
    () =>
      matches
        .filter((match) => match.homeTeamId && match.awayTeamId && match.status !== 'FINAL' && new Date(match.kickoffAt).getTime() > now)
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
        .slice(0, 5),
    [matches, now],
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
  const currentUserRank = rankedRows.find((row) => row.user_id === userId) ?? null;
  const currentUserDelta = dailyDeltas.find((row) => row.user_id === userId) ?? null;
  const yesterdayKey = useMemo(() => addDaysToDayKey(getMadridDayKey(new Date()), -1), []);
  const yesterdayPoints =
    currentUserDelta?.points_on_day ??
    Object.values(predictions).reduce((total, prediction) => {
      const match = matches.find((item) => item.id === prediction.match_id);
      if (!match || match.status !== 'FINAL' || getMadridDayKey(match.kickoffAt) !== yesterdayKey) return total;
      return total + prediction.points_awarded;
    }, 0);
  const rankDelta = currentUserDelta?.position_delta ?? 0;
  const rankDeltaCopy = !currentUserRank
    ? { label: '-', tone: 'neutral', Icon: Minus }
    : !isDailyDeltaReady
      ? { label: 'Pendiente', tone: 'neutral', Icon: Minus }
      : rankDelta > 0
      ? { label: `Subes ${rankDelta}`, tone: 'good', Icon: ArrowUp }
      : rankDelta < 0
        ? { label: `Bajas ${Math.abs(rankDelta)}`, tone: 'danger', Icon: ArrowDown }
        : { label: 'Sin cambios', tone: 'neutral', Icon: Minus };
  const visiblePredictionGroups = useMemo<VisiblePredictionMatchGroup[]>(
    () =>
      matches
        .filter((match) => match.status !== 'FINAL')
        .sort((a, b) => {
          if (a.fifaMatchNumber !== b.fifaMatchNumber) return a.fifaMatchNumber - b.fifaMatchNumber;
          return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
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

      <div className="metric-grid">
        <article className="metric">
          <CalendarDays size={22} />
          <span>Puntos ayer</span>
          <strong>+{yesterdayPoints}</strong>
        </article>
        <article className={`metric metric--${rankDeltaCopy.tone}`}>
          <rankDeltaCopy.Icon size={22} />
          <span>Cambio ranking</span>
          <strong>{rankDeltaCopy.label}</strong>
        </article>
      </div>

      <div className="split-section dashboard-main">
        <section className="prediction-section">
          <div className="section-heading">
            <h2>Próximos partidos</h2>
            <span>{nextMatches.length}</span>
          </div>
          <div className="match-list">
            {nextMatches.length > 0 ? (
              nextMatches.map((match) => <MatchCard key={match.id} match={match} prediction={toCardPrediction(predictions[match.id])} />)
            ) : (
              <section className="table-card">
                <p className="empty-state">No hay próximos partidos disponibles ahora mismo.</p>
              </section>
            )}
          </div>
        </section>

        <section className="prediction-section">
          <div className="section-heading">
            <h2>Mi ranking</h2>
            <Target size={18} />
          </div>
          <div className="table-card rank-summary">
            {currentUserRank ? (
              <>
                <span>Posición actual</span>
                <strong>#{currentUserRank.position}</strong>
                <p>
                  {currentUserRank.total_points} pts · {currentUserRank.match_points} en partidos · {currentUserRank.special_points} especiales
                </p>
              </>
            ) : (
              <>
                <span>Sin posición todavía</span>
                <strong>-</strong>
                <p>Inicia sesión y guarda predicciones para aparecer en el ranking.</p>
              </>
            )}
          </div>
          <div className="table-card rank-predictions">
            <h3>Porras visibles</h3>
            {visiblePredictionGroups.length > 0 ? (
              <div className="public-predictions">
                {visiblePredictionGroups.map((group) => (
                  <article className="public-prediction-match" key={group.match.id}>
                    <h4>
                      M{group.match.fifaMatchNumber} · {withFlag(group.match.homeTeamId, teamName(group.match.homeTeamId))} vs{' '}
                      {withFlag(group.match.awayTeamId, teamName(group.match.awayTeamId))}
                    </h4>
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
            ) : (
              <p className="empty-state">Cuando haya partidos no finalizados con porras visibles de otros usuarios, aparecerán aquí.</p>
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
                <article className="table-card result-card" key={match.id}>
                  <div>
                    <p className="eyebrow">M{match.fifaMatchNumber} · {formatMadridDateTime(match.kickoffAt)}</p>
                    <h3>
                      {withFlag(match.homeTeamId, teamName(match.homeTeamId))} {formatScore(match.homeScore, match.awayScore)}{' '}
                      {withFlag(match.awayTeamId, teamName(match.awayTeamId))}
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
