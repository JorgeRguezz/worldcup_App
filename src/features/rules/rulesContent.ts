export type RuleSection = {
  id: string;
  title: string;
  body: string;
};

export type RulesContent = {
  version: number;
  sections: RuleSection[];
  updatedAt?: string | null;
};

export const DEFAULT_RULES_VERSION = 1;

export const DEFAULT_RULE_SECTIONS: RuleSection[] = [
  {
    id: 'participacion',
    title: 'Cómo participar',
    body: 'La entrada de la porra es de 5 euros por cabeza.\nCada usuario participa con sus propias predicciones.\nLa porra se juega con los partidos del Mundial cargados en la app.',
  },
  {
    id: 'plazos',
    title: 'Plazos para predecir',
    body: 'Puedes poner o cambiar una predicción hasta que empiece el partido.\nEn cuanto el partido arranca, esa predicción queda bloqueada.\nSi no has verificado el resultado antes del saque inicial, esa predicción no cuenta.',
  },
  {
    id: 'fase-grupos',
    title: 'Puntuación en fase de grupos',
    body: 'Resultado exacto: 3 puntos.\nAciertas quién gana o si empatan, pero no el marcador exacto: 1 punto.\nNo aciertas el signo del partido: 0 puntos.\nEjemplo: pones 2-1 y queda 2-1, sumas 3. Pones 1-0 y queda 2-1, sumas 1. Pones empate y gana alguien, sumas 0.',
  },
  {
    id: 'eliminatorias',
    title: 'Puntuación en eliminatorias',
    body: 'En eliminatorias los puntos suben por ronda.\n16avos: exacto 6 puntos, clasificado correcto 2 puntos.\nOctavos: exacto 9 puntos, clasificado correcto 3 puntos.\nCuartos: exacto 12 puntos, clasificado correcto 4 puntos.\nSemifinales: exacto 15 puntos, clasificado correcto 5 puntos.\nTercer puesto: exacto 15 puntos, ganador correcto 5 puntos.\nFinal: exacto 30 puntos, campeón del partido correcto 10 puntos.\nSi no aciertas ni el marcador exacto ni el equipo que pasa/gana, sumas 0 puntos.',
  },
  {
    id: 'empates',
    title: 'Empates en eliminatorias',
    body: 'Si predices empate en una eliminatoria, tienes que elegir qué equipo avanza.\nEl marcador que pongas es el marcador oficial del partido en la app.\nPara sumar los puntos de clasificado correcto, el equipo elegido tiene que ser el que realmente pasa.',
  },
  {
    id: 'ranking',
    title: 'Ranking y desempates',
    body: 'El ranking se actualiza con los puntos que vaya dando cada partido.\nGana quien tenga más puntos al final del Mundial.\nSi hay empate en el ranking final, el grupo decidirá el criterio antes de repartir premios.',
  },
  {
    id: 'premios',
    title: 'Premios',
    body: 'El bote se reparte entre los tres primeros.\nPrimer puesto: 60% del bote.\nSegundo puesto: 25% del bote.\nTercer puesto: 15% del bote.',
  },
  {
    id: 'casos-especiales',
    title: 'Casos especiales',
    body: 'Si la organización cambia horarios, partidos o resultados oficiales, se actualizará la app con la información válida.\nSi hay algún caso raro que no esté escrito aquí, se resolverá entre todos con sentido común y buen rollo.',
  },
];

export const DEFAULT_RULES_CONTENT: RulesContent = {
  version: DEFAULT_RULES_VERSION,
  sections: DEFAULT_RULE_SECTIONS,
  updatedAt: null,
};

export function normalizeRulesContent(value: Partial<RulesContent> | null | undefined): RulesContent {
  const sections =
    Array.isArray(value?.sections) && value.sections.length > 0
      ? value.sections.map((section, index) => ({
          id: typeof section.id === 'string' && section.id ? section.id : `section-${index + 1}`,
          title: typeof section.title === 'string' && section.title ? section.title : `Sección ${index + 1}`,
          body: typeof section.body === 'string' ? section.body : '',
        }))
      : DEFAULT_RULE_SECTIONS;

  return {
    version: Number.isInteger(value?.version) && value!.version! > 0 ? value!.version! : DEFAULT_RULES_VERSION,
    sections,
    updatedAt: value?.updatedAt ?? null,
  };
}
