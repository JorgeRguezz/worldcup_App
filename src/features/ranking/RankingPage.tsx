import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoMatches, demoRanking, teamName } from '../../data/demoTournament';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage } from '../../domain/worldCupEngine';
import { formatMadridDateTime, formatScore } from '../../lib/format';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type RankingRow = {
  user_id?: string;
  display_name: string;
  match_points: number;
  special_points: number;
  total_points: number;
};

type RankedViewRow = {
  key: string;
  position: number;
  name: string;
  predictionCount: number;
  totalPoints: number;
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

type LogUser = {
  userId?: string;
  displayName: string;
};

type PredictionCountRow = {
  user_id: string;
  prediction_count: number;
};

function podiumEmoji(position: number): string | null {
  if (position === 1) return '🏆';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return null;
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

function rankRows(rows: RankingRow[], predictionCounts: Record<string, number>): RankedViewRow[] {
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

      return {
        key: row.user_id ?? row.display_name,
        position: currentPosition,
        name: row.display_name,
        predictionCount: row.user_id ? (predictionCounts[row.user_id] ?? 0) : 0,
        totalPoints: row.total_points,
      };
    });
}

export function RankingPage() {
  const [rows, setRows] = useState<RankingRow[]>(
    demoRanking.map((row) => ({
      display_name: row.name,
      match_points: row.matchPoints,
      special_points: row.specialPoints,
      total_points: row.totalPoints,
    })),
  );
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLogRow[]>([]);
  const [predictionCounts, setPredictionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadRanking() {
      setIsLoading(true);
      setMessage('');

      const [rankingResult, matchResult, predictionLogResult, predictionCountResult] = await Promise.all([
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
        supabase!.rpc('ranking_prediction_counts'),
      ]);

      if (!isMounted) return;

      if (rankingResult.error) {
        setMessage(`No pude cargar el ranking: ${rankingResult.error.message}`);
        setRows([]);
      } else {
        setRows((rankingResult.data ?? []) as RankingRow[]);
      }

      if (matchResult.error) {
        setMessage(`No pude cargar los partidos finalizados: ${matchResult.error.message}`);
        setMatches([]);
      } else {
        setMatches(((matchResult.data ?? []) as MatchRow[]).map(toMatch));
      }

      if (!predictionLogResult.error) {
        setPredictionLogs((predictionLogResult.data ?? []) as PredictionLogRow[]);
      }

      if (!predictionCountResult.error) {
        setPredictionCounts(
          Object.fromEntries(
            ((predictionCountResult.data ?? []) as PredictionCountRow[]).map((row) => [row.user_id, row.prediction_count]),
          ),
        );
      }

      setIsLoading(false);
    }

    void loadRanking();

    return () => {
      isMounted = false;
    };
  }, []);

  const rankedRows = useMemo(() => rankRows(rows, predictionCounts), [predictionCounts, rows]);
  const logUsers = useMemo<LogUser[]>(
    () =>
      rows
        .map((row) => ({ userId: row.user_id, displayName: row.display_name }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [rows],
  );
  const recentFinalMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status === 'FINAL' && match.homeScore !== null && match.awayScore !== null)
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
        .slice(0, 6),
    [matches],
  );
  const predictionsByMatch = useMemo(
    () =>
      predictionLogs.reduce<Record<string, PredictionLogRow[]>>((grouped, prediction) => {
        grouped[prediction.match_id] = [...(grouped[prediction.match_id] ?? []), prediction];
        return grouped;
      }, {}),
    [predictionLogs],
  );

  return (
    <section className="page ranking-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Puntos totales de la porra</p>
          <h1>Ranking global</h1>
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando ranking...</p> : null}

      <section className="table-card ranking-table">
        <div className="ranking-row ranking-row--head">
          <span>Pos.</span>
          <span>Nombre</span>
          <span>Partidos</span>
          <span>Total</span>
        </div>
        {rankedRows.length > 0 ? (
          rankedRows.map((row) => {
            const podium = podiumEmoji(row.position);

            return (
              <div className="ranking-row" key={row.key}>
                <span className="ranking-position">
                  {podium ? (
                    <span className="ranking-position__podium" aria-label={`Puesto ${row.position}`}>
                      {podium}
                    </span>
                  ) : (
                    row.position
                  )}
                </span>
                {row.key ? (
                  <Link className="ranking-user-link" to={`/ranking/usuario/${row.key}`}>
                    {row.name}
                  </Link>
                ) : (
                  <strong>{row.name}</strong>
                )}
                <span>{row.predictionCount}</span>
                <span>{row.totalPoints}</span>
              </div>
            );
          })
        ) : (
          <p className="empty-state">Todavía no hay usuarios registrados en el ranking.</p>
        )}
      </section>

      <section className="ranking-log-section">
        <div className="section-heading">
          <h2>Últimas apuestas puntuadas</h2>
          <span>{recentFinalMatches.length}</span>
        </div>
        <div className="ranking-log">
          {recentFinalMatches.length > 0 ? (
            recentFinalMatches.map((match) => {
              const matchPredictions = predictionsByMatch[match.id] ?? [];
              const predictionsByUser = new Map(matchPredictions.map((prediction) => [prediction.user_id, prediction]));
              const exact = matchPredictions
                .filter((prediction) => prediction.predicted_home_score === match.homeScore && prediction.predicted_away_score === match.awayScore)
                .sort((a, b) => a.display_name.localeCompare(b.display_name));
              const scored = matchPredictions
                .filter(
                  (prediction) =>
                    prediction.points_awarded > 0 &&
                    !(prediction.predicted_home_score === match.homeScore && prediction.predicted_away_score === match.awayScore),
                )
                .sort((a, b) => a.display_name.localeCompare(b.display_name));
              const missed = matchPredictions
                .filter((prediction) => prediction.points_awarded <= 0)
                .sort((a, b) => a.display_name.localeCompare(b.display_name));
              const missing = logUsers.filter((user) => !user.userId || !predictionsByUser.has(user.userId));

              return (
                <article className="ranking-log-card" key={match.id}>
                  <header className="ranking-log-card__header">
                    <div>
                      <p className="eyebrow">{formatMadridDateTime(match.kickoffAt)}</p>
                      <h3>
                        {teamName(match.homeTeamId)} {formatScore(match.homeScore, match.awayScore)} {teamName(match.awayTeamId)}
                      </h3>
                    </div>
                  </header>
                  <div className="ranking-log-groups">
                    <div className="ranking-log-group ranking-log-group--exact">
                      <strong>👑 Exactos</strong>
                      {exact.length > 0 ? (
                        exact.map((prediction) => (
                          <span key={`${prediction.user_id}-exact`}>
                            {prediction.display_name} <b>+{prediction.points_awarded}</b>
                          </span>
                        ))
                      ) : (
                        <em>Nadie</em>
                      )}
                    </div>
                    <div className="ranking-log-group ranking-log-group--scored">
                      <strong>Sumaron</strong>
                      {scored.length > 0 ? (
                        scored.map((prediction) => (
                          <span key={`${prediction.user_id}-scored`}>
                            {prediction.display_name} <b>+{prediction.points_awarded}</b>
                          </span>
                        ))
                      ) : (
                        <em>Nadie</em>
                      )}
                    </div>
                    <div className="ranking-log-group ranking-log-group--missed">
                      <strong>Fallaron</strong>
                      {missed.length > 0 ? missed.map((prediction) => <span key={`${prediction.user_id}-missed`}>{prediction.display_name}</span>) : <em>Nadie</em>}
                    </div>
                    <div className="ranking-log-group ranking-log-group--missing">
                      <strong>Sin apuesta</strong>
                      {missing.length > 0 ? missing.map((user) => <span key={`${user.userId ?? user.displayName}-missing`}>{user.displayName}</span>) : <em>Nadie</em>}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="table-card">
              <p className="empty-state">Todavía no hay partidos finalizados con apuestas puntuadas.</p>
            </section>
          )}
        </div>
      </section>
    </section>
  );
}
