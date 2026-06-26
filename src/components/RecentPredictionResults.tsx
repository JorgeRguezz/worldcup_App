import { flagForTeamId } from '../data/teamFlags';
import { teamName } from '../data/demoTournament';
import type { Match } from '../domain/worldCupEngine';

type CompactPrediction = {
  home: number;
  away: number;
  points: number;
};

type RecentPredictionResultsProps = {
  matches: Match[];
  predictions: Record<string, CompactPrediction | undefined>;
};

type RecentPredictionState = 'exact' | 'outcome' | 'miss';

const RECENT_RESULTS_WINDOW_MS = 24 * 60 * 60 * 1000;

function getRecentPredictionState(match: Match, prediction: CompactPrediction): RecentPredictionState {
  if (prediction.home === match.homeScore && prediction.away === match.awayScore) return 'exact';
  return prediction.points > 0 ? 'outcome' : 'miss';
}

function getRecentPredictionCopy(match: Match, state: RecentPredictionState): string {
  if (state === 'exact') return 'Resultado exacto!';
  if (state === 'outcome' && match.homeScore !== null && match.awayScore !== null && match.homeScore === match.awayScore) return 'Empate acertado';
  if (state === 'outcome') return 'Ganador acertado';
  return 'Perdida';
}

export function RecentPredictionResults({ matches, predictions }: RecentPredictionResultsProps) {
  const now = Date.now();
  const recentResults = matches
    .filter((match) => {
      const kickoffAt = new Date(match.kickoffAt).getTime();
      return (
        match.status === 'FINAL' &&
        match.homeScore !== null &&
        match.awayScore !== null &&
        kickoffAt <= now &&
        now - kickoffAt <= RECENT_RESULTS_WINDOW_MS &&
        predictions[match.id]
      );
    })
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());

  return (
    <section className="prediction-section recent-prediction-results">
      <div className="section-heading">
        <h2>Resultados de tus predicciones</h2>
        <span>{recentResults.length}</span>
      </div>
      {recentResults.length > 0 ? (
        <div className="recent-prediction-results__grid">
          {recentResults.map((match) => {
            const prediction = predictions[match.id];
            if (!prediction) return null;

            const state = getRecentPredictionState(match, prediction);
            const homeFlag = flagForTeamId(match.homeTeamId);
            const awayFlag = flagForTeamId(match.awayTeamId);
            const score = `${match.homeScore}-${match.awayScore}`;
            const predictedScore = `${prediction.home}-${prediction.away}`;
            const stateCopy = getRecentPredictionCopy(match, state);

            return (
              <article
                className={`recent-prediction-result recent-prediction-result--${state}`}
                key={match.id}
                aria-label={`${teamName(match.homeTeamId)} ${score} ${teamName(match.awayTeamId)}. Tu apuesta: ${predictedScore}. ${stateCopy}.`}
              >
                <span className="prediction-result-indicator" aria-hidden="true">
                  {state === 'exact' ? '+3' : state === 'outcome' ? '+1' : '×'}
                </span>
                <div className="recent-prediction-result__scoreline">
                  <span className="recent-prediction-result__flag" aria-hidden="true">
                    {homeFlag}
                  </span>
                  <strong>{score}</strong>
                  <span className="recent-prediction-result__flag" aria-hidden="true">
                    {awayFlag}
                  </span>
                </div>
                <div className="recent-prediction-result__detail">
                  <span>
                    Tu apuesta <b>{predictedScore}</b>
                  </span>
                  <small>{stateCopy}</small>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="table-card recent-prediction-results__empty">
          <p className="empty-state">No ha habido predicciones en las últimas 24 horas.</p>
        </section>
      )}
    </section>
  );
}
