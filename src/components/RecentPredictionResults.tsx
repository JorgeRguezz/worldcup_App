import { useCallback, useEffect, useRef, useState } from 'react';
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
  superquotaResults?: SuperquotaResult[];
};

export type SuperquotaResult = {
  id: string;
  title: string;
  selectedAnswer: string;
  correctAnswer: string;
  points: number;
  resolvedAt: string;
};

const RECENT_RESULTS_WINDOW_MS = 24 * 60 * 60 * 1000;

export function RecentPredictionResults({ matches, predictions, superquotaResults = [] }: RecentPredictionResultsProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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
  const recentSuperquotaResults = superquotaResults
    .filter((result) => {
      const resolvedAt = new Date(result.resolvedAt).getTime();
      return resolvedAt <= now && now - resolvedAt <= RECENT_RESULTS_WINDOW_MS;
    })
    .sort((a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime());
  const resultCount = recentResults.length + recentSuperquotaResults.length;

  const updateActiveIndex = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;
    const cards = Array.from(slider.querySelectorAll<HTMLElement>('[data-result-index]'));
    const closestCard = cards.reduce<{ index: number; distance: number } | null>((closest, card) => {
      const index = Number(card.dataset.resultIndex);
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - sliderCenter);
      return !closest || distance < closest.distance ? { index, distance } : closest;
    }, null);

    if (closestCard) setActiveIndex(closestCard.index);
  }, []);

  useEffect(() => {
    updateActiveIndex();
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);
    return () => {
      slider.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [resultCount, updateActiveIndex]);

  const scrollToResult = (index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector<HTMLElement>(`[data-result-index="${index}"]`);
    if (!card) return;
    slider.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - slider.clientWidth / 2, behavior: 'smooth' });
  };

  return (
    <section className="prediction-section recent-prediction-results">
      <div className="section-heading">
        <h2>Tus resultados de la jornada</h2>
        <span>{resultCount}</span>
      </div>
      {resultCount > 0 ? (
        <div className="recent-prediction-results__carousel">
        <div className="recent-prediction-results__grid" ref={sliderRef}>
          {recentResults.map((match, index) => {
            const prediction = predictions[match.id];
            if (!prediction) return null;

            const homeFlag = flagForTeamId(match.homeTeamId);
            const awayFlag = flagForTeamId(match.awayTeamId);
            const score = `${match.homeScore}-${match.awayScore}`;
            const predictedScore = `${prediction.home}-${prediction.away}`;
            const isCorrect = prediction.points > 0;

            return (
              <article
                className={`recent-prediction-result recent-prediction-result--${isCorrect ? 'correct' : 'miss'}`}
                key={match.id}
                data-result-index={index}
                aria-label={`${teamName(match.homeTeamId)} ${score} ${teamName(match.awayTeamId)}. Tu apuesta: ${predictedScore}. ${prediction.points} puntos.`}
              >
                <span className="prediction-result-indicator" aria-hidden="true">
                  {isCorrect ? `+${prediction.points}` : '×'}
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
                </div>
              </article>
            );
          })}
          {recentSuperquotaResults.map((result, index) => {
            const isCorrect = result.points > 0;
            return (
              <article
                className={`recent-prediction-result recent-prediction-result--superquota recent-prediction-result--${isCorrect ? 'correct' : 'miss'}`}
                key={`superquota-${result.id}`}
                data-result-index={recentResults.length + index}
                aria-label={`Supercuota: ${result.title}. Tu respuesta: ${result.selectedAnswer}. Respuesta correcta: ${result.correctAnswer}. ${result.points} puntos.`}
              >
                <span className="prediction-result-indicator" aria-hidden="true">
                  {isCorrect ? `+${result.points}` : '×'}
                </span>
                <div className="recent-prediction-result__superquota-heading">
                  <strong>Supercuota</strong>
                  <span>{result.title}</span>
                </div>
                <div className="recent-prediction-result__detail recent-prediction-result__detail--answers">
                  <span>Tu respuesta <b>{result.selectedAnswer}</b></span>
                  {!isCorrect ? <span>Respuesta correcta <b>{result.correctAnswer}</b></span> : null}
                </div>
              </article>
            );
          })}
        </div>
        <div className="recent-prediction-results__dots" aria-label={`Resultado ${activeIndex + 1} de ${resultCount}`}>
          {Array.from({ length: resultCount }, (_, index) => (
            <button
              className="recent-prediction-results__dot"
              type="button"
              aria-label={`Ver resultado ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              key={index}
              onClick={() => scrollToResult(index)}
            />
          ))}
        </div>
        </div>
      ) : (
        <section className="table-card recent-prediction-results__empty">
          <p className="empty-state">No ha habido predicciones en las últimas 24 horas.</p>
        </section>
      )}
    </section>
  );
}
