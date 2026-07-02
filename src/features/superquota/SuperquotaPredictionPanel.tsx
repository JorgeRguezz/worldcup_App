import { ArrowRight, Check, CheckCircle2, Clock3, PencilLine, Save, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamName } from '../../data/demoTournament';
import type { Match } from '../../domain/worldCupEngine';
import { formatMadridDateTime } from '../../lib/format';
import { formatCountdown } from '../../lib/specialPredictions';
import { supabase } from '../../lib/supabase';
import {
  effectiveSuperquotaPoints,
  getOpenSuperquotaMarkets,
  getResolvedSuperquotaMarkets,
  isMissingSuperquotaSchemaError,
} from './superquotaState';
import type { SuperquotaMarketStatus, SuperquotaMarketType } from './types';

type SuperquotaMarketRow = {
  id: string;
  match_id: string;
  market_type: SuperquotaMarketType;
  title: string;
  default_points: number;
  status: SuperquotaMarketStatus;
  correct_option_id: string | null;
};

type SuperquotaOptionRow = {
  id: string;
  market_id: string;
  label: string;
  points: number | null;
  display_order: number;
};

type SuperquotaPredictionRow = {
  market_id: string;
  option_id: string;
  points_awarded: number;
  is_void: boolean;
};

type SuperquotaPredictionPanelProps = {
  matches: Match[];
  now: number;
  userId: string;
  variant?: 'full' | 'spotlight';
  showResolvedResults?: boolean;
};

function matchLabel(match: Match | undefined): string {
  if (!match) return 'Partido especial';
  return `${teamName(match.homeTeamId)} vs ${teamName(match.awayTeamId)}`;
}

export function SuperquotaPredictionPanel({
  matches,
  now,
  userId,
  variant = 'full',
  showResolvedResults = true,
}: SuperquotaPredictionPanelProps) {
  const [markets, setMarkets] = useState<SuperquotaMarketRow[]>([]);
  const [optionsByMarket, setOptionsByMarket] = useState<Record<string, SuperquotaOptionRow[]>>({});
  const [savedSelections, setSavedSelections] = useState<Record<string, string>>({});
  const [predictionsByMarket, setPredictionsByMarket] = useState<Record<string, SuperquotaPredictionRow>>({});
  const [draftSelections, setDraftSelections] = useState<Record<string, string>>({});
  const [savingMarketId, setSavingMarketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [schemaAvailable, setSchemaAvailable] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadSuperquotas() {
      const [marketResult, optionResult, predictionResult] = await Promise.all([
        supabase!
          .from('superquota_markets')
          .select('id, match_id, market_type, title, default_points, status, correct_option_id')
          .in('status', ['PUBLISHED', 'RESOLVED']),
        supabase!
          .from('superquota_options')
          .select('id, market_id, label, points, display_order')
          .order('display_order', { ascending: true }),
        supabase!
          .from('superquota_predictions')
          .select('market_id, option_id, points_awarded, is_void')
          .eq('user_id', userId),
      ]);

      if (!isMounted) return;
      const error = marketResult.error ?? optionResult.error ?? predictionResult.error;
      if (error) {
        if (isMissingSuperquotaSchemaError(error)) {
          setSchemaAvailable(false);
          return;
        }
        setMessage(`No se pudieron cargar las supercuotas: ${error.message}`);
        return;
      }

      const nextMarkets = (marketResult.data ?? []) as SuperquotaMarketRow[];
      const nextOptions = (optionResult.data ?? []) as SuperquotaOptionRow[];
      const nextPredictions = (predictionResult.data ?? []) as SuperquotaPredictionRow[];
      const nextSelections = Object.fromEntries(nextPredictions.map((prediction) => [prediction.market_id, prediction.option_id]));

      setMarkets(nextMarkets);
      setOptionsByMarket(
        nextOptions.reduce<Record<string, SuperquotaOptionRow[]>>((grouped, option) => {
          grouped[option.market_id] = [...(grouped[option.market_id] ?? []), option];
          return grouped;
        }, {}),
      );
      setSavedSelections(nextSelections);
      setPredictionsByMarket(Object.fromEntries(nextPredictions.map((prediction) => [prediction.market_id, prediction])));
      setDraftSelections(nextSelections);
    }

    void loadSuperquotas();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const openMarkets = useMemo(
    () => getOpenSuperquotaMarkets(markets, matches, now),
    [markets, matches, now],
  );
  const resolvedMarkets = useMemo(
    () => getResolvedSuperquotaMarkets(markets, matches, new Set(Object.keys(predictionsByMarket))),
    [markets, matches, predictionsByMarket],
  );

  const saveSelection = async (marketId: string) => {
    if (!supabase) return;
    const optionId = draftSelections[marketId];
    if (!optionId) {
      setMessage('Elige una respuesta antes de guardar.');
      return;
    }

    setSavingMarketId(marketId);
    setMessage('');
    const wasSaved = Boolean(savedSelections[marketId]);
    const { error } = await supabase.rpc('save_superquota_prediction', {
      p_market_id: marketId,
      p_option_id: optionId,
    });
    setSavingMarketId(null);

    if (error) {
      setMessage(`No se pudo guardar la supercuota: ${error.message}`);
      return;
    }

    setSavedSelections((current) => ({ ...current, [marketId]: optionId }));
    setMessage(wasSaved ? 'Respuesta de supercuota modificada.' : 'Respuesta de supercuota guardada.');
  };

  const displayedResolvedMarkets = variant === 'full' && showResolvedResults ? resolvedMarkets : [];
  if (!schemaAvailable) return null;
  if (variant === 'full' && openMarkets.length === 0 && displayedResolvedMarkets.length === 0) {
    return message ? <p className="superquota-load-error" role="alert">{message}</p> : null;
  }

  const displayedMarkets = openMarkets;

  return (
    <section className={`superquota-predictions superquota-predictions--${variant}`} aria-labelledby="superquota-predictions-title">
      <div className="superquota-predictions__heading">
        <span className="superquota-predictions__icon"><Sparkles size={20} /></span>
        <div>
          <div className="superquota-predictions__title-row">
            {variant === 'spotlight' ? (
              <h3 id="superquota-predictions-title">Supercuotas</h3>
            ) : (
              <h2 id="superquota-predictions-title">Supercuotas</h2>
            )}
            {variant === 'spotlight' ? (
              <Link className="primary-link superquota-predictions__cta" to="/predicciones">
                Predicciones <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <p className="superquota-predictions__message" role="status" aria-live="polite">{message}</p> : null}

      {displayedMarkets.length === 0 ? (
        <p className="empty-state">No hay supercuotas disponibles para los partidos de hoy.</p>
      ) : null}

      <div className="superquota-predictions__grid">
        {displayedMarkets.map((market) => {
          const match = matches.find((candidate) => candidate.id === market.match_id);
          if (!match) return null;
          const marketOptions = optionsByMarket[market.id] ?? [];
          const savedOptionId = savedSelections[market.id];
          const selectedOptionId = draftSelections[market.id] ?? '';
          const hasChanges = Boolean(selectedOptionId && selectedOptionId !== savedOptionId);
          const isSaving = savingMarketId === market.id;
          const countdown = formatCountdown(new Date(match.kickoffAt), now);

          return (
            <article className={`superquota-prediction-card${variant === 'full' && savedOptionId ? ' superquota-prediction-card--saved' : ''}`} key={market.id}>
              <div className="superquota-prediction-card__meta">
                <strong>{matchLabel(match)}</strong>
                <span><Clock3 size={14} /> Cierra en {countdown}</span>
              </div>
              <h3>{market.title}</h3>
              <p>{formatMadridDateTime(match.kickoffAt)}</p>

              {variant === 'full' ? (
                <>
                  <div className="superquota-prediction-card__options" role="group" aria-label={market.title}>
                    {marketOptions.map((option) => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <button
                          className={isSelected ? 'is-selected' : ''}
                          type="button"
                          aria-pressed={isSelected}
                          key={option.id}
                          onClick={() => setDraftSelections((current) => ({ ...current, [market.id]: option.id }))}
                          disabled={isSaving}
                        >
                          <span>{isSelected ? <Check size={16} /> : null}{option.label}</span>
                          <strong>+{effectiveSuperquotaPoints(option.points, market.default_points)}</strong>
                        </button>
                      );
                    })}
                  </div>

                  <div className="superquota-prediction-card__footer">
                    <span>{savedOptionId ? (hasChanges ? 'Cambios sin guardar' : 'Respuesta guardada') : 'Elige una opción'}</span>
                    <button
                      className="superquota-save-button"
                      type="button"
                      onClick={() => void saveSelection(market.id)}
                      disabled={!selectedOptionId || (!hasChanges && Boolean(savedOptionId)) || isSaving || Boolean(savingMarketId && !isSaving)}
                    >
                      {savedOptionId && !hasChanges ? <Check size={16} /> : savedOptionId ? <PencilLine size={16} /> : <Save size={16} />}
                      {isSaving ? 'Guardando...' : savedOptionId && !hasChanges ? 'Respuesta guardada' : savedOptionId ? 'Modificar respuesta' : 'Guardar respuesta'}
                    </button>
                  </div>
                </>
              ) : null}
            </article>
          );
        })}
      </div>

      {displayedResolvedMarkets.length > 0 ? (
        <section className="superquota-results">
          <div className="section-heading section-heading--compact">
            <h3>Resultados de supercuota</h3>
            <span>{displayedResolvedMarkets.length}</span>
          </div>
          <div className="superquota-results__grid">
            {displayedResolvedMarkets.map((market) => {
              const match = matches.find((candidate) => candidate.id === market.match_id);
              const prediction = predictionsByMarket[market.id];
              const marketOptions = optionsByMarket[market.id] ?? [];
              const selectedOption = marketOptions.find((option) => option.id === prediction.option_id);
              const correctOption = marketOptions.find((option) => option.id === market.correct_option_id);
              const isCorrect = prediction.option_id === market.correct_option_id;

              return (
                <article className={`superquota-result-card superquota-result-card--${isCorrect ? 'correct' : 'missed'}`} key={`result-${market.id}`}>
                  <div className="superquota-result-card__header">
                    <div>
                      <span>{matchLabel(match)}</span>
                      <h4>{market.title}</h4>
                    </div>
                    <strong>
                      {isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                      {isCorrect ? `+${prediction.points_awarded} pts` : 'Fallada'}
                    </strong>
                  </div>
                  <div className="superquota-result-card__answers">
                    <span>Tu respuesta <b>{selectedOption?.label ?? '-'}</b></span>
                    <span>Correcta <b>{correctOption?.label ?? '-'}</b></span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
