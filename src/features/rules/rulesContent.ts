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
    id: 'puntuacion',
    title: 'Puntuación',
    body: 'Fase de grupos: +3 puntos por marcador exacto.\nFase de grupos: +1 punto si aciertas ganador o empate, aunque falle el marcador.\nFase de grupos: +0 puntos si no aciertas el signo del partido.\nEliminatorias: los puntos suben por ronda.\nEn eliminatorias puedes puntuar por marcador exacto o por acertar quién pasa/gana.\nSi no aciertas ni marcador exacto ni clasificado correcto, sumas +0.',
  },
  {
    id: 'como-se-juega',
    title: 'Cómo se juega',
    body: 'Entrada: 5 euros por cabeza.\nPuedes votar hasta antes de que empiece el partido.\nCuando empieza el partido, esa predicción queda bloqueada.\nEn eliminatorias, si predices empate, tienes que elegir qué equipo pasa.\nEl ranking se actualiza con los puntos de cada partido.\nSi hay un caso raro, se decide entre todos con sentido común y buen rollo.',
  },
  {
    id: 'premios',
    title: 'Reparto de premios',
    body: 'El bote se reparte entre los tres primeros.\nPrimer puesto: 60% del bote.\nSegundo puesto: 25% del bote.\nTercer puesto: 15% del bote.',
  },
];

export const DEFAULT_RULES_CONTENT: RulesContent = {
  version: DEFAULT_RULES_VERSION,
  sections: DEFAULT_RULE_SECTIONS,
  updatedAt: null,
};

export function normalizeRulesContent(value: Partial<RulesContent> | null | undefined): RulesContent {
  const parsedSections =
    Array.isArray(value?.sections) && value.sections.length > 0
      ? value.sections.map((section, index) => ({
          id: typeof section.id === 'string' && section.id ? section.id : `section-${index + 1}`,
          title: typeof section.title === 'string' && section.title ? section.title : `Sección ${index + 1}`,
          body: typeof section.body === 'string' ? section.body : '',
        }))
      : DEFAULT_RULE_SECTIONS;
  const requiredSectionIds = ['puntuacion', 'como-se-juega', 'premios'];
  const sections = requiredSectionIds.every((sectionId) => parsedSections.some((section) => section.id === sectionId))
    ? parsedSections
    : DEFAULT_RULE_SECTIONS;

  return {
    version: Number.isInteger(value?.version) && value!.version! > 0 ? value!.version! : DEFAULT_RULES_VERSION,
    sections,
    updatedAt: value?.updatedAt ?? null,
  };
}
