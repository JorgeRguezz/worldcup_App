import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [sliderState, setSliderState] = useState({ canGoLeft: false, canGoRight: false });
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

  const updateSliderState = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) {
      setSliderState({ canGoLeft: false, canGoRight: false });
      return;
    }

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    const nextState = {
      canGoLeft: slider.scrollLeft > 4,
      canGoRight: maxScrollLeft - slider.scrollLeft > 4,
    };
    setSliderState((current) =>
      current.canGoLeft === nextState.canGoLeft && current.canGoRight === nextState.canGoRight ? current : nextState,
    );
  }, []);

  useEffect(() => {
    updateSliderState();
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', updateSliderState, { passive: true });
    window.addEventListener('resize', updateSliderState);
    return () => {
      slider.removeEventListener('scroll', updateSliderState);
      window.removeEventListener('resize', updateSliderState);
    };
  }, [resultCount, updateSliderState]);

  const scrollResults = (direction: 'left' | 'right') => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({
      left: direction === 'left' ? -slider.clientWidth : slider.clientWidth,
      behavior: 'smooth',
    });
    window.setTimeout(updateSliderState, 260);
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
          {recentResults.map((match) => {
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
          {recentSuperquotaResults.map((result) => {
            const isCorrect = result.points > 0;
            return (
              <article
                className={`recent-prediction-result recent-prediction-result--superquota recent-prediction-result--${isCorrect ? 'correct' : 'miss'}`}
                key={`superquota-${result.id}`}
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
        <button
          className="recent-prediction-results__control recent-prediction-results__control--left"
          type="button"
          aria-label="Ver resultados anteriores"
          disabled={!sliderState.canGoLeft}
          onClick={() => scrollResults('left')}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="recent-prediction-results__control recent-prediction-results__control--right"
          type="button"
          aria-label="Ver más resultados"
          disabled={!sliderState.canGoRight}
          onClick={() => scrollResults('right')}
        >
          <ChevronRight size={20} />
        </button>
        </div>
      ) : (
        <section className="table-card recent-prediction-results__empty">
          <p className="empty-state">No ha habido predicciones en las últimas 24 horas.</p>
        </section>
      )}
    </section>
  );
}
