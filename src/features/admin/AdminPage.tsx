import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { withFlag } from '../../data/teamFlags';
import type { DecidedBy, GroupLetter, Match, MatchStatus, Stage } from '../../domain/worldCupEngine';
import { DEFAULT_RULE_SECTIONS, normalizeRulesContent, type RuleSection } from '../rules/rulesContent';
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

type TeamRow = {
  id: string;
  short_name: string;
  name: string;
};

type ProfileRow = {
  is_admin: boolean;
};

type AppRulesRow = {
  version: number;
  sections: RuleSection[];
  updated_at: string | null;
};

type AdminAccessStatus = 'checking' | 'allowed' | 'denied';

type LoadAdminOptions = {
  preserveMessage?: boolean;
};

function isMissingAppRulesError(error: { code?: string; message?: string } | null): boolean {
  return Boolean(
    error &&
      (error.code === 'PGRST205' ||
        (error.message?.includes('app_rules') && error.message.includes('schema cache')) ||
        error.message?.includes("Could not find the table 'public.app_rules'")),
  );
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

function needsResult(match: Match): boolean {
  return match.status !== 'FINAL' || match.homeScore === null || match.awayScore === null;
}

function isPastPendingMatch(match: Match, now = Date.now()): boolean {
  return new Date(match.kickoffAt).getTime() <= now && needsResult(match);
}

function sortByKickoffAsc(a: Match, b: Match): number {
  return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
}

function sortByFifaNumber(a: Match, b: Match): number {
  return a.fifaMatchNumber - b.fifaMatchNumber;
}

export function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessStatus, setAccessStatus] = useState<AdminAccessStatus>(isSupabaseConfigured ? 'checking' : 'denied');
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [isRulesSaving, setIsRulesSaving] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<string, TeamRow>>({});
  const [rulesVersion, setRulesVersion] = useState(1);
  const [ruleSections, setRuleSections] = useState<RuleSection[]>(DEFAULT_RULE_SECTIONS);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [decidedBy, setDecidedBy] = useState<DecidedBy>('NORMAL_TIME');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [message, setMessage] = useState('');

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId) ?? null,
    [matches, selectedMatchId],
  );
  const pastPendingMatches = useMemo(
    () => matches.filter((match) => isPastPendingMatch(match)).sort(sortByKickoffAsc),
    [matches],
  );
  const otherMatches = useMemo(
    () => matches.filter((match) => !pastPendingMatches.some((pending) => pending.id === match.id)).sort(sortByFifaNumber),
    [matches, pastPendingMatches],
  );
  const shouldShowPenaltyWinner =
    selectedMatch !== null && selectedMatch.stage !== 'GROUP' && homeScore !== '' && homeScore === awayScore;

  const teamLabel = (teamId: string | null) => {
    if (!teamId) return 'TBD';
    const team = teams[teamId];
    return team ? withFlag(teamId, `${team.short_name} · ${team.name}`) : withFlag(teamId, teamId);
  };

  const loadAdminData = async (options: LoadAdminOptions = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      setAccessStatus('denied');
      setIsAdmin(false);
      return;
    }

    setIsLoading(true);
    if (!options.preserveMessage) {
      setMessage('');
    }

    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setAccessStatus('denied');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userResult.user.id)
      .single();

    if (profileError || !(profile as ProfileRow | null)?.is_admin) {
      setAccessStatus('denied');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setAccessStatus('allowed');
    setIsAdmin(true);

    const [
      { data: matchRows, error: matchError },
      { data: teamRows, error: teamError },
      { data: rulesRow, error: rulesError },
    ] = await Promise.all([
      supabase
        .from('matches')
        .select(
          'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
        )
        .order('fifa_match_number', { ascending: true }),
      supabase.from('teams').select('id, short_name, name'),
      supabase.from('app_rules').select('version, sections, updated_at').eq('id', true).maybeSingle(),
    ]);

    if (matchError) setMessage(`No pude cargar partidos: ${matchError.message}`);
    else {
      const nextMatches = ((matchRows ?? []) as MatchRow[]).map(toMatch);
      const nextPastPendingMatches = nextMatches.filter((match) => isPastPendingMatch(match)).sort(sortByKickoffAsc);
      setMatches(nextMatches);
      setSelectedMatchId((current) =>
        nextMatches.some((match) => match.id === current) ? current : nextPastPendingMatches[0]?.id || nextMatches[0]?.id || '',
      );
    }

    if (teamError) setMessage(`No pude cargar equipos: ${teamError.message}`);
    else {
      setTeams(Object.fromEntries(((teamRows ?? []) as TeamRow[]).map((team) => [team.id, team])));
    }

    if (rulesError && !isMissingAppRulesError(rulesError)) setMessage(`No pude cargar reglas editables: ${rulesError.message}`);
    else {
      const normalizedRules = normalizeRulesContent(
        rulesRow
          ? {
              version: (rulesRow as AppRulesRow).version,
              sections: (rulesRow as AppRulesRow).sections,
              updatedAt: (rulesRow as AppRulesRow).updated_at,
            }
          : null,
      );
      setRulesVersion(normalizedRules.version);
      setRuleSections(normalizedRules.sections);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    setHomeScore(selectedMatch.homeScore === null ? '' : String(selectedMatch.homeScore));
    setAwayScore(selectedMatch.awayScore === null ? '' : String(selectedMatch.awayScore));
    setDecidedBy(selectedMatch.decidedBy ?? 'NORMAL_TIME');
    setWinnerTeamId(selectedMatch.winnerTeamId ?? '');
  }, [selectedMatch]);

  const submitResult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !selectedMatch) return;

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);
    if (!Number.isInteger(parsedHomeScore) || !Number.isInteger(parsedAwayScore) || parsedHomeScore < 0 || parsedAwayScore < 0) {
      setMessage('Introduce marcadores enteros no negativos.');
      return;
    }

    const winnerForRpc = selectedMatch.stage !== 'GROUP' && parsedHomeScore === parsedAwayScore ? winnerTeamId || null : null;
    if (selectedMatch.stage !== 'GROUP' && parsedHomeScore === parsedAwayScore && !winnerForRpc) {
      setMessage('Una eliminatoria empatada necesita elegir ganador por penaltis.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    const { error } = await supabase.rpc('admin_set_match_result', {
      p_match_id: selectedMatch.id,
      p_home_score: parsedHomeScore,
      p_away_score: parsedAwayScore,
      p_decided_by: decidedBy,
      p_winner_team_id: winnerForRpc,
      p_penalties_home: null,
      p_penalties_away: null,
    });

    setIsSaving(false);

    if (error) {
      setMessage(`No se pudo guardar el resultado: ${error.message}`);
      return;
    }

    setMessage('Resultado guardado y puntos recalculados.');
    await loadAdminData({ preserveMessage: true });
  };

  const updateRuleSection = (sectionId: string, patch: Partial<RuleSection>) => {
    setRuleSections((current) => current.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)));
  };

  const saveRules = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    const cleanSections = ruleSections.map((section) => ({
      ...section,
      title: section.title.trim(),
      body: section.body.trim(),
    }));

    if (cleanSections.some((section) => !section.title || !section.body)) {
      setMessage('Todas las secciones de reglas necesitan título y texto.');
      return;
    }

    setIsRulesSaving(true);
    setMessage('');

    const nextVersion = rulesVersion + 1;
    const { error } = await supabase.from('app_rules').upsert({
      id: true,
      version: nextVersion,
      sections: cleanSections,
      updated_at: new Date().toISOString(),
    });

    setIsRulesSaving(false);

    if (error) {
      setMessage(`No se pudieron guardar las reglas: ${error.message}`);
      return;
    }

    setRulesVersion(nextVersion);
    setRuleSections(cleanSections);
    setMessage('Reglas guardadas. Los usuarios tendrán que marcar la nueva versión como leída.');
  };

  if (accessStatus === 'checking') {
    return (
      <section className="page">
        <p className="empty-state">Comprobando permisos...</p>
      </section>
    );
  }

  if (accessStatus === 'denied') {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Zona restringida por RLS y perfil admin</p>
          <h1>Administración</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => void loadAdminData()} disabled={isLoading}>
          <RotateCcw size={16} />
          Refrescar
        </button>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando administración...</p> : null}

      {!isLoading && !isAdmin ? null : (
        <section className="admin-grid">
          <form className="admin-form" onSubmit={submitResult}>
            <h2>Cargar resultado</h2>
            <label>
              Partido
              <select value={selectedMatchId} onChange={(event) => setSelectedMatchId(event.target.value)}>
                {pastPendingMatches.length > 0 ? (
                  <optgroup label="Pasados sin resultado">
                    {pastPendingMatches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {formatMadridDateTime(match.kickoffAt)} · M{match.fifaMatchNumber} · {teamLabel(match.homeTeamId)} vs{' '}
                        {teamLabel(match.awayTeamId)}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Todos los partidos / correcciones">
                  {otherMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      M{match.fifaMatchNumber} · {teamLabel(match.homeTeamId)} vs {teamLabel(match.awayTeamId)} · {match.status}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <div className="form-row">
              <label>
                Local
                <input type="number" min={0} max={30} value={homeScore} onChange={(event) => setHomeScore(event.target.value)} required />
              </label>
              <label>
                Visitante
                <input type="number" min={0} max={30} value={awayScore} onChange={(event) => setAwayScore(event.target.value)} required />
              </label>
            </div>
            <label>
              Decisión
              <select value={decidedBy} onChange={(event) => setDecidedBy(event.target.value as DecidedBy)}>
                <option value="NORMAL_TIME">Tiempo normal</option>
                <option value="EXTRA_TIME">Prórroga</option>
                <option value="PENALTIES">Penaltis</option>
              </select>
            </label>
            {shouldShowPenaltyWinner && selectedMatch ? (
              <label>
                Ganador por penaltis
                <select value={winnerTeamId} onChange={(event) => setWinnerTeamId(event.target.value)}>
                  <option value="">Selecciona ganador</option>
                  {selectedMatch.homeTeamId ? <option value={selectedMatch.homeTeamId}>{teamLabel(selectedMatch.homeTeamId)}</option> : null}
                  {selectedMatch.awayTeamId ? <option value={selectedMatch.awayTeamId}>{teamLabel(selectedMatch.awayTeamId)}</option> : null}
                </select>
              </label>
            ) : null}
            <button className="primary-button" type="submit" disabled={isSaving || !selectedMatch}>
              <Save size={16} />
              {isSaving ? 'Guardando...' : 'Confirmar resultado'}
            </button>
          </form>

          <section className="table-card">
            <h2>Partidos pasados sin resultado</h2>
            {pastPendingMatches.map((match) => (
              <div className="admin-match-row" key={match.id}>
                <span>M{match.fifaMatchNumber}</span>
                <strong>
                  {teamLabel(match.homeTeamId)} vs {teamLabel(match.awayTeamId)}
                </strong>
                <span>{formatMadridDateTime(match.kickoffAt)}</span>
              </div>
            ))}
            {pastPendingMatches.length === 0 ? <p className="empty-state">No hay partidos pasados pendientes de resultado.</p> : null}
          </section>

          <section className="table-card">
            <h2>Últimos resultados cargados</h2>
            {matches
              .filter((match) => match.status === 'FINAL')
              .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
              .slice(0, 8)
              .map((match) => (
                <div className="admin-match-row" key={match.id}>
                  <span>M{match.fifaMatchNumber}</span>
                  <strong>
                    {teamLabel(match.homeTeamId)} vs {teamLabel(match.awayTeamId)}
                  </strong>
                  <span>{formatScore(match.homeScore, match.awayScore)}</span>
                </div>
              ))}
          </section>

          <form className="admin-form admin-form--wide" onSubmit={saveRules}>
            <h2>Editar reglas</h2>
            <p className="helper-text">Al guardar, se crea una nueva versión y los usuarios tendrán que marcarla como leída.</p>
            {ruleSections.map((section) => (
              <div className="rule-editor" key={section.id}>
                <label>
                  Título
                  <input value={section.title} onChange={(event) => updateRuleSection(section.id, { title: event.target.value })} />
                </label>
                <label>
                  Texto
                  <textarea
                    value={section.body}
                    onChange={(event) => updateRuleSection(section.id, { body: event.target.value })}
                    rows={5}
                  />
                </label>
              </div>
            ))}
            <button className="primary-button" type="submit" disabled={isRulesSaving}>
              <Save size={16} />
              {isRulesSaving ? 'Guardando...' : `Guardar reglas v${rulesVersion + 1}`}
            </button>
          </form>
        </section>
      )}
    </section>
  );
}
