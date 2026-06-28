import { Ban, CheckCircle2, Pencil, Plus, RotateCcw, Send, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatusPill } from '../../components/StatusPill';
import type { Match } from '../../domain/worldCupEngine';
import { formatMadridDateTime } from '../../lib/format';
import { supabase } from '../../lib/supabase';
import { effectiveSuperquotaPoints, isMissingSuperquotaSchemaError } from './superquotaState';
import type { SuperquotaMarketStatus, SuperquotaMarketType } from './types';

type TeamSummary = {
  id: string;
  short_name: string;
  name: string;
};

type SuperquotaMarketRow = {
  id: string;
  match_id: string;
  market_type: SuperquotaMarketType;
  title: string;
  default_points: number;
  subject_team_id: string | null;
  subject_player_id: string | null;
  status: SuperquotaMarketStatus;
  correct_option_id: string | null;
  published_at: string | null;
  resolved_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

type SuperquotaOptionRow = {
  id: string;
  market_id: string;
  label: string;
  points: number | null;
  team_id: string | null;
  player_id: string | null;
  display_order: number;
};

type PredictionCountRow = {
  market_id: string;
  prediction_count: number;
};

type DraftOption = {
  key: string;
  label: string;
  points: string;
  teamId: string | null;
  playerId: string | null;
};

type SuperquotaAdminPanelProps = {
  matches: Match[];
  teams: Record<string, TeamSummary>;
};

const MARKET_TYPE_LABELS: Record<SuperquotaMarketType, string> = {
  YES_NO: 'Sí / No',
  TEAM: 'Elegir equipo',
  PLAYER: 'Elegir jugador',
  NUMBER_RANGE: 'Tramos numéricos',
  MULTIPLE_CHOICE: 'Opciones personalizadas',
};

const STATUS_COPY: Record<SuperquotaMarketStatus, { label: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  PUBLISHED: { label: 'Publicada', tone: 'good' },
  RESOLVED: { label: 'Resuelta', tone: 'good' },
  CANCELLED: { label: 'Anulada', tone: 'danger' },
};

let draftOptionSequence = 0;

function draftOption(label = '', teamId: string | null = null): DraftOption {
  draftOptionSequence += 1;
  return { key: `superquota-option-${draftOptionSequence}`, label, points: '', teamId, playerId: null };
}

function optionsForType(
  marketType: SuperquotaMarketType,
  match: Match | null,
  teams: Record<string, TeamSummary>,
): DraftOption[] {
  if (marketType === 'YES_NO') return [draftOption('Sí'), draftOption('No')];
  if (marketType === 'NUMBER_RANGE') return [draftOption('0'), draftOption('1'), draftOption('2'), draftOption('3 o más')];
  if (marketType === 'TEAM') {
    return [
      draftOption(match?.homeTeamId ? teams[match.homeTeamId]?.short_name ?? match.homeTeamId : '', match?.homeTeamId ?? null),
      draftOption(match?.awayTeamId ? teams[match.awayTeamId]?.short_name ?? match.awayTeamId : '', match?.awayTeamId ?? null),
    ];
  }
  return [draftOption(), draftOption()];
}

function matchTitle(match: Match | undefined, teams: Record<string, TeamSummary>): string {
  if (!match) return 'Partido no disponible';
  const home = match.homeTeamId ? teams[match.homeTeamId]?.short_name ?? match.homeTeamId : 'TBD';
  const away = match.awayTeamId ? teams[match.awayTeamId]?.short_name ?? match.awayTeamId : 'TBD';
  return `${home} vs ${away}`;
}

export function SuperquotaAdminPanel({ matches, teams }: SuperquotaAdminPanelProps) {
  const [markets, setMarkets] = useState<SuperquotaMarketRow[]>([]);
  const [optionsByMarket, setOptionsByMarket] = useState<Record<string, SuperquotaOptionRow[]>>({});
  const [predictionCounts, setPredictionCounts] = useState<Record<string, number>>({});
  const [resolutionSelections, setResolutionSelections] = useState<Record<string, string>>({});
  const [editingMarketId, setEditingMarketId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [marketType, setMarketType] = useState<SuperquotaMarketType>('YES_NO');
  const [title, setTitle] = useState('');
  const [defaultPoints, setDefaultPoints] = useState('1');
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>(() => optionsForType('YES_NO', null, {}));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyMarketId, setBusyMarketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const futureMatches = useMemo(
    () => matches.filter((match) => new Date(match.kickoffAt).getTime() > Date.now()).sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
    [matches],
  );
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null;

  const sortedMarkets = useMemo(() => {
    const statusOrder: Record<SuperquotaMarketStatus, number> = { PUBLISHED: 0, DRAFT: 1, RESOLVED: 2, CANCELLED: 3 };
    return [...markets].sort((a, b) => {
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      if (statusDifference !== 0) return statusDifference;
      const matchA = matches.find((match) => match.id === a.match_id);
      const matchB = matches.find((match) => match.id === b.match_id);
      return new Date(matchA?.kickoffAt ?? a.created_at).getTime() - new Date(matchB?.kickoffAt ?? b.created_at).getTime();
    });
  }, [markets, matches]);

  const loadSuperquotas = async (preserveMessage = false) => {
    if (!supabase) return;
    setIsLoading(true);
    if (!preserveMessage) setMessage('');

    const [marketResult, optionResult, countResult] = await Promise.all([
      supabase
        .from('superquota_markets')
        .select('id, match_id, market_type, title, default_points, subject_team_id, subject_player_id, status, correct_option_id, published_at, resolved_at, cancelled_at, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('superquota_options')
        .select('id, market_id, label, points, team_id, player_id, display_order')
        .order('display_order', { ascending: true }),
      supabase.rpc('admin_superquota_prediction_counts'),
    ]);

    if (marketResult.error || optionResult.error || countResult.error) {
      const error = marketResult.error ?? optionResult.error ?? countResult.error;
      setMessage(
        isMissingSuperquotaSchemaError(error)
          ? 'La base de datos de supercuotas todavía no está aplicada en este entorno.'
          : `No se pudieron cargar las supercuotas: ${error?.message ?? 'Error desconocido'}`,
      );
      setIsLoading(false);
      return;
    }

    const nextMarkets = (marketResult.data ?? []) as SuperquotaMarketRow[];
    const nextOptions = (optionResult.data ?? []) as SuperquotaOptionRow[];
    setMarkets(nextMarkets);
    setOptionsByMarket(
      nextOptions.reduce<Record<string, SuperquotaOptionRow[]>>((grouped, option) => {
        grouped[option.market_id] = [...(grouped[option.market_id] ?? []), option];
        return grouped;
      }, {}),
    );
    setPredictionCounts(
      Object.fromEntries(((countResult.data ?? []) as PredictionCountRow[]).map((row) => [row.market_id, row.prediction_count])),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    void loadSuperquotas();
  }, []);

  useEffect(() => {
    if (selectedMatchId || futureMatches.length === 0) return;
    const firstMatch = futureMatches[0];
    setSelectedMatchId(firstMatch.id);
    setDraftOptions(optionsForType(marketType, firstMatch, teams));
  }, [futureMatches, marketType, selectedMatchId, teams]);

  const resetForm = () => {
    const nextMatch = futureMatches[0] ?? null;
    setEditingMarketId(null);
    setSelectedMatchId(nextMatch?.id ?? '');
    setMarketType('YES_NO');
    setTitle('');
    setDefaultPoints('1');
    setDraftOptions(optionsForType('YES_NO', nextMatch, teams));
  };

  const changeMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    const match = matches.find((candidate) => candidate.id === matchId) ?? null;
    if (marketType === 'TEAM') setDraftOptions(optionsForType('TEAM', match, teams));
  };

  const changeMarketType = (nextType: SuperquotaMarketType) => {
    setMarketType(nextType);
    setDraftOptions(optionsForType(nextType, selectedMatch, teams));
  };

  const updateDraftOption = (key: string, patch: Partial<DraftOption>) => {
    setDraftOptions((current) => current.map((option) => (option.key === key ? { ...option, ...patch } : option)));
  };

  const saveMarket = async (publishAfterSave: boolean) => {
    if (!supabase || isSaving) return;

    const parsedDefaultPoints = Number(defaultPoints);
    const cleanOptions = draftOptions.map((option) => ({
      label: option.label.trim(),
      points: option.points === '' ? null : Number(option.points),
      team_id: option.teamId,
      player_id: option.playerId,
    }));

    if (!selectedMatchId || !title.trim()) {
      setMessage('Selecciona un partido y escribe la pregunta.');
      return;
    }
    if (!Number.isInteger(parsedDefaultPoints) || parsedDefaultPoints < 0) {
      setMessage('Los puntos por defecto deben ser un número entero no negativo.');
      return;
    }
    if (
      cleanOptions.length < 2 ||
      cleanOptions.some((option) => !option.label || option.points !== null && (!Number.isInteger(option.points) || option.points < 0))
    ) {
      setMessage('Añade al menos dos opciones válidas.');
      return;
    }
    if (new Set(cleanOptions.map((option) => option.label.toLocaleLowerCase())).size !== cleanOptions.length) {
      setMessage('Las opciones no pueden estar repetidas.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    const { data: savedMarketId, error } = await supabase.rpc('admin_save_superquota', {
      p_match_id: selectedMatchId,
      p_market_type: marketType,
      p_title: title.trim(),
      p_default_points: parsedDefaultPoints,
      p_options: cleanOptions,
      p_market_id: editingMarketId,
      p_subject_team_id: null,
      p_subject_player_id: null,
    });

    if (error || !savedMarketId) {
      setIsSaving(false);
      setMessage(`No se pudo guardar la supercuota: ${error?.message ?? 'No se recibió el identificador'}`);
      return;
    }

    if (publishAfterSave) {
      const { error: publishError } = await supabase.rpc('admin_publish_superquota', { p_market_id: savedMarketId });
      if (publishError) {
        setIsSaving(false);
        setMessage(`La supercuota se guardó como borrador, pero no se pudo publicar: ${publishError.message}`);
        await loadSuperquotas(true);
        return;
      }
    }

    setIsSaving(false);
    setMessage(publishAfterSave ? 'Supercuota guardada y publicada.' : 'Supercuota guardada como borrador.');
    resetForm();
    await loadSuperquotas(true);
  };

  const editMarket = (market: SuperquotaMarketRow) => {
    setEditingMarketId(market.id);
    setSelectedMatchId(market.match_id);
    setMarketType(market.market_type);
    setTitle(market.title);
    setDefaultPoints(String(market.default_points));
    setDraftOptions(
      (optionsByMarket[market.id] ?? []).map((option) => ({
        key: `existing-${option.id}`,
        label: option.label,
        points: option.points === null ? '' : String(option.points),
        teamId: option.team_id,
        playerId: option.player_id,
      })),
    );
    setMessage('');
    document.getElementById('superquota-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const runMarketAction = async (
    marketId: string,
    action: () => Promise<{ error: { message: string } | null }>,
    successMessage: string,
  ) => {
    setBusyMarketId(marketId);
    setMessage('');
    const { error } = await action();
    setBusyMarketId(null);
    if (error) {
      setMessage(`No se pudo completar la acción: ${error.message}`);
      return;
    }
    setMessage(successMessage);
    if (editingMarketId === marketId) resetForm();
    await loadSuperquotas(true);
  };

  const publishMarket = async (marketId: string) => {
    if (!supabase) return;
    const client = supabase;
    await runMarketAction(
      marketId,
      async () => {
        const { error } = await client.rpc('admin_publish_superquota', { p_market_id: marketId });
        return { error };
      },
      'Supercuota publicada.',
    );
  };

  const cancelMarket = async (marketId: string) => {
    if (!supabase || !window.confirm('¿Anular esta supercuota? Esta acción no se puede deshacer.')) return;
    const client = supabase;
    await runMarketAction(
      marketId,
      async () => {
        const { error } = await client.rpc('admin_cancel_superquota', { p_market_id: marketId });
        return { error };
      },
      'Supercuota anulada.',
    );
  };

  const deleteDraft = async (marketId: string) => {
    if (!supabase || !window.confirm('¿Eliminar este borrador?')) return;
    const client = supabase;
    await runMarketAction(
      marketId,
      async () => {
        const { error } = await client.from('superquota_markets').delete().eq('id', marketId);
        return { error };
      },
      'Borrador eliminado.',
    );
  };

  const resolveMarket = async (marketId: string) => {
    if (!supabase) return;
    const client = supabase;
    const correctOptionId = resolutionSelections[marketId];
    if (!correctOptionId) {
      setMessage('Selecciona la respuesta correcta antes de resolver.');
      return;
    }
    if (!window.confirm('¿Confirmar esta respuesta como correcta y repartir los puntos?')) return;
    await runMarketAction(
      marketId,
      async () => {
        const { error } = await client.rpc('admin_resolve_superquota', {
          p_market_id: marketId,
          p_correct_option_id: correctOptionId,
        });
        return { error };
      },
      'Supercuota resuelta y puntos asignados.',
    );
  };

  return (
    <section className="superquota-admin admin-form--wide">
      <div className="superquota-admin__heading">
        <div>
          <span className="superquota-admin__icon"><Sparkles size={18} /></span>
          <div>
            <p className="eyebrow">Preguntas especiales por partido</p>
            <h2>Supercuotas</h2>
          </div>
        </div>
        <StatusPill tone={markets.some((market) => market.status === 'PUBLISHED') ? 'good' : 'neutral'}>
          {markets.filter((market) => market.status === 'PUBLISHED').length} activas
        </StatusPill>
      </div>

      {message ? <p className="form-message superquota-admin__message" role="status" aria-live="polite">{message}</p> : null}

      <div className="superquota-admin__layout">
        <form
          className="admin-form superquota-editor"
          id="superquota-editor"
          onSubmit={(event) => {
            event.preventDefault();
            void saveMarket(false);
          }}
        >
          <div className="superquota-editor__heading">
            <h3>{editingMarketId ? 'Editar supercuota' : 'Nueva supercuota'}</h3>
            {editingMarketId ? (
              <button className="icon-button" type="button" onClick={resetForm} title="Cancelar edición" aria-label="Cancelar edición">
                <X size={17} />
              </button>
            ) : null}
          </div>

          <label>
            Partido
            <select value={selectedMatchId} onChange={(event) => changeMatch(event.target.value)} required>
              <option value="">Selecciona partido</option>
              {futureMatches.map((match) => (
                <option key={match.id} value={match.id}>
                  {formatMadridDateTime(match.kickoffAt)} · {matchTitle(match, teams)}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Formato
              <select value={marketType} onChange={(event) => changeMarketType(event.target.value as SuperquotaMarketType)}>
                {Object.entries(MARKET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Puntos por defecto
              <input type="number" min={0} step={1} value={defaultPoints} onChange={(event) => setDefaultPoints(event.target.value)} required />
            </label>
          </div>

          <label>
            Pregunta
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="¿Habrá gol en los primeros 30 minutos?" required />
          </label>

          <fieldset className="superquota-options-editor">
            <legend>Opciones</legend>
            {draftOptions.map((option, index) => (
              <div className="superquota-option-editor" key={option.key}>
                <label>
                  <span>Respuesta {index + 1}</span>
                  <input value={option.label} onChange={(event) => updateDraftOption(option.key, { label: event.target.value, teamId: null, playerId: null })} required />
                </label>
                <label>
                  <span>Puntos</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={option.points}
                    onChange={(event) => updateDraftOption(option.key, { points: event.target.value })}
                    placeholder={defaultPoints || '0'}
                  />
                </label>
                <button
                  className="icon-button superquota-option-editor__remove"
                  type="button"
                  onClick={() => setDraftOptions((current) => current.filter((candidate) => candidate.key !== option.key))}
                  disabled={draftOptions.length <= 2}
                  title="Eliminar opción"
                  aria-label={`Eliminar respuesta ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className="secondary-button superquota-add-option" type="button" onClick={() => setDraftOptions((current) => [...current, draftOption()])}>
              <Plus size={16} />
              Añadir opción
            </button>
          </fieldset>

          <div className="superquota-editor__actions">
            <button className="secondary-button" type="submit" disabled={isSaving}>
              {editingMarketId ? <Pencil size={16} /> : <Plus size={16} />}
              {isSaving ? 'Guardando...' : editingMarketId ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
            {!editingMarketId ? (
              <button className="primary-button" type="button" onClick={() => void saveMarket(true)} disabled={isSaving}>
                <Send size={16} />
                Guardar y publicar
              </button>
            ) : null}
          </div>
        </form>

        <div className="superquota-market-list">
          <div className="superquota-market-list__heading">
            <h3>Supercuotas creadas</h3>
            <button className="icon-button" type="button" onClick={() => void loadSuperquotas()} disabled={isLoading} title="Actualizar" aria-label="Actualizar supercuotas">
              <RotateCcw size={16} />
            </button>
          </div>

          {isLoading ? <p className="empty-state">Cargando supercuotas...</p> : null}
          {!isLoading && sortedMarkets.length === 0 ? <p className="empty-state">Todavía no hay supercuotas.</p> : null}

          {sortedMarkets.map((market) => {
            const match = matches.find((candidate) => candidate.id === market.match_id);
            const marketOptions = optionsByMarket[market.id] ?? [];
            const predictionCount = predictionCounts[market.id] ?? 0;
            const hasStarted = new Date(match?.kickoffAt ?? 0).getTime() <= Date.now();
            const canEdit = !hasStarted && predictionCount === 0 && (market.status === 'DRAFT' || market.status === 'PUBLISHED');
            const statusCopy = market.status === 'PUBLISHED' && hasStarted
              ? { label: 'Pendiente de resolver', tone: 'warn' as const }
              : STATUS_COPY[market.status];
            const correctOption = marketOptions.find((option) => option.id === market.correct_option_id);

            return (
              <article className={`superquota-market superquota-market--${market.status.toLowerCase()}`} key={market.id}>
                <div className="superquota-market__topline">
                  <div>
                    <strong>{matchTitle(match, teams)}</strong>
                    <span>{match ? formatMadridDateTime(match.kickoffAt) : 'Fecha no disponible'}</span>
                  </div>
                  <StatusPill tone={statusCopy.tone}>{statusCopy.label}</StatusPill>
                </div>
                <h4>{market.title}</h4>
                <div className="superquota-market__options">
                  {marketOptions.map((option) => (
                    <span className={option.id === market.correct_option_id ? 'is-correct' : ''} key={option.id}>
                      {option.label} · {effectiveSuperquotaPoints(option.points, market.default_points)} pt{effectiveSuperquotaPoints(option.points, market.default_points) === 1 ? '' : 's'}
                    </span>
                  ))}
                </div>
                <div className="superquota-market__meta">
                  <span>{MARKET_TYPE_LABELS[market.market_type]}</span>
                  <span>{predictionCount} respuesta{predictionCount === 1 ? '' : 's'}</span>
                  {correctOption ? <span>Correcta: {correctOption.label}</span> : null}
                  {market.published_at ? <span>Publicada: {formatMadridDateTime(market.published_at)}</span> : null}
                  {market.resolved_at ? <span>Resuelta: {formatMadridDateTime(market.resolved_at)}</span> : null}
                  {market.cancelled_at ? <span>Anulada: {formatMadridDateTime(market.cancelled_at)}</span> : null}
                </div>

                {market.status === 'PUBLISHED' && hasStarted ? (
                  <div className="superquota-resolution">
                    <select
                      value={resolutionSelections[market.id] ?? ''}
                      onChange={(event) => setResolutionSelections((current) => ({ ...current, [market.id]: event.target.value }))}
                      aria-label={`Respuesta correcta para ${market.title}`}
                    >
                      <option value="">Selecciona respuesta correcta</option>
                      {marketOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                    <button className="primary-button" type="button" onClick={() => void resolveMarket(market.id)} disabled={busyMarketId === market.id}>
                      <CheckCircle2 size={16} />
                      Resolver
                    </button>
                  </div>
                ) : null}

                <div className="superquota-market__actions">
                  {canEdit ? (
                    <button className="secondary-button" type="button" onClick={() => editMarket(market)}>
                      <Pencil size={16} />
                      Editar
                    </button>
                  ) : null}
                  {market.status === 'DRAFT' && !hasStarted ? (
                    <button className="primary-button" type="button" onClick={() => void publishMarket(market.id)} disabled={busyMarketId === market.id}>
                      <Send size={16} />
                      Publicar
                    </button>
                  ) : null}
                  {market.status === 'DRAFT' ? (
                    <button className="icon-button" type="button" onClick={() => void deleteDraft(market.id)} disabled={busyMarketId === market.id} title="Eliminar borrador" aria-label="Eliminar borrador">
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                  {market.status === 'PUBLISHED' ? (
                    <button className="icon-button superquota-cancel-button" type="button" onClick={() => void cancelMarket(market.id)} disabled={busyMarketId === market.id} title="Anular supercuota" aria-label="Anular supercuota">
                      <Ban size={16} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
