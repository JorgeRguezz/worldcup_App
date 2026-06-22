import { Clock, Coins, Medal, ScrollText, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KNOCKOUT_SCORE_RULES } from '../../domain/worldCupEngine';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { DEFAULT_RULES_CONTENT, normalizeRulesContent, type RuleSection, type RulesContent } from './rulesContent';

type RulesRow = {
  version: number;
  sections: RuleSection[];
  updated_at: string | null;
};

function formatRulePointsCopy(line: string): string {
  return line
    .replace(/(?<!\+)\b([0-9]+)\s+puntos?\b/g, (_match, points) => (points === '1' ? '+1 punto' : `+${points} puntos`))
    .replace(/\bsumas\s+([0-9]+)\b/g, 'sumas +$1');
}

function renderRuleBody(body: string) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <div className="rule-line" key={`${line}-${index}`}>
        <span />
        <p>{formatRulePointsCopy(line)}</p>
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
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const getSection = (sectionId: string) =>
    rules.sections.find((section) => section.id === sectionId) ?? DEFAULT_RULES_CONTENT.sections.find((section) => section.id === sectionId)!;

  useEffect(() => {
    let isMounted = true;

    async function loadRules() {
      setIsLoading(true);

      let nextRules = DEFAULT_RULES_CONTENT;

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
      }

      if (!isMounted) return;
      setRules(nextRules);
      setIsLoading(false);
    }

    void loadRules();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Porra entre amigos</p>
          <h1>Reglas</h1>
        </div>
      </div>

      {isLoading ? <p className="empty-state">Cargando reglas...</p> : null}

      <section className="rules-hero">
        <ScrollText size={30} />
        <div>
          <h2>Reglas de la porra</h2>
          <p>Tres cosas: cómo se puntúa, cómo se juega y cómo se reparte el bote.</p>
        </div>
      </section>

      <section className="rules-topic">
        <div className="rules-topic__heading">
          <Target size={24} />
          <h2>Puntuación</h2>
        </div>

        <div className="rules-quick-grid" aria-label="Puntuación fase de grupos">
          <article className="rules-summary-card rules-summary-card--primary">
            <span>Marcador exacto</span>
            <strong>+3 pts</strong>
            <p>Clavas el resultado.</p>
          </article>
          <article className="rules-summary-card">
            <span>Signo correcto</span>
            <strong>+1 pt</strong>
            <p>Aciertas ganador o empate.</p>
          </article>
          <article className="rules-summary-card">
            <span>Fallo</span>
            <strong>+0 pts</strong>
            <p>No aciertas lo que pasa.</p>
          </article>
        </div>

        <section className="rules-scoreboard">
          <h3>Eliminatorias</h3>
          <div className="rules-scoreboard__grid">
            {knockoutRows.map((row) => (
              <div className="rules-score-row" key={row.label}>
                <strong>{row.label}</strong>
                <span>
                  <b>+{row.exact}</b> exacto
                </span>
                <span>
                  <b>+{row.winner}</b> clasificado
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="rule-card__body rules-topic__notes">{renderRuleBody(getSection('puntuacion').body)}</div>
      </section>

      <section className="rules-topic">
        <div className="rules-topic__heading">
          <Clock size={24} />
          <h2>Cómo se juega</h2>
        </div>

        <div className="rules-quick-grid rules-quick-grid--play">
          <article className="rules-summary-card">
            <Coins size={22} />
            <span>Entrada</span>
            <strong>5 €</strong>
            <p>Por cabeza.</p>
          </article>
          <article className="rules-summary-card rules-summary-card--primary">
            <Clock size={22} />
            <span>Límite</span>
            <strong>Antes de empezar</strong>
            <p>Después del saque inicial se bloquea.</p>
          </article>
          <article className="rules-summary-card">
            <Trophy size={22} />
            <span>Eliminatorias</span>
            <strong>Elige quién pasa</strong>
            <p>Obligatorio si pones empate.</p>
          </article>
        </div>

        <div className="rule-card__body rules-topic__notes">{renderRuleBody(getSection('como-se-juega').body)}</div>
      </section>

      <section className="rules-topic">
        <div className="rules-topic__heading">
          <Medal size={24} />
          <h2>Reparto de premios</h2>
        </div>

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

        <div className="rule-card__body rules-topic__notes">{renderRuleBody(getSection('premios').body)}</div>
      </section>

    </section>
  );
}
