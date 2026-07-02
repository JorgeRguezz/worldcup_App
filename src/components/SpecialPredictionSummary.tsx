import { teamName } from '../data/demoTournament';
import { SPECIAL_PREDICTION_POINTS, type SpecialPredictionRow } from '../lib/specialPredictions';

type SpecialPredictionSummaryProps = {
  prediction: SpecialPredictionRow | null;
  isClosed: boolean;
};

export function SpecialPredictionSummary({ prediction, isClosed }: SpecialPredictionSummaryProps) {
  return (
    <section className="special-announcement">
      <div className="special-announcement__heading">
        <h2>Predicción especial</h2>
        <strong className={`special-announcement__status${isClosed ? ' is-closed' : ''}`}>
          {isClosed ? 'Cerrada' : 'Abierta'}
        </strong>
      </div>
      {prediction ? (
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
      ) : <p className="empty-state">Sin predicción guardada</p>}
    </section>
  );
}
