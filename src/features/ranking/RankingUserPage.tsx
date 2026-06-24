import { ArrowLeft, Crown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { demoMatches, teamName } from '../../data/demoTournament';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage } from '../../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../../lib/format';
import { formatRankingPosition } from '../../lib/ranking';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

const MADRID_TIME_ZONE = 'Europe/Madrid';
const PREDICTION_DAY_START_HOUR = 7;

type RankingRow = {
  user_id?: string;
  display_name: string;
  match_points: number;
  special_points: number;
  total_points: number;
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

type PredictionLogRow = {
  match_id: string;
  user_id: string;
  display_name: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_awarded: number;
};

type PredictionState = 'exact' | 'scored' | 'missed' | 'missing';

type PredictionHistoryItem = {
  match: Match;
  prediction?: PredictionLogRow;
  state: PredictionState;
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

function formatDayLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    timeZone: MADRID_TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function rankRows(rows: RankingRow[]): Array<RankingRow & { position: number }> {
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

function getPredictionState(match: Match, prediction: PredictionLogRow | undefined): PredictionState {
  if (!prediction) return 'missing';
  if (prediction.predicted_home_score === match.homeScore && prediction.predicted_away_score === match.awayScore) return 'exact';
  return prediction.points_awarded > 0 ? 'scored' : 'missed';
}

function stateCopy(state: PredictionState): { label: string } {
  if (state === 'exact') return { label: 'Exacto' };
  if (state === 'scored') return { label: 'Sumó' };
  if (state === 'missed') return { label: 'Falló' };
  return { label: 'Sin apuesta' };
}

export function RankingUserPage() {
  const { userId } = useParams();
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([]);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLogRow[]>([]);
  const [showAllDays, setShowAllDays] = useState(false);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadUserRanking() {
      setIsLoading(true);
      setMessage('');

      const [rankingResult, matchResult, predictionLogResult] = await Promise.all([
        supabase!
          .from('ranking')
          .select('user_id, display_name, match_points, special_points, total_points')
          .order('total_points', { ascending: false })
          .order('display_name', { ascending: true }),
        supabase!
          .from('matches')
          .select(
            'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
          )
          .eq('status', 'FINAL')
          .order('kickoff_at', { ascending: false }),
        supabase!.rpc('visible_match_predictions'),
      ]);

      if (!isMounted) return;

      if (rankingResult.error) setMessage(`No pude cargar el usuario: ${rankingResult.error.message}`);
      else setRankingRows((rankingResult.data ?? []) as RankingRow[]);

      if (matchResult.error) setMessage(`No pude cargar los partidos: ${matchResult.error.message}`);
      else setMatches(((matchResult.data ?? []) as MatchRow[]).map(toMatch));

      if (!predictionLogResult.error) {
        setPredictionLogs((predictionLogResult.data ?? []) as PredictionLogRow[]);
      }

      setIsLoading(false);
    }

    void loadUserRanking();

    return () => {
      isMounted = false;
    };
  }, []);

  const rankedRows = useMemo(() => rankRows(rankingRows), [rankingRows]);
  const user = rankedRows.find((row) => row.user_id === userId) ?? null;
  const userPredictionsByMatch = useMemo(
    () =>
      predictionLogs
        .filter((prediction) => prediction.user_id === userId)
        .reduce<Record<string, PredictionLogRow>>((grouped, prediction) => {
          grouped[prediction.match_id] = prediction;
          return grouped;
        }, {}),
    [predictionLogs, userId],
  );
  const historyItems = useMemo<PredictionHistoryItem[]>(
    () =>
      matches
        .filter((match) => match.status === 'FINAL' && match.homeScore !== null && match.awayScore !== null)
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
        .map((match) => {
          const prediction = userPredictionsByMatch[match.id];
          return { match, prediction, state: getPredictionState(match, prediction) };
        }),
    [matches, userPredictionsByMatch],
  );
  const summary = historyItems.reduce(
    (totals, item) => ({
      exact: totals.exact + (item.state === 'exact' ? 1 : 0),
      scored: totals.scored + (item.state === 'scored' ? 1 : 0),
      missed: totals.missed + (item.state === 'missed' ? 1 : 0),
      missing: totals.missing + (item.state === 'missing' ? 1 : 0),
    }),
    { exact: 0, scored: 0, missed: 0, missing: 0 },
  );
  const groupedHistory = useMemo(() => {
    const groups = historyItems.reduce<Record<string, PredictionHistoryItem[]>>((grouped, item) => {
      const dayKey = getPredictionDayKey(item.match.kickoffAt);
      grouped[dayKey] = [...(grouped[dayKey] ?? []), item];
      return grouped;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dayKey, items]) => ({ dayKey, items }));
  }, [historyItems]);
  const visibleGroups = showAllDays ? groupedHistory : groupedHistory.slice(0, 1);

  return (
    <section className="page ranking-page ranking-user-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Perfil público</p>
          <h1>{user?.display_name ?? 'Usuario'}</h1>
        </div>
        <Link className="primary-link" to="/ranking">
          <ArrowLeft size={16} />
          Volver al ranking
        </Link>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando perfil...</p> : null}

      {!isLoading && !user ? (
        <section className="table-card">
          <p className="empty-state">No encuentro ese usuario en el ranking.</p>
        </section>
      ) : null}

      {user ? (
        <>
          <section className="profile-summary ranking-user-summary">
            <article className="metric">
              <span>Ranking</span>
              <strong>{formatRankingPosition(user.position)}</strong>
            </article>
            <article className="metric">
              <span>Puntos totales</span>
              <strong>{user.total_points}</strong>
            </article>
            <article className="metric">
              <span>Partidos</span>
              <strong>{user.match_points}</strong>
            </article>
            <article className="metric">
              <span>Especiales</span>
              <strong>{user.special_points}</strong>
            </article>
          </section>

          <section className="ranking-user-stats">
            <article className="ranking-user-stat ranking-user-stat--exact">
              <Crown size={18} />
              <span>Exactos</span>
              <strong>{summary.exact}</strong>
            </article>
            <article className="ranking-user-stat ranking-user-stat--scored">
              <span>✓</span>
              <span>Sumaron</span>
              <strong>{summary.scored}</strong>
            </article>
            <article className="ranking-user-stat ranking-user-stat--missed">
              <span>×</span>
              <span>Fallos</span>
              <strong>{summary.missed}</strong>
            </article>
            <article className="ranking-user-stat ranking-user-stat--missing">
              <span>-</span>
              <span>Sin apuesta</span>
              <strong>{summary.missing}</strong>
            </article>
          </section>

          <section className="ranking-history-section">
            <div className="section-heading">
              <h2>Historial de predicciones</h2>
              <span>{historyItems.length}</span>
            </div>
            <div className="ranking-history-days">
              {visibleGroups.length > 0 ? (
                visibleGroups.map((group) => (
                  <section className="ranking-history-day" key={group.dayKey}>
                    <div className="section-heading section-heading--compact">
                      <h3>{formatDayLabel(group.dayKey)}</h3>
                      <span>{group.items.length}</span>
                    </div>
                    <div className="ranking-history-list">
                      {group.items.map((item) => {
                        const copy = stateCopy(item.state);
                        return (
                          <article className={`ranking-history-card ranking-history-card--${item.state}`} key={item.match.id}>
                            <div>
                              <p className="eyebrow">{formatMadridDateTime(item.match.kickoffAt)}</p>
                              <h4>
                                {teamName(item.match.homeTeamId)} {formatScore(item.match.homeScore, item.match.awayScore)}{' '}
                                {teamName(item.match.awayTeamId)}
                              </h4>
                            </div>
                            <div className="ranking-history-card__prediction">
                              {item.state === 'exact' || item.state === 'scored' || item.state === 'missed' ? (
                                <span className="prediction-result-indicator" aria-hidden="true">
                                  {item.state === 'exact' ? '+3' : item.state === 'scored' ? '+1' : '×'}
                                </span>
                              ) : null}
                              <strong>{copy.label}</strong>
                              <span>
                                {item.prediction
                                  ? `${item.prediction.predicted_home_score}-${item.prediction.predicted_away_score} · +${item.prediction.points_awarded} pts`
                                  : '+0 pts'}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))
              ) : (
                <section className="table-card">
                  <p className="empty-state">Todavía no hay partidos finalizados.</p>
                </section>
              )}
            </div>
            {groupedHistory.length > 1 ? (
              <button className="secondary-button ranking-history-more" type="button" onClick={() => setShowAllDays((current) => !current)}>
                {showAllDays ? 'Ver solo último día' : 'Ver más'}
              </button>
            ) : null}
          </section>
        </>
      ) : null}
    </section>
  );
}
