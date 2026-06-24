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
    body: 'Fase de grupos: +3 puntos por marcador exacto y +1 por acertar ganador o empate.\nDieciseisavos: +6 exacto y +2 clasificado.\nOctavos: +9 exacto y +3 clasificado.\nCuartos: +12 exacto y +4 clasificado.\nSemifinales: +15 exacto y +5 clasificado.\nTercer puesto: +12 exacto y +4 ganador.\nFinal: +24 exacto y +8 ganador.\nLa predicción especial suma: campeón +30, mejor jugador +20, máximo goleador +12 y máximo asistente +12.',
  },
  {
    id: 'como-se-juega',
    title: 'Cómo se juega',
    body: 'Entrada: 5 euros por cabeza.\nPuedes votar cada partido hasta antes de que empiece.\nLa predicción especial se puede modificar hasta que termine la fase de grupos.\nCuando empieza un partido o cierra la fase de grupos, esa predicción queda bloqueada.\nEn eliminatorias, si predices empate, tienes que elegir qué equipo pasa.\nEl ranking se actualiza con los puntos de cada partido y con los premios oficiales al acabar el torneo.\nSi hay un caso raro, se decide entre todos con sentido común y buen rollo.',
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
