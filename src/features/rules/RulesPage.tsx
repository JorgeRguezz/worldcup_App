import { CheckCircle, Clock, Coins, Medal, ScrollText, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KNOCKOUT_SCORE_RULES } from '../../domain/worldCupEngine';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { DEFAULT_RULES_CONTENT, normalizeRulesContent, type RuleSection, type RulesContent } from './rulesContent';

type RulesRow = {
  version: number;
  sections: RuleSection[];
  updated_at: string | null;
};

type RulesAcknowledgementRow = {
  rules_version: number;
};

const LOCAL_RULES_ACK_KEY = 'mundial-app-rules-ack-version';

function renderRuleBody(body: string) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <div className="rule-line" key={`${line}-${index}`}>
        <span />
        <p>{line}</p>
      </div>
    ));
}

const knockoutRows = [
  { label: '16avos', exact: KNOCKOUT_SCORE_RULES.R32.exact, winner: KNOCKOUT_SCORE_RULES.R32.winner },
  { label: 'Octavos', exact: KNOCKOUT_SCORE_RULES.R16.exact, winner: KNOCKOUT_SCORE_RULES.R16.winner },
  { label: 'Cuartos', exact: KNOCKOUT_SCORE_RULES.QF.exact, winner: KNOCKOUT_SCORE_RULES.QF.winner },
  { label: 'Semis', exact: KNOCKOUT_SCORE_RULES.SF.exact, winner: KNOCKOUT_SCORE_RULES.SF.winner },
  { label: 'Final', exact: KNOCKOUT_SCORE_RULES.FINAL.exact, winner: KNOCKOUT_SCORE_RULES.FINAL.winner },
];

export function RulesPage() {
  const [rules, setRules] = useState<RulesContent>(DEFAULT_RULES_CONTENT);
  const [acceptedVersion, setAcceptedVersion] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const hasAcceptedCurrentRules = acceptedVersion >= rules.version;

  useEffect(() => {
    let isMounted = true;

    async function loadRules() {
      setIsLoading(true);
      setMessage('');

      let nextRules = DEFAULT_RULES_CONTENT;
      let nextUserId: string | null = null;
      let nextAcceptedVersion = 0;

      if (isSupabaseConfigured && supabase) {
        const { data: rulesRow } = await supabase.from('app_rules').select('version, sections, updated_at').eq('id', true).maybeSingle();
        if (rulesRow) {
          const row = rulesRow as RulesRow;
          nextRules = normalizeRulesContent({
            version: row.version,
            sections: row.sections,
            updatedAt: row.updated_at,
          });
        }

        const { data: userResult } = await supabase.auth.getUser();
        nextUserId = userResult.user?.id ?? null;

        if (nextUserId) {
          const { data: ackRow } = await supabase
            .from('rule_acknowledgements')
            .select('rules_version')
            .eq('user_id', nextUserId)
            .maybeSingle();
          nextAcceptedVersion = (ackRow as RulesAcknowledgementRow | null)?.rules_version ?? 0;
        } else {
          nextAcceptedVersion = Number(localStorage.getItem(LOCAL_RULES_ACK_KEY) ?? 0);
        }
      } else {
        nextAcceptedVersion = Number(localStorage.getItem(LOCAL_RULES_ACK_KEY) ?? 0);
      }

      if (!isMounted) return;
      setRules(nextRules);
      setUserId(nextUserId);
      setAcceptedVersion(nextAcceptedVersion);
      setIsLoading(false);
    }

    void loadRules();

    return () => {
      isMounted = false;
    };
  }, []);

  const acceptRules = async () => {
    if (hasAcceptedCurrentRules) return;

    if (isSupabaseConfigured && supabase && userId) {
      setIsSaving(true);
      setMessage('');

      const { error } = await supabase.from('rule_acknowledgements').upsert(
        {
          user_id: userId,
          rules_version: rules.version,
          accepted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      setIsSaving(false);

      if (error) {
        setMessage(`No pude guardar la lectura de reglas: ${error.message}`);
        return;
      }
    } else {
      localStorage.setItem(LOCAL_RULES_ACK_KEY, String(rules.version));
    }

    setAcceptedVersion(rules.version);
    window.dispatchEvent(new Event('rules-acknowledged'));
    setMessage('Reglas marcadas como leídas.');
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Porra entre amigos</p>
          <h1>Reglas</h1>
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando reglas...</p> : null}

      <section className="rules-hero">
        <ScrollText size={30} />
        <div>
          <h2>Antes de jugar, toca leerlas.</h2>
          <p>Primero lo importante de un vistazo. Abajo tienes el detalle completo por si alguien quiere hilar fino.</p>
        </div>
        <span className={hasAcceptedCurrentRules ? 'rules-status rules-status--accepted' : 'rules-status'}>
          {hasAcceptedCurrentRules ? 'Leídas' : 'Pendientes'}
        </span>
      </section>

      <section className="rules-quick-grid" aria-label="Resumen rápido de reglas">
        <article className="rules-summary-card rules-summary-card--primary">
          <Target size={22} />
          <span>Fase de grupos</span>
          <strong>3 / 1 / 0</strong>
          <p>3 exacto · 1 signo correcto · 0 fallo</p>
        </article>
        <article className="rules-summary-card">
          <Clock size={22} />
          <span>Límite</span>
          <strong>Saque inicial</strong>
          <p>Cuando empieza el partido, ya no se toca.</p>
        </article>
        <article className="rules-summary-card">
          <Coins size={22} />
          <span>Entrada</span>
          <strong>5 €</strong>
          <p>Por cabeza para entrar en la porra.</p>
        </article>
        <article className="rules-summary-card">
          <Trophy size={22} />
          <span>Premios</span>
          <strong>60 / 25 / 15</strong>
          <p>Primero, segundo y tercero.</p>
        </article>
      </section>

      <section className="rules-scoreboard">
        <div className="section-heading">
          <h2>Eliminatorias en una mirada</h2>
        </div>
        <div className="rules-scoreboard__grid">
          {knockoutRows.map((row) => (
            <div className="rules-score-row" key={row.label}>
              <strong>{row.label}</strong>
              <span>
                <b>{row.exact}</b> exacto
              </span>
              <span>
                <b>{row.winner}</b> clasificado
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rules-prize-strip" aria-label="Reparto de premios">
        <div>
          <Medal size={20} />
          <strong>1º</strong>
          <span>60%</span>
        </div>
        <div>
          <Medal size={20} />
          <strong>2º</strong>
          <span>25%</span>
        </div>
        <div>
          <Medal size={20} />
          <strong>3º</strong>
          <span>15%</span>
        </div>
      </section>

      <div className="rules-grid">
        {rules.sections.map((section) => (
          <article className="table-card rule-card" key={section.id}>
            <h2>{section.title}</h2>
            <div className="rule-card__body">{renderRuleBody(section.body)}</div>
          </article>
        ))}
      </div>

      <section className="rules-acceptance">
        <div>
          <strong>{hasAcceptedCurrentRules ? 'Ya has marcado estas reglas como leídas.' : 'Marca que has leído las reglas para tenerlo claro.'}</strong>
          <p>Si se editan más adelante, la app te volverá a pedir que confirmes la nueva versión.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => void acceptRules()} disabled={isSaving || hasAcceptedCurrentRules}>
          <CheckCircle size={16} />
          {isSaving ? 'Guardando...' : hasAcceptedCurrentRules ? 'Reglas leídas' : 'He leído las reglas'}
        </button>
      </section>
    </section>
  );
}
