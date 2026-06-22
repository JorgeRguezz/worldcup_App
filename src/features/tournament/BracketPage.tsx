import { demoMatches, teamName } from '../../data/demoTournament';
import { formatMadridDateTime } from '../../lib/format';

const stages = [
  { id: 'R32', label: 'Dieciseisavos' },
  { id: 'R16', label: 'Octavos' },
  { id: 'QF', label: 'Cuartos' },
  { id: 'SF', label: 'Semifinales' },
  { id: 'THIRD_PLACE', label: 'Tercer puesto' },
  { id: 'FINAL', label: 'Final' },
] as const;

export function BracketPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Cuadro único, generado con resultados oficiales</p>
          <h1>Cuadro</h1>
        </div>
      </div>

      <div className="bracket-board">
        {stages.map((stage) => (
          <section className="bracket-column" key={stage.id}>
            <h2>{stage.label}</h2>
            {demoMatches
              .filter((match) => match.stage === stage.id)
              .map((match) => (
                <article className="bracket-match" key={match.id}>
                  <span>M{match.fifaMatchNumber}</span>
                  <strong>{teamName(match.homeTeamId)}</strong>
                  <strong>{teamName(match.awayTeamId)}</strong>
                  <small>{formatMadridDateTime(match.kickoffAt)}</small>
                </article>
              ))}
          </section>
        ))}
      </div>
    </section>
  );
}
